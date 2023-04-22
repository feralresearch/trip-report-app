import React, { useState, useEffect, useContext } from "react";
import { AppContext } from "../App";
import youTube from "../modules/youTube";

const MediaTile = ({ data }) => (
  <div style={{ display: "flex", flexDirection: "row", alignItems: "center" }}>
    <div>
      <img
        style={{ maxWidth: "100px" }}
        src={
          data.thumbnails ? data.thumbnails.default.url : "/assets/missing.png"
        }
      />
    </div>
    <div style={{ marginLeft: "1rem" }}>{data.title}</div>
  </div>
);

const MediaList = ({ media }) => {
  const { prefs, _setPrefs } = useContext(AppContext);
  const mediaList = [...new Set(media.map((item) => item.data.url))];
  const [mediaTitle, setMediaTitle] = useState({});

  useEffect(() => {
    const getCache = async () => {
      const data = await window.databaseAPI.mediaGet(
        mediaList.map((item) => youTube.extractYoutubeId(item)).filter(Boolean)
      );
      mediaList.forEach(async (url) => {
        const info = await youTube.resolveYoutubeInfo({
          cache: data,
          key: prefs.googleApiKey,
          url,
          cacheUpdate: (item) => window.databaseAPI.mediaSet(item)
        });
        setMediaTitle((mediaTitle) => {
          return {
            ...mediaTitle,
            [url]: <MediaTile data={info} />
          };
        });
      });
    };
    getCache();
  }, [media]);

  return (
    <div>
      <div>
        <h3>{mediaList.length} media links</h3>
      </div>
      <div>
        {mediaList.map((url, idx) => (
          <div key={idx}>
            <a href={url} target="_blank" rel="noreferrer">
              {mediaTitle[url]}
            </a>
          </div>
        ))}
      </div>
    </div>
  );
};
export default MediaList;
