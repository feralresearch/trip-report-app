import React, { useContext, useEffect, useState } from "react";
import { DateTime } from "luxon";
import { useParams } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import Instance from "./Instance";
import styles from "./styles";
import Config from "../components/Config";
import { MdOutlineImage, MdOutlineImageNotSupported } from "react-icons/md";
import { AppContext } from "../App";

let currentDate = null;
let previousDate = null;
const Home = () => {
  const { prefs, setPref } = useContext(AppContext);
  const params = useParams();
  const instanceId = params.id;

  const [instanceList, setInstanceList] = useState(null);
  const [watcherOnline, setWatcherOnline] = useState(false);

  const [configPanelOpen, _setConfigPanelOpen] = useState(
    prefs.ui_configPanelOpen
  );
  const setConfigPanelOpen = (val) => {
    setPref("ui_configPanelOpen", val);
    _setConfigPanelOpen(val);
  };

  const [tripFetchFilter, _setTripFetchFilter] = useState(
    prefs.ui_tripFetchFilter ? prefs.ui_tripFetchFilter : "instance_list"
  );
  const setTripFetchFilter = (val) => {
    setPref("ui_tripFetchFilter", val);
    _setTripFetchFilter(val);
  };

  useEffect(() => {
    const fetchData = async () => {
      const data = await window.databaseAPI.instancesGet(tripFetchFilter);
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
  }, [tripFetchFilter]);

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
            <div
              style={{
                display: "flex",
                flexDirection: "row",
                alignItems: "center"
              }}
            >
              <h2>
                {filteredInstanceList?.length}{" "}
                {filter && filter.length > 0
                  ? `trip${
                      filteredInstanceList?.length != 1 ? "s" : ""
                    } matching ${filter}`
                  : `trip${filteredInstanceList?.length != 1 ? "s" : ""}`}
              </h2>
              <div style={{ flexGrow: 1 }}></div>
              <div
                style={{ fontSize: "2rem" }}
                onClick={() => {
                  switch (tripFetchFilter) {
                    case "instance_list":
                      setTripFetchFilter("instance_with_photos_list");
                      break;
                    case "instance_with_photos_list":
                      setTripFetchFilter("instance_without_photos_list");
                      break;
                    case "instance_without_photos_list":
                      setTripFetchFilter("instance_list");
                      break;
                  }
                }}
              >
                {(tripFetchFilter === "instance_list" && (
                  <MdOutlineImage style={{ opacity: 0.2 }} />
                )) ||
                  (tripFetchFilter === "instance_with_photos_list" && (
                    <MdOutlineImage style={{ opacity: 1.0 }} />
                  )) ||
                  (tripFetchFilter === "instance_without_photos_list" && (
                    <MdOutlineImageNotSupported style={{ opacity: 1.0 }} />
                  ))}
              </div>
            </div>
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
