import React from "react";
import styles from "./styles";
import World from "../World";
const WorldImage = ({ world }) => {
  return (
    <div style={styles.row}>
      <div style={styles.rowLabel}>World:</div>
      <div>
        <World world={world} />
      </div>
    </div>
  );
};
export default WorldImage;
