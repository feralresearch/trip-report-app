import React, { useEffect, useState } from "react";
import { DateTime } from "luxon";
import { useParams } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import Instance from "./Instance";
import Statistics from "../components/Statistics";
import styles from "./styles";

let currentDate = null;
let previousDate = null;
const Home = () => {
  const params = useParams();
  const instanceId = params.id;

  const [instanceList, setInstanceList] = useState(null);
  useEffect(() => {
    const fetchData = async () => {
      const data = await window.databaseAPI.instancesGet();
      setInstanceList(data);
    };
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
    <div style={styles.wrapper}>
      <div style={styles.sidebar}>
        <h1 onClick={() => navigate(`/`)}>Trip Report</h1>
        <div style={styles.section}>
          <h2>
            {filteredInstanceList?.length}{" "}
            {filter && filter.length > 0 ? `trips matching ${filter}` : "trips"}
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
      <div style={styles.mainPage}>
        {(instanceId && <Instance />) || <Statistics />}
      </div>
    </div>
  );
};
export default Home;
