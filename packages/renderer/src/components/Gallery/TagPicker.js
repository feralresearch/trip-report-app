import React, { useEffect, useRef, useState } from "react";
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

const TagPicker = ({ tags, selected, onSelect, top, left, onOutsideClick }) => {
  // On Outside Click
  const wrapperRef = useRef(null);
  const [filter, _setFilter] = useState("");
  const [tagList, setTagList] = useState(tags);

  const setFilter = (val) => {
    if (val.length == 0) {
      setTagList(tags);
    } else {
      setTagList(tagList.filter((tag) => tag.toLowerCase().match(val)));
    }
    return _setFilter(val);
  };

  useOutsideAlerter(wrapperRef, (e) => {
    if (e.target.className !== "button") onOutsideClick(e);
  });
  const width = 200;
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
        width: `${width}px`,
        overflow: "hidden",
        height: "10rem",
        display: "flex",
        alignItems: "center",
        border: "1px solid black",
        borderRadius: ".5rem",
        boxShadow: "rgb(0 0 0 / 30%) -3px 6px 7px 2px"
      }}
    >
      <div style={{ height: "100%", position: "relative" }}>
        <div
          style={{
            width: `${width}px`,
            fontWeight: 900
          }}
        >
          <input
            type="text"
            onChange={(e) => setFilter(e.target.value)}
            value={filter ? filter : ""}
            style={{
              width: `${width}px`,
              border: 0,
              fontSize: "1rem",
              fontWeight: 900
            }}
          />
        </div>
        <div>
          <div
            style={{
              width: `${width}px`,
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
              tags={tagList}
              selected={selected}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
export default TagPicker;
