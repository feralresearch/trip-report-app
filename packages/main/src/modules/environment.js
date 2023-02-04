import pgConnectionString from "pg-connection-string";
import { envBool } from "./util.js";
const parse = pgConnectionString.parse;

const env = {
  display: (preferences) => {
    const { watcherEnabled, debugMode } = preferences;
    console.log(`\n--------------------------------------`);
    console.log(`Log Watcher`);
    console.log(`--------------------------------------`);
    console.log(`Watcher: ${watcherEnabled ? "ENABLED" : "DISABLED"}`);
    console.log(`DEBUG MODE: ${debugMode ? "ENABLED" : "DISABLED"}`);
    console.log("DB_ADAPTER: SQLite");
    console.log(`--------------------------------------`);
  }
};
export default env;
