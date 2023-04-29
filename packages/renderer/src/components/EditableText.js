import React, { useState } from "react";

const EditableText = ({ value, onChange, styles }) => {
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
