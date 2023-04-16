import path from "path";
import { makeDir } from "../util.js";
import Knex from "knex";

import asar from "asar-node";
asar.register();
asar.addAsarToLookupPaths();

import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const knexInit = (pathToDatabase) => {
  if (!pathToDatabase) {
    console.error("ERROR: Cannot initialize knex without a database");
    return;
  }
  makeDir(pathToDatabase);
  const filename = path.join(pathToDatabase, "database.db");

  const migrations = path.join(
    __dirname,
    "standalone",
    "modules",
    "knex",
    "migrations"
  );

  const seeds = path.join(__dirname, "standalone", "modules", "knex", "seeds");

  return Knex({
    client: "sqlite3",
    connection: { filename },
    useNullAsDefault: true,
    migrations: {
      tableName: `knex_vrclog_migrations`,
      directory: migrations
    },
    seeds: {
      directory: seeds
    },
    pool: { propagateCreateError: false, min: 0, max: 1 }
  });
};
