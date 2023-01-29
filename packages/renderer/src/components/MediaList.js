import React from "react";
//import { resolveYoutubeInfo } from "../modules/youtTube";

const MediaList = ({ media }) => {
  return (
    <div>
      <div>
        <h3>{media.length} media</h3>
      </div>
      <div>
        {media.map((item, idx) => (
          <div key={idx}>
            <a href={item.data.url} target="_blank" rel="noreferrer">
              {item.data.url}
            </a>
          </div>
        ))}
      </div>
    </div>
  );
};
export default MediaList;
