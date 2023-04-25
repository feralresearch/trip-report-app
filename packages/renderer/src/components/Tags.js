import React from "react";
import { TiDelete } from "react-icons/ti";

const Tags = ({
  tags,
  selected = [],
  color = "red",
  colorSelected = "green",
  onClick,
  onAction,
  actionIcon = <TiDelete />
}) => {
  const hasAction = typeof onAction === "function";
  if (!Array.isArray(tags) || tags.length === 0) return null;

  tags = tags.map((tag) => {
    try {
      return JSON.parse(tag).tag;
    } catch (e) {
      return tag;
    }
  });

  try {
    tags = [...new Set(tags.filter((tag) => tag))].sort(function (a, b) {
      return a.toLowerCase().localeCompare(b.toLowerCase());
    });
  } catch (e) {
    console.log(e);
  }

  return (
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        flexDirection: "row",
        alignItems: "center"
      }}
    >
      {tags.map((tag, idx) => {
        if (tag?.length > 0)
          return (
            <div
              onClick={() => {
                if (typeof onClick === "function") onClick(tag);
              }}
              key={idx}
              style={{
                position: "relative",
                display: "flex",
                alignItems: "center",
                flexDirection: "row",
                background: selected?.includes(tag) ? colorSelected : color,
                marginRight: "0.4rem",
                padding: "0.2rem 1rem",
                fontWeight: "900",
                fontSize: ".8rem",
                borderRadius: "1rem",
                margin: ".2rem .2rem .2rem 0"
              }}
            >
              {hasAction && (
                <div
                  onClick={() => {
                    if (typeof onAction === "function") onAction(tag);
                  }}
                  style={{
                    position: "absolute",
                    fontSize: "1.3rem",
                    marginTop: ".2rem",
                    left: 1
                  }}
                >
                  {actionIcon}
                </div>
              )}
              <div style={{ marginLeft: hasAction ? "1rem" : 0 }}>{tag}</div>
            </div>
          );
      })}
    </div>
  );
};
export default Tags;
