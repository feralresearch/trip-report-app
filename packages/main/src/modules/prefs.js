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
    vrcLogDir: "", //"C:\\Users\\An\\AppData\\LocalLow\\VRChat\\VRChat",
    vrcScreenshotDir: "", //"\\vampyroteuthis.localTentacleAndrewScreenshotsUNSORTED",
    dataDir: "",
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
    return new Promise(async (resolve) => {
      let defaultData;
      return await fs.readFile(pathToPrefFile, "utf-8", async (err, data) => {
        if (err) {
          console.log(`WARN: Writing defaults to ${pathToPrefFile}`);
          defaultData = {
            ...prefs.default,
            dataDir: path.join(
              pathToPrefFile.replace("config.json", ""),
              "Data"
            )
          };
          await prefs.save(pathToPrefFile, defaultData);
        }
        resolve(err ? defaultData : JSON.parse(data));
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
