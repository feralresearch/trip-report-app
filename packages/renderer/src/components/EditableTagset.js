import React, { useState } from "react";
import Tags from "./Tags.js";
import Plus from "./Plus.js";
import { TbPencil } from "react-icons/tb";
const EditableTagset = ({ tags, onChange, styles }) => {
  const [tagEdit, setTagEdit] = useState(false);
  return (
    <div style={styles.row} onClick={() => setTagEdit(true)}>
      <div style={styles.rowLabel}>Tags:</div>
      <div>
        {(!tagEdit && (
          <div>
            {(!tags || tags?.length === 0) && <Plus />}
            <Tags
              actionIcon={<TbPencil />}
              onAction={() => setTagEdit(true)}
              color="#3f3f3f"
              tags={tags?.split(",")}
            />
          </div>
        )) || (
          <input
            autoFocus
            onLoad={() => (self.focus = true)}
            onBlur={() => setTagEdit(false)}
            onChange={onChange}
            type="text"
            style={styles.note}
            value={tags ? tags : ""}
          />
        )}
      </div>
    </div>
  );
};
export default EditableTagset;
