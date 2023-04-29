import React from "react";

const World = ({ world }) => {
  const { url, name } = world;
  return (
    <div>
      <a href={url} target="_blank">
        {name}
      </a>
    </div>
  );
};
export default World;
