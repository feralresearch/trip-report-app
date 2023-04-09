import React, { useEffect, useState } from "react";
import { formConfig } from "./formConfig.js";
import packageJson from "../../../../../package.json";

const PreferencePanel = () => {
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

  const onChange = (e) => {
    const { id, value, type, checked } = e.currentTarget;
    const currentVals = { ...formVals };
    if (type === "checkbox") {
      currentVals[id] = checked;
    } else {
      currentVals[id] = value;
    }
    setFormVals(currentVals);
    window.databaseAPI.preferencesSet(currentVals);
  };

  const InfoPanel = () => (
    <div
      style={{ display: "flex", flexDirection: "column", fontSize: ".8rem" }}
    >
      <div style={{ display: "flex", flexDirection: "row" }}>
        <div style={{ width: "3rem" }}>Version:</div>
        <div style={{ opacity: 0.5 }}> {packageJson.version}</div>
      </div>
      <div style={{ display: "flex", flexDirection: "row" }}>
        <div style={{ width: "3rem" }}>Config:</div>
        <div style={{ opacity: 0.5 }}> {prefsPath}</div>
      </div>
    </div>
  );

  return (
    <div style={{}}>
      <InfoPanel />
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
                <React.Fragment>
                  <div>
                    <input
                      style={{
                        width: "2rem",
                        height: "2rem",
                        marginRight: "1rem",
                        accentColor: "rgb(195 211 210)"
                      }}
                      id={key}
                      type={"checkbox"}
                      checked={formVals[key]}
                      onChange={onChange}
                    />
                  </div>
                  <div style={{ width: "100%", fontWeight: 900 }}>
                    {display}
                  </div>
                </React.Fragment>
              )) || (
                <React.Fragment>
                  <div style={{ width: "12rem", fontWeight: 900 }}>
                    {display}
                  </div>
                  <div>
                    <input
                      style={{ width: "20rem", height: "2rem" }}
                      id={key}
                      type={"text"}
                      value={formVals[key]}
                      onChange={onChange}
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
