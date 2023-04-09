import React, { useEffect, useState, useContext } from "react";
import humanizeDuration from "humanize-duration";
import PreferencePanel from "./PreferencePanel";
//import ImportPanel from "./ImportPanel";
import { AppContext } from "../App";
import styles from "../pages/styles";
import { BsGear } from "react-icons/bs";
import { RxActivityLog, RxReload } from "react-icons/rx";
//import { FiTool } from "react-icons/fi";
import { FaChevronDown, FaChevronRight } from "react-icons/fa";
import packageJson from "../../../../package.json";

const LogPanel = () => {
  const log = useContext(AppContext).log;
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "row",
        width: "100vw",
        alignItems: "center"
      }}
    >
      <div style={{ display: "flex", alignContent: "center", width: "100vw" }}>
        <div style={{ position: "absolute", right: "1.5rem", top: "2rem" }}>
          <RxReload onClick={() => window.databaseAPI.requestScan()} />
        </div>
        <textarea readOnly style={styles.logViewer} value={log?.join("\n")} />
      </div>
    </div>
  );
};

const StatisticsPanel = ({ data }) => {
  if (!data) return <div style={{ height: "5rem" }}>Loading Statistics...</div>;
  return (
    <React.Fragment>
      Covering: {humanizeDuration(data.start_date - data.end_date)}
      <table>
        <tbody>
          <tr>
            <td>Worlds Visited</td>
            <td>{data.total_worlds_visited?.toLocaleString("en-US")}</td>
          </tr>
          <tr>
            <td>Players Encountered</td>
            <td>{data.total_player_encounters?.toLocaleString("en-US")}</td>
          </tr>
          <tr>
            <td>Media Played</td>
            <td>{data.total_media?.toLocaleString("en-US")}</td>
          </tr>
          <tr>
            <td>Records</td>
            <td>{data.total_records?.toLocaleString("en-US")}</td>
          </tr>
        </tbody>
      </table>
    </React.Fragment>
  );
};

const Config = ({ onTogglePanel, isOpen, watcherOnline }) => {
  const [data, setData] = useState(null);
  const [tabIndex, setTabIndex] = useState(0);
  useEffect(() => {
    const fetchData = async () => {
      const data = await window.databaseAPI.statisticsGet();
      setData(data);
    };
    fetchData();
  }, []);

  return (
    <React.Fragment>
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          alignItems: "center"
        }}
      >
        <div style={{ margin: ".2rem" }} onClick={onTogglePanel}>
          {isOpen ? <FaChevronDown /> : <FaChevronRight />}
        </div>
        <div style={{ flexGrow: 1 }} />
        <div
          style={{ fontSize: "0.8rem", opacity: 0.5, margin: "-.3rem 0 0 0" }}
        >
          Version:
        </div>
        <div
          style={{
            fontSize: "0.8rem",
            opacity: 0.5,
            margin: "-.3rem .5rem 0 0"
          }}
        >
          {packageJson.version}
        </div>
        <div style={{ margin: "-.3rem .3rem 0 0" }}>
          {watcherOnline ? "🟢" : "🔴"}
        </div>
        {isOpen && (
          <React.Fragment>
            <div style={{ margin: "0 .5rem 0 0" }}>
              <RxActivityLog onClick={() => setTabIndex(0)} />
            </div>
            {/*
            <div style={{ margin: "0 .5rem 0 0" }}>
              <FiTool onClick={() => setTabIndex(1)} />
            </div>*/}
            <div style={{ margin: "0 1rem 0 0" }}>
              <BsGear onClick={() => setTabIndex(2)} />
            </div>
          </React.Fragment>
        )}
      </div>{" "}
      {tabIndex === 0 && <LogPanel />}
      {tabIndex === 1 && <StatisticsPanel data={data} />}
      {tabIndex === 2 && <PreferencePanel />}
    </React.Fragment>
  );
};
export default Config;
