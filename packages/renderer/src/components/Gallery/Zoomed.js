import React, { useState, useRef, useEffect } from "react";
import { DateTime } from "luxon";
import { v4 as uuidv4 } from "uuid";
import { BsHeart, BsHeartFill } from "react-icons/bs";
import { parseVrchatScreenshotName } from "../../../../main/src/standalone/modules/vrcScreenshotsUtil.js";
import styles from "./styles";
import TagPicker from "./TagPicker.js";
import EditableTagset from "../EditableTagset.js";
import PeopleInWorld from "./PeopleInWorld.js";
import Photographer from "./Photographer.js";
import PeopleInImage from "./PeopleInImage.js";
import EditableText from "../EditableText.js";
import PositionedTag from "./PositionedTag.js";
import { MdRotateLeft, MdRotateRight } from "react-icons/md";
import { TbDownload } from "react-icons/tb";
import useMousetrap from "../../modules/react-hook-mousetrap.js";

const useOutsideAlerter = (ref, onOutsideClick) => {
  useEffect(() => {
    function handleClickOutside(e) {
      if (e.target.tagName === "svg" || e.target.tagName === "path") return;
      if (ref.current && !ref.current?.contains(e.target)) onOutsideClick(e);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onOutsideClick, ref]);
};

const FullZoom = ({ isVisible, isPortrait, src }) => {
  const imageRef = useRef(null);
  const [display, setDisplay] = useState(isVisible ? "flex" : "none");
  useEffect(() => {
    if (isVisible) {
      imageRef.current.style.animation = "zoomToLarge .25s";
      setDisplay("flex");
    } else {
      imageRef.current.style.animation = "zoomToSmall .25s";
      setTimeout(() => setDisplay("none"), 200);
    }
  }, [isVisible]);
  return (
    <div
      ref={imageRef}
      style={{
        position: "fixed",
        display,
        width: "100vw",
        height: "100vh",
        zIndex: 5,
        background: "#000000"
      }}
    >
      <img
        src={src.replaceAll("preview", "original")}
        style={
          isPortrait
            ? { margin: "auto", width: "100vw", objectFit: "contain" }
            : { margin: "auto", height: "100vh", objectFit: "contain" }
        }
      />
    </div>
  );
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
  const containerRef = useRef(null);
  const imgRef = useRef(null);
  const refZoomedPanel = useRef(null);

  const [fullZoom, setFullZoom] = useState(false);
  const [imageMetadata, setImageMetadata] = useState(null);
  const [showTagPicker, setShowTagPicker] = useState(null);
  const [mouseDown, setMouseDown] = useState({ top: 0, left: 0 });
  const [mouseDownNormalized, setMouseDownNormalized] = useState();
  const [, updateState] = React.useState();
  const forceUpdate = React.useCallback(() => updateState({}), []);

  const onDownload = () => window.databaseAPI.exportAsset(image?.data.fileName);
  useMousetrap("space", () => setFullZoom(!fullZoom), "keyup");
  useMousetrap("esc", onOutsideClick, "keyup");
  useMousetrap("right", onNext, "keyup");
  useMousetrap("left", onPrev, "keyup");
  useMousetrap("l", () => rotate(-90), "keyup");
  useMousetrap("r", () => rotate(90), "keyup");
  useMousetrap("d", onDownload, "keyup");
  useMousetrap(
    "f",
    () => patchMetadata({ favorite: !imageMetadata.favorite }),
    "keyup"
  );

  // Update metadata (localstate and db)
  const patchMetadata = (patch, updateDb = true) => {
    setImageMetadata((data) => {
      //console.log(Date.now() + " CALLING...." + image.data.fileName);
      const dbUpdate = { ...data, ...patch };
      delete dbUpdate.context;
      if (updateDb) window.databaseAPI.screenshotSet(dbUpdate);
      return { ...data, ...patch };
    });
  };

  // Retrieve or initialize image metadata
  useEffect(() => {
    if (image) {
      const getMetadata = async () => {
        const metaData = await window.databaseAPI.screenshotGet(
          image.data.fileName
        );
        if (metaData[0]) {
          patchMetadata({ ...metaData[0], context: imageContext }, false);
        } else {
          const initialData = {
            filename: image.data.fileName,
            wrld_id: imageContext.world.name,
            photographer:
              imageContext.players.length === 1 ? imageContext.players[0] : "",
            usrs_in_world: imageContext.players,
            favorite: false,
            notes: ""
          };
          patchMetadata({ ...initialData, context: imageContext });
        }
      };
      getMetadata();
      forceUpdate();
    }
  }, [image]);

  // On Outside Click
  useOutsideAlerter(containerRef, (e) => {
    if (showTagPicker) return;
    if (e.target.className !== "button") onOutsideClick();
  });

  // Rotation handler
  const rotate = (deg) => {
    if (fullZoom) return;
    if (refZoomedPanel.current)
      refZoomedPanel.current.style.visibility = "hidden";
    const rotateCoordinates = (coordinates, degrees) => {
      degrees = degrees === -90 ? 270 : 90;
      const radians = degrees * (Math.PI / 180);
      const { x, y } = coordinates;
      const sin = Math.sin(radians);
      const cos = Math.cos(radians);
      const rot = {
        x: cos * (x - 0.5) + sin * (y - 0.5),
        y: cos * (y - 0.5) - sin * (x - 0.5)
      };
      return {
        x: rot.x + 0.5,
        y: rot.y + 0.5
      };
    };

    const rotatedUserTags = imageMetadata.usrs_in_image?.map((item) => {
      item = JSON.parse(item);
      const rc = rotateCoordinates(item.position, deg);
      return {
        ...item,
        position: {
          x: rc.x,
          y: rc.y
        }
      };
    });

    window.databaseAPI.rotateImage(image.data.fileName, deg, () => {
      onRotate();
      const newSrc = `${imgRef.current.src.split("?")[0]}?id=${uuidv4()}`;
      imgRef.current.src = newSrc;
    });

    const usrs_in_image = rotatedUserTags
      ? rotatedUserTags.map((item) => JSON.stringify(item))
      : [];

    patchMetadata({ usrs_in_image });
  };

  if (!image) return null;
  const parsedFilename = parseVrchatScreenshotName(image.data.fileName);
  const imgSrcPath = `${assetPath}/${parsedFilename.year}/${
    parsedFilename.month
  }/${image.data.fileName.replace(".png", "")}`;
  const imgSrc_preview = `${imgSrcPath}/preview.png`;

  const jsonParse = (data) => {
    try {
      return JSON.parse(data);
    } catch {
      return null;
    }
  };

  const positionedTags = imageMetadata?.usrs_in_image
    ?.map((item) => jsonParse(item))
    .filter(Boolean);
  if (!imageMetadata) return null;
  return (
    <div style={styles.zoomContainer}>
      <FullZoom
        isVisible={fullZoom}
        isPortrait={imgRef.current?.clientWidth > imgRef.current?.clientHeight}
        src={`${imgSrc_preview}?id=${cacheBust}`}
      />
      {showTagPicker && (
        <TagPicker
          top={mouseDown.top}
          left={mouseDown.left}
          onSelect={(tag) => {
            if (showTagPicker === "photographer") {
              patchMetadata({ photographer: tag });
            } else {
              const usrs_in_image = imageMetadata.usrs_in_image
                ? [...imageMetadata.usrs_in_image]
                : [];
              if (!usrs_in_image.includes(tag))
                usrs_in_image.push(
                  JSON.stringify({ position: mouseDownNormalized, tag: tag })
                );
              patchMetadata({ usrs_in_image });
            }
          }}
          onOutsideClick={() => setShowTagPicker(null)}
          imageMetadata={imageMetadata}
        />
      )}

      <div ref={containerRef} style={{ ...styles.zoomModalOverlay }}>
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            position: "absolute",
            top: 56,
            zIndex: 1,
            left: 60,
            width: "89%",
            margin: "auto",
            fontSize: "1rem",
            color: "white"
          }}
        >
          <div>
            <div>
              <div style={{ fontWeight: 900 }}>{counter}</div>
              <div style={{ fontWeight: 900 }}>
                {imageMetadata.context.world.name}
              </div>
              <div style={{ opacity: "0.7" }}></div>
            </div>
          </div>
          <div style={{ flexGrow: 1, textAlign: "center", opacity: "0.7" }}>
            {image.data.fileName}
            <br />
            {DateTime.fromMillis(image.ts).toLocaleString(
              DateTime.DATETIME_FULL
            )}
          </div>
          <div
            className="button"
            onClick={onDownload}
            style={styles.favoriteButton}
          >
            <TbDownload
              style={{
                fontSize: "2rem",
                margin: "0 .25rem .25rem 0"
              }}
            />
          </div>
          <div
            className="button"
            onClick={() => rotate(-90)}
            style={styles.favoriteButton}
          >
            <MdRotateLeft style={{ fontSize: "2rem" }} />
          </div>
          <div
            className="button"
            onClick={() => rotate(90)}
            style={styles.favoriteButton}
          >
            <MdRotateRight style={{ fontSize: "2rem" }} />
          </div>
          <div
            className="button"
            onClick={() => patchMetadata({ favorite: !imageMetadata.favorite })}
            style={styles.favoriteButton}
          >
            {(imageMetadata.favorite && <BsHeartFill />) || <BsHeart />}
          </div>
        </div>
        <div style={styles.zoomImgWrapper}>
          <div
            style={{
              width: "100%",
              height: 700,
              display: "flex"
            }}
          >
            <div
              style={{ position: "relative", display: "flex", margin: "auto" }}
              ref={refZoomedPanel}
            >
              {positionedTags?.map((item, idx) => {
                let top = imgRef.current?.height * item.position.x;
                let left = imgRef.current?.clientWidth * item.position.y;
                left -= 60; //tag width
                return (
                  <PositionedTag
                    key={`pt_${idx}`}
                    tag={item.tag}
                    top={top}
                    left={left}
                  />
                );
              })}
              <div
                style={{
                  margin: "auto",
                  width: "100%"
                }}
              >
                <img
                  ref={imgRef}
                  draggable={false}
                  key={`${image.data.fileName}${cacheBust}`}
                  onContextMenu={(e) => {
                    const bounds = imgRef.current?.getBoundingClientRect();
                    const normalizedPoint = {
                      x: (e.clientY - bounds.top) / imgRef.current?.height,
                      y: (e.clientX - bounds.left) / imgRef.current?.width
                    };
                    setMouseDownNormalized(normalizedPoint);
                    setMouseDown({ top: e.clientY, left: e.clientX });
                    setShowTagPicker(true);
                  }}
                  onClick={(e) => {
                    if (e.clientX < window.innerWidth / 2) {
                      onPrev();
                    } else {
                      onNext();
                    }
                  }}
                  style={styles.zoomImg}
                  src={`${imgSrc_preview}?id=${cacheBust}`}
                  onLoad={() => {
                    forceUpdate();
                    if (refZoomedPanel.current)
                      refZoomedPanel.current.style.visibility = "visible";
                  }}
                />
              </div>
            </div>
          </div>
          {imageMetadata.context && (
            <div style={styles.metadataPanel}>
              <EditableText
                styles={styles}
                value={imageMetadata.notes}
                onChange={(e) => patchMetadata({ notes: e.target.value })}
              />
              <Photographer
                photographer={imageMetadata.photographer}
                onRemove={() => patchMetadata({ photographer: "" })}
                onAdd={(e) => {
                  setShowTagPicker("photographer");
                  setMouseDown({ top: e.clientY, left: e.clientX });
                }}
              />
              <PeopleInImage
                onRemove={(tag) => {
                  const newPlayerList = [...imageMetadata.usrs_in_image];
                  const index = newPlayerList.indexOf(tag);
                  newPlayerList.splice(index, 1);
                  patchMetadata({ usrs_in_image: newPlayerList });
                }}
                peopleInWorld={imageMetadata.usrs_in_image}
              />
              <EditableTagset
                styles={styles}
                tags={imageMetadata.tags}
                onChange={(e) => patchMetadata({ tags: e.target.value })}
              />

              <PeopleInWorld
                people={imageMetadata.context.players}
                peopleInImage={imageMetadata.usrs_in_image}
                onAction={(tag) => {
                  const usrs_in_image = [...imageMetadata.usrs_in_image];
                  if (!usrs_in_image.includes(tag)) usrs_in_image.push(tag);
                  patchMetadata({ usrs_in_image });
                }}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
export default React.memo(Zoomed);
