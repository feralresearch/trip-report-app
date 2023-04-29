import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { DateTime } from "luxon";
import PlayerList from "../components/PlayerList";
import Gallery from "../components/Gallery";
import MediaList from "../components/MediaList";
import styles from "./styles";

const Instance = () => {
  const params = useParams();
  const [data, setData] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      const data = await window.databaseAPI.instanceGet(params.id);
      setData(data);
    };
    fetchData();
  }, [params.id]);

  const info = data?.filter((datum) => datum.tag === "world_enter")[0]?.data;
  const players = [
    ...new Set(
      data?.filter((datum) => datum.tag === "player").map((item) => item)
    )
  ];

  const media = [
    ...new Set(
      data
        ?.filter(
          (datum) =>
            datum.tag === "media" &&
            datum.event.includes("[Video Playback] Attempting to resolve")
        )
        .map((item) => item)
    )
  ];
  const screenshots = data?.filter((datum) => datum.tag === "screenshot");
  const imageContext = {
    info,
    world: {
      name: info?.name,
      url: info?.url,
      wrld_id: info?.url.replace("https://vrchat.com/home/world/", "")
    },
    players: players?.map((player) => player.data.name)
  };

  if (!info) return null;
  return (
    <div style={{ margin: "1.5rem" }}>
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
              imageContext={imageContext}
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
