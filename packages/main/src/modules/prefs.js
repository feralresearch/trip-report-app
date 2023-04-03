import fs from "fs";
import path, { resolve } from "path";
import electron from "electron";
import os from "os";
const { app } = electron;
const isWin = os.platform() === "win32";

const prefsFile = app
  ? path.join(app.getPath("userData"), "config.json")
  : null;

const prefs = {
  prefsFile,
  default: () => {
    //const userData = app.getPath("userData");
    let defaults = {
      dataDir: path.join(prefsFile.replace("config.json", ""), "Data"),
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
      debugMode: true
    };
    if (isWin) {
      const vrcLogDir = path.join(
        app.getPath("home"),
        "AppData",
        "LocalLow",
        "VRChat",
        "VRChat"
      );
      const vrcScreenshotDir = path.join(
        app.getPath("home"),
        "Pictures",
        "VRChat"
      );
      defaults = {
        ...defaults,
        vrcProcessName: "VRChat.exe",
        vrcLogDir,
        vrcScreenshotDir,
        watcherEnabled: true
      };
    }
    return defaults;
  },
  load: (pathToPrefs = "") => {
    if (pathToPrefs === "" && !app) return;
    return new Promise((resolve) => {
      const _prefsFile = pathToPrefs !== "" ? pathToPrefs : prefsFile;
      return fs.readFile(_prefsFile, "utf-8", async (err, data) => {
        if (err) {
          console.log(`WARN: Writing defaults to ${_prefsFile}`);
          await prefs.save(prefs.default());
        }
        resolve(err ? prefs.default() : JSON.parse(data));
      });
    });
  },
  update: async (partialPrefs) => {
    const currentPreferences = await prefs.load();
    Object.keys(partialPrefs).forEach(
      (key) => (currentPreferences[key] = partialPrefs[key])
    );
    await prefs.save({ ...currentPreferences });
  },
  save: async (data) => {
    fs.writeFileSync(prefsFile, JSON.stringify(data));
    resolve();
  }
};

export default prefs;
