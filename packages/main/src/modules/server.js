"use strict";
import dotenv from "dotenv";
import findConfig from "find-config";
import path from "path";
import { fileURLToPath } from "url";

import Knex from "knex";
import env from "./environment.js";
import { envBool, isProcessRunning } from "./util.js";
import { initializeWatcher } from "./watcher.js";
import { processLogfiles } from "./vrcLogParse.js";
import os from "os";
const isWin = os.platform() === "win32";
const knex = Knex(knexConfig);
import knexConfig from "./knex/knexfile.js";
import ACTIONS from "../actions.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: findConfig(".env") });
if (!env.validate()) process.exit();
env.display();

const ipcSend = (action, payload) => {
  console.log(payload);
  if (process.send) {
    process.send(JSON.stringify({ action, payload }));
  }
};

knex.migrate.latest().then(async () => {
  const onProcess = () =>
    processLogfiles({ knex, onLog: (m) => ipcSend(ACTIONS.LOG, m) });

  //ipcSend(ACTIONS.PROGRESS, true);
  // If VRChat isn't running, process any existing logfiles
  const isRunning = await isProcessRunning({
    windows: process.env.VRCHAT_PROCESS_NAME
  });

  if (!isWin || (isWin && !isRunning)) onProcess();

  if (envBool(process.env.WATCHER_ENABLED)) initializeWatcher({ onProcess });
});
