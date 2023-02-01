import fs from "fs";
import path, { resolve } from "path";

let debounceTimer;
const debounce = (callback, time) => {
  global.clearTimeout(debounceTimer);
  debounceTimer = global.setTimeout(callback, time);
};

const prefs = {
  default: {
    openAtLogin: false,
    showInTaskbar: false,
    vrcProcessName: "VRChat.exe",
    vrcLogDir: "C:\\Users\\An\\AppData\\LocalLow\\VRChat\\VRChat",
    vrcScreenshotDir: "\\vampyroteuthis.localTentacleAndrewScreenshotsUNSORTED",
    dataDir: "C:\\Users\\AnCode\\trip-report-app\\DATA",
    watcherEnabled: true,
    watcherRemoveAfterImport: true,
    watcherBackupAfterImport: true,
    dbForceRebuild: true,
    dbAnnotate: true,
    dbOptimize: false,
    screenshotsManage: true,
    screenshotsForceRebuild: false,
    debugMode: true
  },
  load: (pathToPrefFile) => {
    return new Promise((resolve) => {
      return fs.access(pathToPrefFile, fs.F_OK, async (err) => {
        if (err) {
          console.log(
            `WARN: Prefs missing, writing defaults to ${pathToPrefFile}`
          );
          await prefs.save(pathToPrefFile, prefs.default);
          resolve(JSON.parse(fs.readFileSync(pathToPrefFile, "utf-8")));
        } else {
          resolve(JSON.parse(fs.readFileSync(pathToPrefFile, "utf-8")));
        }
      });
    });
  },
  update: async (pathToPrefFile, partialPrefs) => {
    const currentPreferences = await prefs.load(pathToPrefFile);
    Object.keys(partialPrefs).forEach(
      (key) => (currentPreferences[key] = partialPrefs[key])
    );
    await prefs.save(pathToPrefFile, { ...currentPreferences });
  },
  save: async (pathToPrefFile, prefData) => {
    debounce(async () => {
      fs.writeFileSync(pathToPrefFile, JSON.stringify(prefData));
      resolve();
    }, 500);
  }
};

export default prefs;
