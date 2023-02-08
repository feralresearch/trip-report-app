"use strict";
import ACTIONS from "../actions.js";
import { isProcessRunning } from "./util.js";
import { initializeWatcher } from "./watcher.js";
import { processLogfiles } from "./vrcLogParse.js";
import { knexInit } from "./knex/knexfile.js";
import os from "os";
import prefs from "./prefs.js";
const prefsFile = process.argv[2];
if (!prefsFile) {
  console.log("FATAL: Please provide path to preferences file");
  process.exit();
}
const preferences = await prefs.load(prefsFile);
const isWin = os.platform() === "win32";
const knex = knexInit(preferences.dataDir);

console.log(`\n***************************`);
console.log(`*** Trip Report Backend ***`);
console.log(`***************************`);
console.log(`WATCHER: ${preferences.watcherEnabled ? "ENABLED" : "DISABLED"}`);
console.log(`DEBUG-MODE: ${preferences.debugMode ? "ENABLED" : "DISABLED"}`);
console.log(`OS: ${isWin ? "Windows" : `NOT Windows (${os.platform()})`}`);

const ipcSend = (action, payload) => {
  console.log(payload);
  if (process.send) process.send(JSON.stringify({ action, payload }));
};

knex.migrate.latest().then(async () => {
  const onProcess = () =>
    processLogfiles({
      preferences,
      onLog: (m) => ipcSend(ACTIONS.LOG, m)
    });

  // If VRChat isn't running, process any existing logfiles
  const isRunning = await isProcessRunning({
    windows: preferences.vrcProcessName
  });
  if (!isWin || (isWin && !isRunning)) onProcess();
  if (preferences.watcherEnabled)
    initializeWatcher({ processName: preferences.vrcProcessName, onProcess });
});
