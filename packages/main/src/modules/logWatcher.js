"use strict";
import dotenv from "dotenv";
import findConfig from "find-config";
import path from "path";
import { fileURLToPath } from "url";
import ACTIONS from "../actions.js";
import env from "./environment.js";
import { envBool, isProcessRunning } from "./util.js";
import { initializeWatcher } from "./watcher.js";
import { processLogfiles } from "./vrcLogParse.js";

import os from "os";
const isWin = os.platform() === "win32";

import prefs from "./prefs.js";
import { knexInit } from "./knex/knexfile.js";
const prefsFile = process.argv[2];
const preferences = await prefs.load(prefsFile);
const knex = knexInit(preferences.dataDir);

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: findConfig(".env") });
env.display(preferences);

const ipcSend = (action, payload) => {
  console.log(payload);
  if (process.send) {
    process.send(JSON.stringify({ action, payload }));
  }
};

knex.migrate.latest().then(async () => {
  const onProcess = () =>
    processLogfiles({
      preferences,
      knex,
      onLog: (m) => ipcSend(ACTIONS.LOG, m)
    });

  //ipcSend(ACTIONS.PROGRESS, true);
  // If VRChat isn't running, process any existing logfiles
  const isRunning = await isProcessRunning({
    windows: preferences.vrcProcessName
  });

  if (!isWin || (isWin && !isRunning)) onProcess();

  if (preferences.watcherEnabled)
    initializeWatcher({ processName: preferences.vrcProcessName, onProcess });
});
