import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { DateTime } from "luxon";
import PlayerList from "../components/PlayerList";
import Gallery from "../components/Gallery";
import MediaList from "../components/MediaList";
import styles from "./styles";
import Spinner from "../components/Spinner";

let timer;

const Instance = () => {
  const params = useParams();
  //const instanceId = params.id;
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    timer = setTimeout(() => setIsLoading(true), 250);
    const fetchData = async () => {
      const data = await window.databaseAPI.instanceGet(params.id);
      setData(data);
      clearTimeout(timer);
      setIsLoading(false);
    };
    fetchData();
  }, [params.id]);

  if (isLoading || !data) return <Spinner showPercentage={false} />;

  const info = data?.filter((datum) => datum.tag === "world_enter")[0]?.data;
  const players = data?.filter((datum) => datum.tag === "player");
  const media = data?.filter((datum) => datum.tag === "media");
  const screenshots = data?.filter((datum) => datum.tag === "screenshot");
  if (!info) return null;
  return (
    <div>
      <div>
        <h2>{info.name}</h2>
      </div>
      <div>
        {DateTime.fromMillis(info.tsEnter).toLocaleString(DateTime.DATE_FULL)}
      </div>
      <div>{info.tsString}</div>
      <div>{info.tsDurationString}</div>
      <div style={{ marginTop: "1rem" }}>
        {players.length > 0 && (
          <div style={styles.section}>
            <PlayerList players={players} />
          </div>
        )}
        {media.length > 0 && (
          <div style={styles.section}>
            <MediaList media={media} />
          </div>
        )}
        {screenshots.length > 0 && (
          <div style={styles.section}>
            <Gallery
              screenshots={screenshots}
              onExport={() => window.databaseAPI.exportAsset(params.id)}
            />
          </div>
        )}
      </div>
    </div>
  );
};
export default Instance;
