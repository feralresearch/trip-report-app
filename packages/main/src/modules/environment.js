import pgConnectionString from "pg-connection-string";
import { envBool } from "./util.js";
const parse = pgConnectionString.parse;

const env = {
  display: (preferences) => {
    const { watcherEnabled } = preferences;
    console.log(`\n--------------------------------------`);
    console.log(`Log Watcher`);
    console.log(`--------------------------------------`);
    console.log(`Watcher: ${watcherEnabled ? "ENABLED" : "DISABLED"}`);
    console.log(`Debug: ON`);
    console.log("DB_ADAPTER: SQLite");
    console.log(`--------------------------------------`);
  },
  validate: (preferences) => {
    const { vrcLogDir } = preferences;
    if (!vrcLogDir) {
      console.error("** FATAL: Your .env file is missing or invalid! ");
      return false;
    }
    return true;
  }
};
export default env;
