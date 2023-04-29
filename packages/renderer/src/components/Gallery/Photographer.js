import styles from "./styles.js";
import Tags from "../Tags.js";
import Plus from "../Plus.js";

const Photographer = ({ onRemove, photographer, onAdd }) => {
  return (
    <div style={styles.row}>
      <div style={styles.rowLabel}>Photographer:</div>
      <div>
        {(photographer && (
          <Tags onAction={onRemove} color="#3f3f3f" tags={[photographer]} />
        )) || <Plus onClick={onAdd} />}
      </div>
    </div>
  );
};
export default Photographer;
