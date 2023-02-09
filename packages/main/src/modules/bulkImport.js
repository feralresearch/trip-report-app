/* 
nodemon ./packages/main/src/modules/bulkImport.js "/Users/andrew/Library/Application Support/TripReport/config.json" "/Volumes/Tentacle/Andrew/Screenshots/VRCLogs" "/Volumes/Tentacle/Andrew/Screenshots"
*/
"use strict";
import prefs from "./prefs.js";
import { knexInit } from "./knex/knexfile.js";
import { processLogfiles } from "./vrcLogParse.js";
import ACTIONS from "../actions.js";

const prefsFile = process.argv[2];
let preferences = await prefs.load(prefsFile);
preferences = {
  ...preferences,
  vrcScreenshotDir: process.argv[4],
  vrcLogDir: process.argv[3],
  watcherRemoveAfterImport: false,
  watcherBackupAfterImport: false
};

console.log(`\n*******************************`);
console.log(`*** Trip Report Bulk Import ***`);
console.log(`*******************************`);
console.log(`Prefs: ${prefsFile}`);
console.log(`Logs: ${preferences.vrcLogDir}`);
console.log(`Screenshots: ${preferences.vrcScreenshotDir}`);
console.log(`*******************************`);
const ipcSend = (action, payload) => {
  console.log(payload);
  if (process.send) process.send(JSON.stringify({ action, payload }));
};

const knex = knexInit(preferences.dataDir);
knex.migrate.latest().then(() => {
  processLogfiles({
    knex,
    preferences,
    onLog: (m) => ipcSend(ACTIONS.LOG, m)
  });
});
