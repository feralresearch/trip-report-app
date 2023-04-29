import React from "react";
import styles from "./styles";

const PositionedTag = ({ tag, top = 0, left = 0 }) => {
  return (
    <div
      style={{
        ...styles.positionedTag,
        top: `${top}px`,
        left: `${left}px`
      }}
    >
      <div style={{ margin: "auto" }}>{tag}</div>
    </div>
  );
};
export default PositionedTag;
