import React, { useEffect, useState } from "react";
import { SpinnerCircular } from "spinners-react";

export default function Spinner({ showPercentage = true, percentComplete }) {
  const [label, setLabel] = useState(percentComplete);
  let timer;
  useEffect(() => {
    setLabel(percentComplete);
    clearInterval(timer);
    timer = setInterval(() => {
      setLabel((label) => {
        let newPercentage = parseInt(label, 10) + 1;
        newPercentage = newPercentage > 100 ? 100 : newPercentage;
        return `${newPercentage}%`;
      });
    }, 1000);
  }, [percentComplete]);

  return (
    <div
      style={{
        position: "absolute",
        top: 0,
        height: "100%",
        width: "100%",
        background: "#000000",
        opacity: 0.7,
        zIndex: 1,
        display: "flex",
        textAlign: "center",
        overflow: "hidden"
      }}
    >
      <div style={{ margin: "auto", color: "#000000", fontWeight: 900 }}>
        <SpinnerCircular
          size={76}
          thickness={159}
          speed={113}
          color={"#FFFFFF"}
          secondaryColor="rgba(0, 0, 0, 0)"
        />
        {showPercentage && (
          <div style={{ marginTop: "-3rem", color: "white" }}>{label}</div>
        )}
      </div>
    </div>
  );
}
