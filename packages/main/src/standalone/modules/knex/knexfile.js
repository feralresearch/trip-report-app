import path from "path";
import { makeDir } from "../util.js";
import Knex from "knex";
import asar from "asar-node";
asar.register();
asar.addAsarToLookupPaths();

export const knexInit = ({ pathToDatabase, pathToMigrations, pathToSeeds }) => {
  if (!pathToDatabase) {
    console.error("*** ERROR: Cannot initialize knex without a database");
    console.error({ pathToDatabase, pathToMigrations, pathToSeeds });
    process.exit(1);
  }
  makeDir(pathToDatabase);
  const filename = path.join(pathToDatabase, "database.db");

  return Knex({
    client: "sqlite3",
    connection: { filename },
    useNullAsDefault: true,
    migrations: {
      tableName: `knex_vrclog_migrations`,
      directory: pathToMigrations
    },
    seeds: {
      directory: pathToSeeds
    },
    pool: { propagateCreateError: false, min: 0, max: 1 }
  });
};
