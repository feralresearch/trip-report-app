import { TiUserAdd } from "react-icons/ti";
import Collapsable from "../Collapsable/index.js";
import styles from "./styles";
import Tags from "../Tags.js";

const PeopleInWorld = ({ people, peopleInImage }) => {
  return (
    <div style={{ ...styles.row, marginTop: ".5rem", alignItems: "top" }}>
      <div style={{ ...styles.rowLabel, color: "white", marginTop: ".2rem" }}>
        {people.length} {people.length === 1 ? "Person" : "People"} In World:
      </div>
      <div>
        <div style={{ minHeight: "2rem", overflow: "scroll" }}>
          <Tags
            actionIcon={<TiUserAdd />}
            color="#757575"
            colorSelected="#3f3f3f"
            tags={people}
            selected={peopleInImage}
          />
        </div>
      </div>
    </div>
  );
};
export default PeopleInWorld;
