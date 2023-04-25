import React, { useState, useRef, useEffect } from "react";
import Mousetrap from "mousetrap";
import { DateTime } from "luxon";
import { v4 as uuidv4 } from "uuid";
import { MdRotateLeft, MdRotateRight } from "react-icons/md";
import { BsHeart, BsHeartFill } from "react-icons/bs";
import { TbDownload } from "react-icons/tb";
import { parseVrchatScreenshotName } from "../../../../main/src/standalone/modules/vrcScreenshotsUtil.js";
import styles from "./styles";
import Tags from "../Tags.js";
import { TiUserAdd } from "react-icons/ti";
import TagPicker from "./TagPicker.js";
import Collapsable from "../Collapsable/index.js";

const useOutsideAlerter = (ref, onOutsideClick) => {
  useEffect(() => {
    function handleClickOutside(e) {
      if (e.target.tagName === "svg" || e.target.tagName === "path") return;
      if (ref.current && !ref.current.contains(e.target)) onOutsideClick(e);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onOutsideClick, ref]);
};

const Zoomed = ({
  counter,
  image,
  onOutsideClick,
  onNext,
  onPrev,
  cacheBust,
  onRotate,
  assetPath,
  imageContext
}) => {
  const wrapperRef = useRef(null);
  const imgRef = useRef(null);
  const [imageMetadata, setImageMetadata] = useState({});
  const [showTagPickerAt, setShowTagPickerAt] = useState(null);
  const [mouseDown, setMouseDown] = useState({ top: 0, left: 0 });
  const [mouseDownNormalized, setMouseDownNormalized] = useState();
  const [notes, setNotes] = useState("");

  const patchMetadata = (patch, updateDb = true) => {
    setImageMetadata((data) => {
      const dbUpdate = { ...data, ...patch };
      setNotes(dbUpdate.notes);
      delete dbUpdate.context;
      if (updateDb) window.databaseAPI.screenshotSet(dbUpdate);
      return { ...data, ...patch };
    });
  };

  // Retrieve or initialize image metadata
  useEffect(() => {
    if (!image) return;

    const getMetadata = async () => {
      const metaData = await window.databaseAPI.screenshotGet(
        image.data.fileName
      );
      if (metaData[0]) {
        console.log(metaData[0]);
        patchMetadata({ ...metaData[0], context: imageContext }, false);
      } else {
        const initialData = {
          filename: image.data.fileName,
          wrld_id: imageContext.world.name,
          photographer:
            imageContext.players.length === 1 ? imageContext.players[0] : "",
          usrs_in_image: [],
          usrs_in_world: imageContext.players,
          tags: [],
          favorite: false,
          notes: ""
        };
        patchMetadata({ ...initialData, context: imageContext });
      }
    };
    getMetadata();
  }, [image]);

  // UI cleanup helper
  const cleanupThen = (cb) => {
    setShowTagPickerAt(null);
    cb();
  };

  // On Outside Click
  useOutsideAlerter(wrapperRef, (e) => {
    if (showTagPickerAt) return;
    if (e.target.className !== "button") cleanupThen(onOutsideClick);
  });

  // Rotation handlers
  const rotate = (deg) => {
    window.databaseAPI.rotateImage(image.data.fileName, deg, () => {
      onRotate();
      const newSrc = `${imgRef.current.src.split("?")[0]}?id=${uuidv4()}`;
      imgRef.current.src = newSrc;
    });
  };
  const onRotateLeft = () => rotate(-90);
  const onRotateRight = () => rotate(90);
  const onDownload = () => window.databaseAPI.exportAsset(image.data.fileName);

  // Mousetrap
  Mousetrap.bind("esc", () => cleanupThen(onOutsideClick), "keyup");
  Mousetrap.bind("right", () => cleanupThen(onNext), "keyup");
  Mousetrap.bind("left", () => cleanupThen(onPrev), "keyup");
  Mousetrap.bind("l", () => cleanupThen(onRotateLeft), "keyup");
  Mousetrap.bind("r", () => cleanupThen(onRotateRight), "keyup");
  Mousetrap.bind("d", () => cleanupThen(onDownload), "keyup");

  if (!image) return null;
  const parsedFilename = parseVrchatScreenshotName(image.data.fileName);
  const imgSrcPath = `${assetPath}/${parsedFilename.year}/${
    parsedFilename.month
  }/${image.data.fileName.replace(".png", "")}`;
  const imgSrc_preview = `${imgSrcPath}/preview.png`;

  const positionedTags = imageMetadata.usrs_in_image?.map((item) =>
    JSON.parse(item)
  );
  if (!imageMetadata) return null;
  return (
    <div style={styles.zoomContainer}>
      {showTagPickerAt && (
        <TagPicker
          onSelect={(tag) => {
            const usrs_in_image = imageMetadata.usrs_in_image
              ? [...imageMetadata.usrs_in_image]
              : [];
            if (!usrs_in_image.includes(tag))
              usrs_in_image.push(
                JSON.stringify({ position: mouseDownNormalized, tag: tag })
              );
            patchMetadata({ usrs_in_image });
          }}
          top={mouseDown.top}
          left={mouseDown.left}
          onOutsideClick={() => {
            setShowTagPickerAt(null);
          }}
          point={showTagPickerAt}
          imageMetadata={imageMetadata}
          imageContext={imageContext}
        />
      )}
      <div style={styles.zoomNavbar}>
        <div>
          <div>{counter}</div>
          <div>
            {DateTime.fromMillis(image.ts).toLocaleString(
              DateTime.DATETIME_FULL
            )}
          </div>
        </div>
        <div style={{ flexGrow: 1 }} />
        <div className="button" onClick={onDownload}>
          <TbDownload
            style={{
              fontSize: "2rem",
              margin: "0 .25rem .25rem 0"
            }}
          />
        </div>
        <div className="button" onClick={onRotateLeft}>
          <MdRotateLeft style={{ fontSize: "2rem" }} />
        </div>
        <div className="button" onClick={onRotateRight}>
          <MdRotateRight style={{ fontSize: "2rem" }} />
        </div>
      </div>
      <div style={styles.zoomModalOverlay}>
        <div
          className="button"
          onClick={() => patchMetadata({ favorite: !imageMetadata.favorite })}
          style={styles.favoriteButton}
        >
          {(imageMetadata.favorite && <BsHeartFill />) || <BsHeart />}
        </div>
        <div ref={wrapperRef} style={styles.zoomImgWrapper}>
          {positionedTags?.map((item, idx) => (
            <div
              key={idx}
              style={{
                position: "absolute",
                display: "flex",
                opacity: "0.5",
                flexDirection: "row",
                background: "white",
                marginRight: "0.4rem",
                padding: "0.2rem 1rem",
                fontWeight: "900",
                fontSize: ".8rem",
                borderRadius: "1rem",
                minWidth: "100px",
                textAlign: "center",
                margin: ".2rem .2rem .2rem 0",
                boxShadow: "rgb(0 0 0) 0px 0px 9px 3px",
                top: `${imgRef.current?.height * item.position.x}px`,
                left: `${imgRef.current?.width * item.position.y - 50}px`
              }}
            >
              <div style={{ margin: "auto" }}>{item.tag}</div>
            </div>
          ))}
          <img
            draggable={false}
            key={cacheBust}
            ref={imgRef}
            onContextMenu={(e) => {
              const bounds = imgRef.current.getBoundingClientRect();
              const normalizedPoint = {
                x: (e.clientY - bounds.top) / imgRef.current.height,
                y: (e.clientX - bounds.left) / imgRef.current.width
              };
              setMouseDownNormalized(normalizedPoint);
              setMouseDown({ top: e.clientY, left: e.clientX });
              setShowTagPickerAt(normalizedPoint);
            }}
            onClick={(e) => {
              if (e.clientX < window.innerWidth / 2) {
                onPrev();
              } else {
                onNext();
              }
            }}
            alt={image.data.fileName}
            style={styles.zoomImg}
            src={`${imgSrc_preview}?id=${cacheBust}`}
          />
          {imageMetadata.context && (
            <div
              style={{
                background: "#ffffff99",
                padding: "1rem",
                color: "white"
              }}
            >
              <div style={{ color: "white" }}>
                <div style={{ background: "#ffffff99", padding: "1rem" }}>
                  <div style={styles.row}>
                    <div style={styles.rowLabel}>World:</div>
                    <div>
                      <a href={imageMetadata.context.world.url} target="_blank">
                        {imageMetadata.context.world.name}
                      </a>
                    </div>
                  </div>
                  <div style={styles.row}>
                    <div style={styles.rowLabel}>Photographer:</div>
                    <div>
                      <Tags
                        onClick={() => patchMetadata({ photographer: "" })}
                        color="#3f3f3f"
                        tags={[imageMetadata.photographer]}
                      />
                    </div>
                  </div>
                  <div style={styles.row}>
                    <div style={styles.rowLabel}>People:</div>
                    <div>
                      <Tags
                        removable={true}
                        onAction={(tag) => {
                          const newPlayerList = [
                            ...imageMetadata.usrs_in_image
                          ];
                          const index = newPlayerList.indexOf(tag);
                          newPlayerList.splice(index, 1);
                          patchMetadata({ usrs_in_image: newPlayerList });
                        }}
                        color="#3f3f3f"
                        tags={imageMetadata.usrs_in_image}
                      />
                    </div>
                  </div>
                  <div style={styles.row}>
                    <div style={styles.rowLabel}>Tags:</div>
                    <div>
                      <Tags tags={imageMetadata.tags} />
                    </div>
                  </div>
                  <div style={styles.row}>
                    <div style={styles.rowLabel}>Notes:</div>
                    <div>
                      <input
                        onBlur={(e) => patchMetadata({ notes: e.target.value })}
                        onChange={(e) => setNotes(e.target.value)}
                        type="text"
                        value={notes ? notes : ""}
                      />
                    </div>
                  </div>
                </div>
                <div style={{ margin: "1rem 0 0 0 " }}>
                  <div style={{ ...styles.row, maxWidth: "50rem" }}>
                    <Collapsable
                      isOpen={false}
                      title={
                        <div style={styles.rowLabel}>Players In World</div>
                      }
                    >
                      <div style={{ height: "10rem", overflow: "scroll" }}>
                        <Tags
                          actionIcon={<TiUserAdd />}
                          onAction={(tag) => {
                            const usrs_in_image = [
                              ...imageMetadata.usrs_in_image
                            ];
                            if (!usrs_in_image.includes(tag))
                              usrs_in_image.push(tag);
                            patchMetadata({ usrs_in_image });
                          }}
                          color="#757575"
                          colorSelected="#3f3f3f"
                          tags={imageMetadata.context.players}
                          selected={imageMetadata.usrs_in_image}
                        />
                      </div>
                    </Collapsable>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
export default Zoomed;
