import React from "react";
import Tags from "./Tags";
import Collapsable from "./Collapsable";

const PlayerList = ({ players }) => {
  players = [...new Set(players.filter((player) => player))].sort(function (
    a,
    b
  ) {
    return a.data.name.toLowerCase().localeCompare(b.data.name.toLowerCase());
  });
  return (
    <Collapsable title={<div>{players.length} people</div>}>
      <Tags
        color="#757575"
        colorSelected="#3f3f3f"
        tags={players.map((player) => player.data.name)}
      />
    </Collapsable>
  );
};
export default PlayerList;
