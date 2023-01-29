import React from "react";

const PlayerList = ({ players }) => {
  return (
    <div>
      <div>
        <h3>{players.length} Players</h3>
      </div>
      <div>{players.map((player) => player.data.name).join(", ")}</div>
    </div>
  );
};
export default PlayerList;
