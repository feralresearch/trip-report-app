import fs from "fs";
import { resolve } from "path";
import os from "os";
const isWin = os.platform() === "win32";
import path from "path";

const prefs = {
  default: (overrides = {}) => {
    //const userData = app.getPath("userData");
    let defaults = {
      dataDir: "",
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
  load: ({ prefsFile = "", vrcLogDir, vrcScreenshotDir }) => {
    if (prefsFile === "") return;
    return new Promise((resolve) => {
      return fs.readFile(prefsFile, "utf-8", async (err, data) => {
        if (err) {
          console.log(`WARN: Writing defaults to ${prefsFile}`);
          await prefs.save(
            prefs.default({
              dataDir: path.join(prefsFile.replace("config.json", ""), "Data"),
              vrcLogDir,
              vrcScreenshotDir
            })
          );
        }
        resolve(
          err
            ? prefs.default({
                dataDir: path.join(
                  prefsFile.replace("config.json", ""),
                  "Data"
                ),
                vrcLogDir,
                vrcScreenshotDir
              })
            : data
            ? JSON.parse(data)
            : ""
        );
      });
    });
  },
  update: async (params) => {
    const { prefsFile, partialPrefs, vrcLogDir, vrcScreenshotDir } = params;
    const currentPreferences = await prefs.load({
      prefsFile,
      vrcLogDir,
      vrcScreenshotDir
    });
    Object.keys(partialPrefs).forEach(
      (key) => (currentPreferences[key] = partialPrefs[key])
    );
    await prefs.save(prefsFile, { ...currentPreferences });
  },
  save: async (prefsFile, data) => {
    if (!data) return;
    fs.writeFileSync(prefsFile, JSON.stringify(data));
    resolve();
  }
};

export default prefs;
