import React, { useState, useRef, useEffect } from "react";
import Mousetrap from "mousetrap";
import { DateTime } from "luxon";
import { v4 as uuidv4 } from "uuid";

const useOutsideAlerter = (ref, onOutsideClick) => {
  useEffect(() => {
    function handleClickOutside(e) {
      if (ref.current && !ref.current.contains(e.target)) onOutsideClick(e);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onOutsideClick, ref]);
};

const parseVrchatScreenshotName = (fileName) => {
  if (!fileName) return null;
  const fileNameSplit = fileName.replaceAll("NYE23-", "NYE23_").split("_");
  const metaData = fileNameSplit[1].includes("x")
    ? {
        month: fileNameSplit[2]?.split("-")[1],
        day: fileNameSplit[2]?.split("-")[2],
        year: fileNameSplit[2]?.split("-")[0],
        width: fileNameSplit[1]?.split("x")[0],
        height: fileNameSplit[1]?.split("x")[1]
      }
    : {
        month: fileNameSplit[1]?.split("-")[1],
        day: fileNameSplit[1]?.split("-")[2],
        year: fileNameSplit[1]?.split("-")[0],
        width: parseInt(fileNameSplit[3]?.split("x")[0], 10),
        height: parseInt(fileNameSplit[3]?.split("x")[1], 10)
      };
  return metaData;
};

const Zoomed = ({
  counter,
  currentImage,
  onOutsideClick,
  onNext,
  onPrev,
  cacheBust,
  onRotate,
  assetPath
}) => {
  const wrapperRef = useRef(null);
  const imgRef = useRef(null);
  useOutsideAlerter(wrapperRef, (e) => {
    if (e.target.className !== "button") onOutsideClick();
  });

  const rotate = (deg) => {
    window.databaseAPI.rotateImage(currentImage.data.fileName, deg, () => {
      onRotate();
      const newSrc = `${imgRef.current.src.split("?")[0]}?id=${uuidv4()}`;
      imgRef.current.src = newSrc;
    });
  };

  const onRotateLeft = () => rotate(-90);

  const onRotateRight = () => rotate(90);

  const onDownload = () =>
    window.databaseAPI.exportAsset(currentImage.data.fileName);

  Mousetrap.bind("esc", onOutsideClick, "keyup");
  Mousetrap.bind("right", onNext, "keyup");
  Mousetrap.bind("left", onPrev, "keyup");
  Mousetrap.bind("l", onRotateLeft, "keyup");
  Mousetrap.bind("r", onRotateRight, "keyup");
  Mousetrap.bind("d", onDownload, "keyup");

  if (!currentImage) return null;
  const metaData = parseVrchatScreenshotName(currentImage.data.fileName);
  const imgSrcPath = `${assetPath}/${metaData.year}/${
    metaData.month
  }/${currentImage.data.fileName.replace(".png", "")}`;
  const imgSrc_preview = `${imgSrcPath}/preview.png`;
  return (
    <div style={styles.zoomContainer}>
      <div style={styles.zoomNavbar}>
        <div>
          <div>{counter}</div>
          <div>
            {DateTime.fromMillis(currentImage.ts).toLocaleString(
              DateTime.DATETIME_FULL
            )}
          </div>
        </div>
        <div style={{ flexGrow: 1 }} />
        <div className="button" onClick={onDownload}>
          [download]
        </div>
        <div className="button" onClick={onRotateLeft}>
          [rotate L]
        </div>
        <div className="button" onClick={onRotateRight}>
          [rotate R]
        </div>
      </div>
      <div style={styles.zoomModalOverlay}>
        <div ref={wrapperRef} style={styles.zoomImgWrapper}>
          <img
            key={cacheBust}
            ref={imgRef}
            onClick={(e) => {
              if (e.clientX < window.innerWidth / 2) {
                onPrev();
              } else {
                onNext();
              }
            }}
            alt={currentImage.data.fileName}
            style={styles.zoomImg}
            src={`${imgSrc_preview}?id=${cacheBust}`}
          />
        </div>
      </div>
    </div>
  );
};

const Gallery = ({ screenshots, onExport }) => {
  const [prevImage, setPrevImage] = useState(null);
  const [nextImage, setNextImage] = useState(null);
  const [currentImage, _setCurrentImage] = useState(null);
  const [cacheBust, setCacheBust] = useState(uuidv4());

  const [prefsPath, setPrefsPath] = useState("");
  useEffect(() => {
    const fetchData = async () => {
      const data = await window.databaseAPI.preferencesGet();

      setPrefsPath(data.dataDir);
    };
    fetchData();
  }, []);
  const assetPath = encodeURI(`asset://${prefsPath}/assets`);

  const setCurrentImage = (value) => {
    const nextIdx =
      screenshots.indexOf(value) + 1 < screenshots.length
        ? screenshots.indexOf(value) + 1
        : 0;
    const prevIdx =
      screenshots.indexOf(value) - 1 >= 0
        ? screenshots.indexOf(value) - 1
        : screenshots.length - 1;

    setNextImage(screenshots[nextIdx]);
    setPrevImage(screenshots[prevIdx]);
    _setCurrentImage(value);
  };
  return (
    <div key={cacheBust}>
      <Zoomed
        assetPath={assetPath}
        cacheBust={cacheBust}
        onRotate={() => setCacheBust(uuidv4())}
        counter={`${screenshots.indexOf(currentImage) + 1} of ${
          screenshots.length
        }`}
        currentImage={currentImage}
        onNext={() => setCurrentImage(nextImage)}
        onPrev={() => setCurrentImage(prevImage)}
        onOutsideClick={() => setCurrentImage(null)}
      />
      <div>
        <div>
          <h3>{screenshots.length} screenshots</h3>
        </div>
        <div style={{ marginRight: "3rem" }} onClick={onExport}>
          [export]
        </div>
      </div>
      <div style={styles.gallery}>
        {screenshots.map((image, idx) => {
          const metaData = parseVrchatScreenshotName(image.data.fileName);
          const thumbnailUrl = `${assetPath}/${metaData.year}/${
            metaData.month
          }/${image.data.fileName.replace(
            ".png",
            ""
          )}/thumbnail.png?id=${uuidv4()}`;
          return (
            <div
              onClick={() => setCurrentImage(image)}
              key={idx}
              style={styles.galleryImgWrapper}
            >
              <img
                draggable={false}
                style={styles.galleryImg}
                alt={image.data.fileName}
                src={thumbnailUrl}
                onError={({ currentTarget }) => {
                  console.log(currentTarget.src);
                  currentTarget.onerror = null;
                  currentTarget.src = "/assets/missing.png";
                }}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
};

///Users/andrew/Library/Application%20Support/trip-report-app/config.json/assets/2022/04/VRChat_1920x1080_2022-04-05_02-09-24.581/thumbnail.png?id=d4018a25-8934-449f-8ee5-28e99ac5f642
export default Gallery;
const styles = {
  gallery: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    flexWrap: "wrap"
  },
  galleryImgWrapper: {
    width: "150px",
    height: "100px",
    overflow: "hidden",
    margin: ".2rem"
  },
  galleryImg: { width: "100%", height: "100%", objectFit: "cover" },
  zoomContainer: {
    position: "fixed",
    top: 0,
    left: 0,
    zIndex: 2,
    width: "100vw",
    height: "100vh",
    background: "rgba(0,0,0,.8)",
    display: "flex",
    alignItems: "center"
  },
  zoomNavbar: {
    display: "flex",
    alignItems: "center",
    padding: "2rem",
    flexDirection: "row",
    height: "3rem",
    width: "calc(100vw - 4rem)",
    position: "absolute",
    top: 0,
    fontWeight: 900,
    color: "white",
    zIndex: 5,
    background: "rgba(0, 0, 0, 0.5)"
  },
  zoomModalOverlay: {
    display: "flex",
    margin: "auto",
    padding: "3rem",
    alignItems: "center"
  },
  zoomImgWrapper: {
    boxShadow: " rgba(0, 0, 0, 0.16) 0px 1px 4px",
    maxHeight: "90vh"
  },
  zoomImg: {
    width: "100%",
    maxHeight: "90vh",
    boxShadow: " rgba(0, 0, 0, 0.16) 0px 1px 4px"
  }
};
