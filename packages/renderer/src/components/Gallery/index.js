import React, { useState, useContext, useEffect, memo } from "react";
import { v4 as uuidv4 } from "uuid";
import { AppContext } from "../../App";
import { RiFolderDownloadFill } from "react-icons/ri";
import { parseVrchatScreenshotName } from "../../../../main/src/standalone/modules/vrcScreenshotsUtil.js";
import Zoomed from "./Zoomed";
import styles from "./styles";
import Collapsable from "../Collapsable";
import { BsHeart, BsHeartFill } from "react-icons/bs";

const Gallery = ({ imageContext, screenshots, onExport }) => {
  const { prefs } = useContext(AppContext);
  if (!prefs.dataDir) return null;
  const assetPath = encodeURI(`asset://${prefs.dataDir}/assets`);

  const [prevImage, setPrevImage] = useState(null);
  const [nextImage, setNextImage] = useState(null);
  const [zoomedImage, _setZoomedImage] = useState(null);
  const [cacheBust, setCacheBust] = useState(uuidv4());
  const [filterOnFavorites, setFilterOnFavorites] = useState(0);
  const [favorites, setFavorites] = useState([]);
  const [screenshotList, setScreenshotList] = useState(screenshots);

  const onToggleFavorites = (e) => {
    e.stopPropagation();
    const val = filterOnFavorites + 1;
    setFilterOnFavorites(val > 2 ? 0 : val);
  };

  const setZoomedImage = (value) => {
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
    _setZoomedImage(value);
  };

  const getFavorites = async () => {
    let data = await window.databaseAPI.screenshotGet(
      screenshots.map((item) => item.data.fileName)
    );
    data = Array.isArray(data) ? data : [data];
    const favList = data?.filter((item) => item?.favorite === 1);
    setFavorites(favList);
    doFilterOnFavorites(favList);
  };

  const doFilterOnFavorites = (favList) => {
    if (filterOnFavorites === 2) {
      setScreenshotList(
        screenshots.filter((item) =>
          favList.map((item) => item.filename).includes(item.data.fileName)
        )
      );
    } else {
      setScreenshotList(screenshots);
    }
  };

  useEffect(() => {
    if (filterOnFavorites) {
      setScreenshotList(
        screenshots.filter((item) =>
          favorites.map((item) => item.filename).includes(item.data.fileName)
        )
      );
    } else {
      setScreenshotList(screenshots);
    }
    getFavorites();
  }, [screenshots]);

  useEffect(() => {
    doFilterOnFavorites(favorites);
  }, [filterOnFavorites]);

  return (
    <Collapsable
      isOpen={true}
      title={
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            alignItems: "center",

            borderRadius: "0.3rem",
            padding: "0 .25rem",
            height: "3rem"
          }}
        >
          <div>
            {screenshots.length} image{screenshots.length != 1 && "s"} |{" "}
            {favorites.length} favorite{favorites.length != 1 && "s"}
          </div>
          <div style={{ flexGrow: 1 }} />
        </div>
      }
    >
      <div key={cacheBust}>
        <Zoomed
          imageContext={imageContext}
          image={zoomedImage}
          assetPath={assetPath}
          cacheBust={cacheBust}
          onRotate={() => setCacheBust(uuidv4())}
          counter={`${screenshots.indexOf(zoomedImage) + 1} of ${
            screenshots.length
          }`}
          onNext={() => setZoomedImage(nextImage)}
          onPrev={() => setZoomedImage(prevImage)}
          onOutsideClick={() => {
            getFavorites();
            setZoomedImage(null);
          }}
        />

        <div style={styles.gallery}>
          <div style={{ width: "100vw" }}>
            <div
              style={{
                position: "relative",
                display: "flex",
                flexDirection: "row",
                alignItems: "center"
              }}
            >
              <div
                onClick={onToggleFavorites}
                style={{
                  margin: "0 .5rem 0 .2rem",
                  fontSize: "1.5rem",
                  opacity: filterOnFavorites > 0 ? 1 : 0.2
                }}
              >
                {(filterOnFavorites === 2 && <BsHeartFill />) || <BsHeart />}
              </div>
              <div
                onClick={onExport}
                style={{
                  margin: "-.2rem .5rem 0 .2rem",
                  fontSize: "1.8rem"
                }}
              >
                <RiFolderDownloadFill />
              </div>
            </div>
          </div>
          {screenshotList.map((image, idx) => {
            if (
              favorites.find((item) => item.fileName === image.data.fileName)
            ) {
              return <div>Fav</div>;
            }
            const metaData = parseVrchatScreenshotName(image.data.fileName);
            const thumbnailUrl = `${assetPath}/${metaData.year}/${
              metaData.month
            }/${image.data.fileName.replace(
              ".png",
              ""
            )}/thumbnail.png?id=${uuidv4()}`;
            return (
              <div
                onClick={() => setZoomedImage(image)}
                key={idx}
                style={styles.galleryImgWrapper}
              >
                <img
                  draggable={false}
                  style={{
                    ...styles.galleryImg,
                    opacity: favorites.find(
                      (item) => item.filename === image.data.fileName
                    )
                      ? 1
                      : filterOnFavorites === 1
                      ? 0.5
                      : 1
                  }}
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
    </Collapsable>
  );
};

export default React.memo(Gallery);
