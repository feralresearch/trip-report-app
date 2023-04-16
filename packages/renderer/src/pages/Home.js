import React, { useEffect, useState } from "react";
import { DateTime } from "luxon";
import { useParams } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import Instance from "./Instance";
import styles from "./styles";
import Config from "../components/Config";

let currentDate = null;
let previousDate = null;
const Home = () => {
  const params = useParams();
  const instanceId = params.id;
  const [configPanelOpen, setConfigPanelOpen] = useState(false);
  const [instanceList, setInstanceList] = useState(null);
  const [watcherOnline, setWatcherOnline] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      const data = await window.databaseAPI.instancesGet();
      setInstanceList((_data) => data);
    };
    window.electronAPI.onScanComplete(() => {
      fetchData();
    });
    window.electronAPI.onWatcherGoOffline(() => {
      setWatcherOnline(false);
    });
    window.electronAPI.onWatcherGoOnline(() => {
      setWatcherOnline(true);
    });
    fetchData();
  }, []);

  const [filteredInstanceList, setFilteredInstanceList] =
    useState(instanceList);
  const [filter, setFilter] = useState(null);
  const navigate = useNavigate();
  useEffect(() => {
    if (filter && filter.trim().length > 0) {
      setFilteredInstanceList(
        instanceList.filter((item) =>
          item.data.name.toLowerCase().includes(filter.toLowerCase())
        )
      );
    } else {
      setFilteredInstanceList(instanceList);
    }
  }, [instanceList, filter]);

  if (!instanceList) return null;

  return (
    <React.Fragment>
      <div style={styles.wrapper}>
        <div
          style={configPanelOpen ? styles.sidebarWithConfig : styles.sidebar}
        >
          <h1 onClick={() => navigate(`/`)}>Trip Report</h1>
          <div style={styles.section}>
            <h2>
              {filteredInstanceList?.length}{" "}
              {filter && filter.length > 0
                ? `trips matching ${filter}`
                : "trips"}
            </h2>
            <input
              placeholder="Search..."
              style={styles.input}
              type="text"
              onChange={(e) => {
                setFilter(e.target.value);
              }}
            />
          </div>
          <div style={styles.list}>
            <div style={styles.section}>
              {filteredInstanceList?.map((instance, idx) => {
                currentDate = DateTime.fromMillis(
                  instance?.data.tsEnter
                )?.toLocaleString(DateTime.DATE_FULL);
                const showDate =
                  currentDate !== previousDate || filter?.length > 0;
                previousDate = currentDate;
                return (
                  <div key={idx} style={styles.listing}>
                    <div>
                      {showDate && (
                        <div style={styles.listingHeader}>{currentDate}</div>
                      )}
                      <div
                        style={styles.listingBody}
                        onClick={() =>
                          navigate(`/instance/${instance?.instance}`)
                        }
                      >
                        <div>{instance?.data.name}</div>
                        <div>{instance?.data.tsString}</div>
                        <div>{instance?.data.tsDurationString}</div>{" "}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
        <div
          style={configPanelOpen ? styles.mainPageWithConfig : styles.mainPage}
        >
          {(instanceId && <Instance />) || null}
        </div>
      </div>
      <div
        style={
          configPanelOpen ? styles.configPanelOpen : styles.configPanelClosed
        }
      >
        <div style={{ overflow: "scroll", height: "100%" }}>
          <Config
            watcherOnline={watcherOnline}
            isOpen={configPanelOpen}
            onTogglePanel={() => setConfigPanelOpen(!configPanelOpen)}
          />
        </div>
      </div>
    </React.Fragment>
  );
};
export default Home;
