import pgConnectionString from "pg-connection-string";
import { envBool } from "./util.js";
const parse = pgConnectionString.parse;

const env = {
  display: () => {
    console.log(`\n--------------------------------------`);
    console.log(`TripReport Service`);
    console.log(`--------------------------------------`);
    console.log(`Port: ${process.env.PORT || 8888}`);
    console.log(
      `Watcher: ${
        envBool(process.env.WATCHER_ENABLED) ? "ENABLED" : "DISABLED"
      }`
    );
    console.log(`Debug: ON`);
    if (process.env.PG_CONNECTION_STRING) {
      const rejectUnauthorized =
        process.env.PG_SSL_STRICT?.toLowerCase() === "false" ? false : true;
      console.log("DB_ADAPTER: Postgres");
      console.log(
        `DB: ${parse(process.env.PG_CONNECTION_STRING).database}@${
          parse(process.env.PG_CONNECTION_STRING).host
        }`
      );
      console.log(`DB_SSL: ${rejectUnauthorized ? "strict" : "permissive"}`);
    } else {
      console.log("DB_ADAPTER: SQLite");
    }
    console.log(`--------------------------------------`);
  },
  validate: () => {
    if (!process.env.DIR_VRC_LOG_FILES) {
      console.error("** FATAL: Your .env file is missing or invalid! ");
      return false;
    }
    return true;
  }
};
export default env;
