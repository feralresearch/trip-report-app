import React from "react";
import { IconContext } from "react-icons";

export default function Error({
  backgroundColor = null,
  message,
  subMessage,
  icon
}) {
  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        height: "100%",
        width: "100%",
        background: backgroundColor ? backgroundColor : "rgb(0 0 0 / 75%)",
        zIndex: 5,
        display: "flex",
        textAlign: "center",
        overflow: "hidden",
        color: "white"
      }}
    >
      <div
        style={{
          margin: "auto",
          fontWeight: 900,
          color: "white"
        }}
      >
        <IconContext.Provider
          value={{
            color: "grey",
            size: "5rem"
          }}
        >
          {icon}
        </IconContext.Provider>
        <div style={{ marginTop: "1rem" }}>{message}</div>
        <div style={{ marginTop: ".2rem" }}>{subMessage}</div>
      </div>
    </div>
  );
}
