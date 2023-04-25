import React, { useEffect, useRef } from "react";
import Tags from "../Tags.js";
import { TiUserAdd } from "react-icons/ti";

const useOutsideAlerter = (ref, onOutsideClick) => {
  useEffect(() => {
    function handleClickOutside(e) {
      if (e.target.tagName === "svg" || e.target.tagName === "path") return;
      if (ref.current && !ref.current.contains(e.target)) onOutsideClick(e);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onOutsideClick, ref]);
};

const TagPicker = ({ onSelect, top, left, imageMetadata, onOutsideClick }) => {
  // On Outside Click
  const wrapperRef = useRef(null);
  useOutsideAlerter(wrapperRef, (e) => {
    if (e.target.className !== "button") onOutsideClick(e);
  });
  const width = 300;
  return (
    <div
      ref={wrapperRef}
      style={{
        top,
        left: left - width / 2,
        zIndex: 2,
        position: "fixed",
        background: "white",
        maxWidth: `${width}px`,
        overflow: "hidden",
        height: "10rem",
        display: "flex",
        alignItems: "center",
        border: "1px solid black",
        borderRadius: ".5rem",
        boxShadow: "rgb(0 0 0 / 30%) -3px 6px 7px 2px"
      }}
    >
      <div style={{ height: "100%" }}>
        <div
          style={{
            width: "100%",
            fontWeight: 900
          }}
        >
          People <input type="text" />
        </div>
        <div>
          <div
            style={{
              overflow: "scroll",
              height: "6rem",
              background: "#eeeeee",
              padding: "1rem"
            }}
          >
            <Tags
              actionIcon={<TiUserAdd />}
              onClick={(tag) => {
                onSelect(tag);
                onOutsideClick();
              }}
              color="#757575"
              colorSelected="#3f3f3f"
              tags={imageMetadata.context.players}
              selected={imageMetadata.usrs_in_image}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
export default TagPicker;
