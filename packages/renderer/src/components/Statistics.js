import React, { useEffect, useState } from "react";
import humanizeDuration from "humanize-duration";
import PreferencePanel from "./PreferencePanel";

const Statistics = () => {
  const [data, setData] = useState(null);
  useEffect(() => {
    const fetchData = async () => {
      const data = await window.databaseAPI.statisticsGet();
      setData(data);
    };
    fetchData();
  }, []);

  const [log, setLog] = useState([]);
  useEffect(() => {
    window.electronAPI.onLogEvent((_event, value) => {
      const newLog = [...log];
      newLog.unshift(value);
      setLog(newLog);
    });
  }, [log]);

  if (!data) return <div style={{ height: "5rem" }}>Loading Statistics...</div>;
  return (
    <React.Fragment>
      <PreferencePanel />
      <hr />
      Covering: {humanizeDuration(data.start_date - data.end_date)}
      <table>
        <tbody>
          <tr>
            <td>Worlds Visited</td>
            <td>{data.total_worlds_visited.toLocaleString("en-US")}</td>
          </tr>
          <tr>
            <td>Players Encountered</td>
            <td>{data.total_player_encounters.toLocaleString("en-US")}</td>
          </tr>
          <tr>
            <td>Media Played</td>
            <td>{data.total_media.toLocaleString("en-US")}</td>
          </tr>
          <tr>
            <td>Records</td>
            <td>{data.total_records.toLocaleString("en-US")}</td>
          </tr>
        </tbody>
      </table>
      <hr />
      <textarea
        readOnly
        style={{
          width: "100%",
          height: "100%",
          backgroundColor: "grey",
          color: "blue"
        }}
        value={log?.join("\n")}
      />
    </React.Fragment>
  );
};
export default Statistics;
