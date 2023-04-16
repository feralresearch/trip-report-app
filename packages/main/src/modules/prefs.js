import fs from "fs";
import { resolve } from "path";
import os from "os";
const isWin = os.platform() === "win32";

const prefs = {
  default: (overrides = {}) => {
    //const userData = app.getPath("userData");
    let defaults = {
      dataDir: "", //path.join(prefsFile.replace("config.json", ""), "Data"),
      openAtLogin: false,
      showInTaskbar: false,
      vrcProcessName: "",
      vrcLogDir: "",
      vrcScreenshotDir: "",
      watcherEnabled: false,
      watcherRemoveAfterImport: true,
      watcherBackupAfterImport: true,
      dbForceRebuild: true,
      dbAnnotate: true,
      dbOptimize: true,
      screenshotsManage: true,
      screenshotsForceRebuild: false,
      debugMode: true,
      ...overrides
    };
    if (isWin) {
      defaults = {
        ...defaults,
        vrcProcessName: "VRChat.exe",
        watcherEnabled: true
      };
    }
    return defaults;
  },
  load: (pathToPrefs = "", vrcLogDir, vrcScreenshotDir) => {
    if (pathToPrefs === "") return;
    return new Promise((resolve) => {
      return fs.readFile(pathToPrefs, "utf-8", async (err, data) => {
        if (err) {
          console.log(`WARN: Writing defaults to ${pathToPrefs}`);
          await prefs.save(prefs.default({ vrcLogDir, vrcScreenshotDir }));
        }
        resolve(
          err
            ? prefs.default({ vrcLogDir, vrcScreenshotDir })
            : JSON.parse(data)
        );
      });
    });
  },
  update: async (prefsFile, partialPrefs, vrcLogDir, vrcScreenshotDir) => {
    const currentPreferences = await prefs.load(
      prefsFile,
      vrcLogDir,
      vrcScreenshotDir
    );
    Object.keys(partialPrefs).forEach(
      (key) => (currentPreferences[key] = partialPrefs[key])
    );
    await prefs.save({ ...currentPreferences });
  },
  save: async (prefsFile, data) => {
    fs.writeFileSync(prefsFile, JSON.stringify(data));
    resolve();
  }
};

export default prefs;
