/* 
nodemon ./packages/main/src/modules/bulkImport.js "/Users/andrew/Library/Application Support/TripReport/config.json" "/Volumes/Tentacle/Andrew/Screenshots/VRCLogs" "/Volumes/Tentacle/Andrew/Screenshots"
*/
"use strict";
import prefs from "../modules/prefs.js";
import { knexInit } from "../modules/knex/knexfile.js";
import { processLogfiles } from "../modules/vrcLogParse.js";
import { ACTIONS, ipcSend } from "../actions.js";
import { exit } from "process";

const prefsFile = process.argv[2];
let preferences = await prefs.load(prefsFile);
preferences = {
  ...preferences,
  vrcScreenshotDir: process.argv[4],
  vrcLogDir: process.argv[3],
  watcherRemoveAfterImport: false,
  watcherBackupAfterImport: false
};

console.log("NOT SAFE");
exit();

console.log(`\n*******************************`);
console.log(`*** Trip Report Bulk Import ***`);
console.log(`*******************************`);
console.log(`Prefs: ${prefsFile}`);
console.log(`Logs: ${preferences.vrcLogDir}`);
console.log(`Screenshots: ${preferences.vrcScreenshotDir}`);
console.log(`*******************************`);

const knex = knexInit(preferences.dataDir);
knex.migrate.latest().then(() => {
  processLogfiles({
    knex,
    preferences,
    onLog: (m) => ipcSend(ACTIONS.LOG, m)
  });
});
