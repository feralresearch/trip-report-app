import path from "path";
import { makeDir } from "../util.js";
import Knex from "knex";

import electron from "electron";
const { app } = electron;

import asar from "asar-node";
asar.register();
asar.addAsarToLookupPaths();

export const knexInit = (pathToDatabase) => {
  if (!pathToDatabase) {
    console.error("ERROR: Cannot initialize knex without a database");
    return;
  }
  makeDir(pathToDatabase);
  const filename = path.join(pathToDatabase, "database.db");

  const isPackaged = true; //app.isPackaged;
  const migrations = path.join(
    isPackaged ? process.resourcesPath : __dirname,
    "./app/packages/main/dist/modules/knex/migrations"
  );

  const seeds = path.join(
    isPackaged ? process.resourcesPath : __dirname,
    "./app/packages/main/dist/modules/knex/seeds"
  );

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
