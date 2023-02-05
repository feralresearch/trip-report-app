import pgConnectionString from "pg-connection-string";
import { envBool } from "./util.js";
const parse = pgConnectionString.parse;

const env = {
  display: (preferences) => {
    const { watcherEnabled, debugMode } = preferences;
    console.log(`\n***************************`);
    console.log(`*** Trip Report Backend ***`);
    console.log(`***************************`);
    console.log(`WATCHER: ${watcherEnabled ? "ENABLED" : "DISABLED"}`);
    console.log(`DEBUG-MODE: ${debugMode ? "ENABLED" : "DISABLED"}`);
  }
};
export default env;
