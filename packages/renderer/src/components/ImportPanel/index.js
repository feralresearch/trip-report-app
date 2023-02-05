import React, { useEffect, useState } from "react";

const styles = {
  formRow: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center"
  },
  input: { width: "20rem", height: "2rem" },
  button: {
    backgroundColor: "rgb(195, 211, 210)",
    height: "2rem",
    width: "5rem",
    margin: ".2rem 0 0 0",
    fontWeight: "900",
    fontSize: "1rem",
    borderRadius: "0.3rem"
  }
};

const ImportPanel = () => {
  const [formVals, setFormVals] = useState();

  const onChange = (e) => {
    const { id, value, type, checked } = e.currentTarget;
    const currentVals = { ...formVals };
    if (type === "checkbox") {
      currentVals[id] = checked;
    } else {
      currentVals[id] = value;
    }
    setFormVals(currentVals);
  };

  return (
    <div>
      <div style={styles.formRow}>
        <div style={{ width: "12rem", fontWeight: 900 }}>Logs</div>
        <div>
          <input
            id={"logs"}
            style={styles.input}
            type={"text"}
            onChange={onChange}
          />
        </div>
      </div>
      <div style={styles.formRow}>
        <div style={{ width: "12rem", fontWeight: 900 }}>Screenshots</div>
        <div>
          <input
            id={"screenshots"}
            style={styles.input}
            type={"text"}
            onChange={onChange}
          />
        </div>
      </div>
      <div style={styles.formRow}>
        <div style={{ width: "12rem", fontWeight: 900 }}></div>
        <div>
          <input
            id={"logPath"}
            style={styles.button}
            type={"button"}
            value="Import"
            onClick={() =>
              window.databaseAPI
                .bulkImport(JSON.stringify(formVals))
                .then((response) => {
                  console.log(response);
                })
            }
          />
        </div>
      </div>
    </div>
  );
};
export default ImportPanel;
