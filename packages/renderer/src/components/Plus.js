import React from "react";

const Plus = ({ onClick }) => (
  <div
    onClick={onClick}
    style={{
      position: "relative",
      display: "flex",
      alignItems: "center",
      flexDirection: "row",
      background: "#3f3f3f",
      marginRight: "0.4rem",
      lineHeight: ".6rem",
      padding: ".3rem",
      fontWeight: "900",
      fontSize: "1rem",
      borderRadius: "1rem",
      margin: "0 .2rem .2rem 0"
    }}
  >
    +
  </div>
);
export default React.memo(Plus);
