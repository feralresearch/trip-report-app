import React from "react";
import styles from "./styles";
import { MdRotateLeft, MdRotateRight } from "react-icons/md";
import { TbDownload } from "react-icons/tb";
import useMousetrap from "react-hook-mousetrap";

const ZoomedHeaderbar = ({
  onClose,
  onNext,
  onPrev,
  dateDisplay,
  onRotate,
  counter,
  fileName
}) => {
  const onRotateLeft = () => onRotate(-90);
  const onRotateRight = () => onRotate(90);
  const onDownload = () => window.databaseAPI.exportAsset(fileName);

  useMousetrap("esc", onClose, "keyup");
  useMousetrap("right", onNext, "keyup");
  useMousetrap("left", onPrev, "keyup");
  useMousetrap("l", onRotateLeft, "keyup");
  useMousetrap("r", onRotateRight, "keyup");
  useMousetrap("d", onDownload, "keyup");

  return (
    <div style={styles.zoomNavbar}>
      <div>
        <div>{counter}</div>
        <div>{dateDisplay}</div>
        <div>{fileName}</div>
      </div>
      <div style={{ flexGrow: 1 }} />
      <div className="button" onClick={onDownload}>
        <TbDownload
          style={{
            fontSize: "2rem",
            margin: "0 .25rem .25rem 0"
          }}
        />
      </div>
      <div className="button" onClick={onRotateLeft}>
        <MdRotateLeft style={{ fontSize: "2rem" }} />
      </div>
      <div className="button" onClick={onRotateRight}>
        <MdRotateRight style={{ fontSize: "2rem" }} />
      </div>
    </div>
  );
};
export default ZoomedHeaderbar;
