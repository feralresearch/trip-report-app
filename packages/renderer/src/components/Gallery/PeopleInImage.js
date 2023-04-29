import styles from "./styles.js";
import Tags from "../Tags.js";

const PeopleInImage = ({ peopleInWorld, onRemove }) => {
  return (
    <div style={styles.row}>
      <div style={styles.rowLabel}>In Image:</div>
      <div>
        <Tags
          removable={true}
          onAction={onRemove}
          color="#3f3f3f"
          tags={peopleInWorld}
        />
      </div>
    </div>
  );
};
export default PeopleInImage;
