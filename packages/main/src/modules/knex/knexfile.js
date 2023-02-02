import path from "path";
import { makeDir } from "../util.js";
import Knex from "knex";

export const knexInit = (pathToDatabase) => {
  makeDir(pathToDatabase);
  const filename = path.join(pathToDatabase, "database.db");
  return Knex({
    client: "sqlite3",
    connection: { filename },
    useNullAsDefault: true,
    migrations: {
      tableName: `knex_vrclog_migrations`,
      directory: "./packages/main/src/modules/knex/migrations"
    },
    seeds: {
      directory: "./packages/main/src/modules/knex/seeds"
    },
    pool: { propagateCreateError: false }
  });
};
