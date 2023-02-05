"use strict";
import { exit } from "process";
import prefs from "./prefs.js";
import { knexInit } from "./knex/knexfile.js";

const prefsFile = process.argv[2];
const logsDir = process.argv[3];
const screenshotsDir = process.argv[4];
import { processLogfiles } from "./vrcLogParse.js";
import ACTIONS from "../actions.js";
const preferences = await prefs.load(prefsFile);
const knex = knexInit(preferences.dataDir);

console.log("*** Bulk import");
console.log(`Logs From: ${logsDir}`);
console.log(`Screens from: ${screenshotsDir}`);
console.log(preferences);

const ipcSend = (action, payload) => {
  console.log(payload);
  if (process.send) process.send(JSON.stringify({ action, payload }));
};

processLogfiles({
  preferences: {
    ...preferences,
    vrcScreenshotDir: screenshotsDir,
    vrcLogDir: logsDir,
    watcherRemoveAfterImport: false,
    watcherBackupAfterImport: true
  },
  knex,
  onLog: (m) => ipcSend(ACTIONS.LOG, m)
});

exit();
