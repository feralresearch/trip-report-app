import React, { useEffect, useState } from "react";
import { formConfig } from "./formConfig.js";
import packageJson from "../../../../../package.json";

const PreferencePanel = ({ onChange }) => {
  const [preferences, setPreferences] = useState(null);
  const [formVals, setFormVals] = useState(null);
  const [prefsPath, setPrefsPath] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      const data = await window.databaseAPI.preferencesGet();
      const prefsPath = await window.databaseAPI.preferencesGetPath();
      setPrefsPath(prefsPath);
      setPreferences(data);
      setFormVals(data);
    };
    fetchData();
  }, []);
  if (!preferences) return null;

  const onChangeHandler = (e) => {
    const { id, value, type, checked } = e.currentTarget;
    const currentVals = { ...formVals };
    if (type === "checkbox") {
      currentVals[id] = checked;
    } else {
      currentVals[id] = value;
    }
    setFormVals(currentVals);
    window.databaseAPI.preferencesSet(currentVals);
    onChange();
  };

  return (
    <div style={{ padding: "0 1rem 0 1rem" }}>
      {formConfig.map((config, idx) => {
        const { key, display, hidden, tooltip } = config;
        if (!hidden)
          return (
            <div
              title={tooltip}
              key={idx}
              style={{
                display: "flex",
                flexDirection: "row",
                alignItems: "center"
              }}
            >
              {(typeof formVals[key] === "boolean" && (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    marginBottom: ".4rem"
                  }}
                >
                  <div>
                    <input
                      style={{
                        width: "2rem",
                        height: "2rem",
                        marginRight: "1rem",
                        accentColor: "#bdbdbd"
                      }}
                      id={key}
                      type={"checkbox"}
                      checked={formVals[key]}
                      onChange={onChangeHandler}
                    />
                  </div>
                  <div
                    style={{
                      width: "100%",
                      fontWeight: 900,
                      fontSize: ".9rem"
                    }}
                  >
                    {display}{" "}
                    <div style={{ fontWeight: 200, fontSize: ".9rem" }}>
                      {tooltip}
                    </div>
                  </div>
                </div>
              )) || (
                <React.Fragment>
                  <div style={{ width: "3.8rem" }} />
                  <div
                    style={{
                      fontWeight: 900,
                      width: "20.5rem",
                      marginBottom: ".5rem",
                      fontSize: ".9rem"
                    }}
                  >
                    {display}{" "}
                    <div style={{ fontWeight: 200, fontSize: ".9rem" }}>
                      {tooltip}
                    </div>
                  </div>
                  <div style={{ margin: ".2rem", width: "70vw" }}>
                    <input
                      style={{
                        width: "97%",
                        height: "2rem",
                        borderRadius: "0.3rem",
                        border: "1px solid #bdbdbd",
                        fontSize: ".7rem"
                      }}
                      id={key}
                      type={"text"}
                      value={formVals[key]}
                      onChange={onChangeHandler}
                    />
                  </div>
                </React.Fragment>
              )}
            </div>
          );
      })}
    </div>
  );
};
export default PreferencePanel;
