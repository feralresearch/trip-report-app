"use strict";
import { ACTIONS, ipcSend } from "../modules/actions.js";
import { isProcessRunning } from "../modules/util.js";
import { initializeWatcher } from "../modules/watcher.js";
import { processLogfiles } from "../modules/vrcLogParse.js";
import { knexInit } from "../modules/knex/knexfile.js";
import os from "os";
import prefs from "../modules/prefs.js";

const onLog = (m) => {
  console.log(m);
  ipcSend(ACTIONS.LOG, m);
};

const prefsFile = process.argv[2];
const vrcLogDir = process.argv[3];
const vrcScreenshotDir = process.argv[4];

if (!prefsFile) {
  onLog("FATAL: Please provide path to preferences file");
  process.exit();
}
const preferences = await prefs.load(prefsFile, vrcLogDir, vrcScreenshotDir);
const isWin = os.platform() === "win32";

onLog(
  `WATCHER: ${isWin ? "Windows" : `NOT Windows (${os.platform()})`} (${
    preferences.debugMode ? "Debug Enabled" : "Debug Disabled"
  })`
);

let isBusy = false;
process.on("message", (m) => {
  let message;
  try {
    message = JSON.parse(m);
  } catch {
    message = m;
  }
  const knex = knexInit(preferences.dataDir);
  if (message.action == ACTIONS.INVOKE_MANUAL_SCAN) {
    if (isBusy) {
      onLog("WATCHER: I'm busy, go away");
    } else {
      isBusy = true;
      onLog("WATCHER: Manual Scan Invoked");
      ipcSend(ACTIONS.DB_LOCK_REQUEST);
    }
  } else if (message.action == ACTIONS.DB_LOCK_GIVEN) {
    processLogfiles({
      knex,
      preferences,
      onLog,
      onComplete: () => {
        knex.destroy(() => {
          ipcSend(ACTIONS.DB_LOCK_RELEASE);
          isBusy = false;
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
if (preferences.watcherEnabled) {
  onLog("WATCHER: Enabled");
  initializeWatcher({
    onLog,
    processName: preferences.vrcProcessName,
    onProcess: _processLogFiles
  });
} else {
  onLog("WATCHER: Disabled");
}
