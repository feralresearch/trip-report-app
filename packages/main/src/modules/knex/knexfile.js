// Builds knex config from .env, used by both knex-cli and app
// http://knexjs.org/#knexfile
import dotenv from "dotenv";
import findConfig from "find-config";
import path from "path";
import pgConnectionString from "pg-connection-string";
import env from "../environment.js";
import { makeDir } from "../util.js";
import { fileURLToPath } from "url";
const __dirname = path.dirname(fileURLToPath(import.meta.url));

dotenv.config({ path: findConfig(".env") });
if (!env.validate()) process.exit();

let config;
if (process.env.PG_CONNECTION_STRING) {
  // Postgres
  const parse = pgConnectionString.parse;
  const rejectUnauthorized =
    process.env.PG_SSL_STRICT?.toLowerCase() === "true" ? true : false;
  config = {
    client: "pg",
    connection: {
      ...parse(process.env.PG_CONNECTION_STRING),
      ssl: {
        rejectUnauthorized
      }
    }
  };
} else {
  // SQLite
  makeDir(process.env.DIR_DATA);
  const filename = path.join(process.env.DIR_DATA, "database.db");
  config = {
    client: "sqlite3",
    connection: { filename }
  };
}

export default {
  ...config,
  useNullAsDefault: true,
  migrations: {
    tableName: `knex_vrclog_migrations`,
    directory: "./packages/main/src/modules/knex/migrations"
  },
  seeds: {
    directory: "./packages/main/src/modules/knex/seeds"
  }
};
