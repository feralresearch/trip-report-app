import React, { useState } from "react";

const EditableText = ({ value, onChange, styles }) => {
  console.log(styles);
  const [editing, setEditing] = useState(false);
  return (
    <div style={styles.row} onClick={() => setEditing(true)}>
      <div style={styles.rowLabel}>Notes:</div>
      <div>
        {(editing && (
          <textarea
            autoFocus
            style={{ width: "100%" }}
            onBlur={() => setEditing(false)}
            onChange={onChange}
            type="text"
            value={value ? value : ""}
          />
        )) || (
          <div
            style={{
              ...styles.note,
              backgroundColor: value.length === 0 ? "red" : ""
            }}
          >
            {value}
          </div>
        )}
      </div>
    </div>
  );
};
export default EditableText;

/*
const styles = {
  row: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    margin: ".25rem",
    minHeight: "1.5rem"
  },
  rowLabel: { fontWeight: 900, minWidth: "10rem" },
  note: {
    minWidth: "20rem",
    height: "1rem",
    fontSize: "1rem",
    fontWeight: "900",
    color: "#dbdbdb",
    fontFamily: "courier",
    backgroundColor: "grey"
  }
};
*/
