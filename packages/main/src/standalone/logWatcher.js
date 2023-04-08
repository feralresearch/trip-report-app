"use strict";
import { ACTIONS, ipcSend } from "../actions.js";
import { isProcessRunning } from "../modules/util.js";
import { initializeWatcher } from "../modules/watcher.js";
import { processLogfiles } from "../modules/vrcLogParse.js";
import { knexInit } from "../modules/knex/knexfile.js";
import os from "os";
import prefs from "../modules/prefs.js";

const prefsFile = process.argv[2];
if (!prefsFile) {
  console.log("FATAL: Please provide path to preferences file");
  process.exit();
}
const preferences = await prefs.load(prefsFile);
const isWin = os.platform() === "win32";

console.log(
  `WATCHER: ${isWin ? "Windows" : `NOT Windows (${os.platform()})`} (${
    preferences.debugMode ? "Debug Enabled" : "Debug Disabled"
  })`
);

console.log(`WATCHER: ${preferences.watcherEnabled ? "ENABLED" : "DISABLED"}`);

process.on("message", (m) => {
  const message = JSON.parse(m);
  const knex = knexInit(preferences.dataDir);
  if (message.action == ACTIONS.DB_LOCK_GIVEN) {
    processLogfiles({
      knex,
      preferences,
      onLog: (m) => ipcSend(ACTIONS.LOG, m),
      onComplete: () => {
        knex.destroy(() => {
          ipcSend(ACTIONS.DB_LOCK_RELEASE);
        });
      }
    });
  }
});

// Process Log Files
const _processLogFiles = () => {
  ipcSend(ACTIONS.DB_LOCK_REQUEST);
};

// If VRChat isn't running, process any existing logfiles
const isRunning = await isProcessRunning({
  windows: preferences.vrcProcessName
});
if (!isWin || (isWin && !isRunning)) _processLogFiles();
if (preferences.watcherEnabled)
  initializeWatcher({
    processName: preferences.vrcProcessName,
    onProcess: _processLogFiles
  });
