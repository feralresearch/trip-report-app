import {
  app,
  ipcMain,
  BrowserWindow,
  protocol,
  dialog,
  Tray,
  nativeImage,
  Menu
} from "electron";
import "./security-restrictions";
import { restoreOrCreateWindow } from "/@/mainWindow";
import ACTIONS from "./actions.js";

import { fork } from "child_process";
import { fileNameToPath } from "./modules/vrcScreenshots.js";
import * as fs from "fs";
import prefs from "./modules/prefs";
import path from "path";
import { knexInit } from "./modules/knex/knexfile.js";

import sharp from "sharp";
sharp.cache(false);

app.setLoginItemSettings({
  openAtLogin: false
});

// Prevent electron from running multiple instances.
const isSingleInstance = app.requestSingleInstanceLock();
if (!isSingleInstance) {
  app.quit();
  process.exit(0);
}
app.on("second-instance", restoreOrCreateWindow);

// Disable Hardware Acceleration to save more system resources.
app.disableHardwareAcceleration();

// Shout down background process if all windows was closed
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});

// @see https://www.electronjs.org/docs/latest/api/app#event-activate-macos Event: 'activate'.
app.on("activate", restoreOrCreateWindow);

const launchMainWindow = async () => {
  const window = await restoreOrCreateWindow();
  window.removeMenu();
  var isAppQuitting = false;
  app.on("before-quit", () => {
    isAppQuitting = true;
  });
  window.on("close", (e) => {
    if (!isAppQuitting) {
      e.preventDefault();
      window.minimize();
    }
  });
  logWatcherProcess.removeAllListeners();
  logWatcherProcess.on("message", async (m: string) => {
    const { action, payload } = JSON.parse(m);
    window.webContents.send(action, payload);
  });
  logWatcherProcess.on("close", (code: number) => {
    console.log(`ERROR: WATCHER CRASHED: exit code ${code}`);
  });
};

// Tray
app.whenReady().then(async () => {
  const prefsFile = path.join(app.getPath("userData"), "config.json");
  const preferences = await prefs.load(prefsFile);

  const icon = nativeImage.createFromDataURL(
    "data:image/png;base64,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"
  );
  let tray = new Tray(icon);

  const contextMenu = Menu.buildFromTemplate([
    {
      label: "Open",
      click() {
        launchMainWindow();
      }
    },
    { type: "separator" },
    { role: "quit" }
    /*{
      label: "Restart",
      click() {
        app.relaunch();
        app.quit();
      }
    },
    */
  ]);

  tray.setToolTip("Trip Report");
  tray.setContextMenu(contextMenu);
  tray.on("click", (e) => {
    launchMainWindow();
  });
});

// Create the application window when the background process is ready.
let logWatcherProcess: any;
app
  .whenReady()
  .then(async () => {
    const prefsFile = path.join(app.getPath("userData"), "config.json");
    const preferences = await prefs.load(prefsFile);
    // Log Watcher
    if (!logWatcherProcess)
      logWatcherProcess = fork("./packages/main/src/modules/logWatcher.js", [
        path.join(app.getPath("userData"), "config.json")
      ]);
    //if open on launch
    launchMainWindow();
  })
  .catch((e) => console.error("Failed create window:", e));

// Check for new version of the application - production mode only.
if (import.meta.env.PROD) {
  app
    .whenReady()
    .then(() => import("electron-updater"))
    .then((module) => {
      const autoUpdater =
        module.autoUpdater ||
        // @ts-expect-error Hotfix for https://github.com/electron-userland/electron-builder/issues/7338
        (module.default.autoUpdater as typeof module["autoUpdater"]);
      return autoUpdater.checkForUpdatesAndNotify();
    })
    .catch((e) => console.error("Failed check updates:", e));
}

// Create custom protocol for local media loading
app.whenReady().then(async () => {
  const prefsFile = path.join(app.getPath("userData"), "config.json");
  const preferences = await prefs.load(prefsFile);
  protocol.registerFileProtocol("asset", (request, cb) => {
    if (preferences.dataDir && !request.url.includes(preferences.dataDir))
      return cb("404");
    const url = request.url.split("?")[0].replace("asset://", "");
    try {
      return cb(url);
    } catch (e) {
      console.error(e);
      return cb("404");
    }
  });
});

app.whenReady().then(async () => {
  const prefsFile = path.join(app.getPath("userData"), "config.json");
  const preferences = await prefs.load(prefsFile);
  const knex = knexInit(preferences.dataDir);

  ipcMain.handle(ACTIONS.ROTATE_IMAGE, async (_event, args) => {
    const [id, deg] = args;
    if (id.includes(".png")) {
      const fileName = id;
      const promises: any[] = [];
      let pathToFile = fileNameToPath(fileName, preferences.dataDir);
      [
        pathToFile,
        pathToFile.replace("original.png", "thumbnail.png"),
        pathToFile.replace("original.png", "preview.png")
      ].forEach((path) => {
        promises.push(
          new Promise<void>((resolve) => {
            sharp(path)
              .rotate(deg)
              .toBuffer((e: any, buffer: any) => {
                fs.writeFileSync(path, buffer);
                resolve();
              });
          })
        );
      });
      await Promise.all(promises);
    }
  });

  ipcMain.handle(ACTIONS.EXPORT_ASSET, async (event, id) => {
    const win = BrowserWindow.fromId(event.sender.id);
    if (id.includes(".png")) {
      const fileName = id;
      const pathToFile = fileNameToPath(fileName);
      const selectFolder = await dialog.showSaveDialog({
        defaultPath: `~/Desktop/${fileName}`,
        properties: ["showOverwriteConfirmation"]
      });
      if (selectFolder?.filePath) {
        var data = fs.readFileSync(pathToFile);
        fs.writeFile(selectFolder.filePath, data, (err: any) => {
          if (err) console.error(err);
        });
      }
    } else {
      const selectFolder = await dialog.showSaveDialog({
        defaultPath: `~/Desktop/${id}.zip`,
        properties: ["showOverwriteConfirmation"]
      });
      if (selectFolder?.filePath) {
        const dst = selectFolder.filePath;
        const child = fork("./packages/main/src/modules/export.js", [
          id,
          dst,
          preferences.dataDir
        ]);
        child.on("message", async (progress: string) => {
          win?.webContents.send(ACTIONS.PROGRESS, progress);
        });
        child.on("close", function (code) {
          console.log("Export exited with code " + code);
          win?.webContents.send(ACTIONS.PROGRESS, 0);
        });
      }
    }
  });

  ipcMain.on("set-title", (event, title) => {
    const webContents = event.sender;
    const win = BrowserWindow.fromWebContents(webContents);
    win?.setTitle(title);
  });

  ipcMain.handle(ACTIONS.PREFS_PATH, async () => {
    return path.join(app.getPath("userData"), "config.json");
  });

  ipcMain.handle(ACTIONS.STATISTICS_GET, async () => {
    try {
      const stats = await knex.select("*").from("statistics");
      return stats[0];
    } catch (e) {
      return {};
    }
  });

  ipcMain.handle(ACTIONS.INSTANCES_GET, async () => {
    try {
      const instances = await knex.select("*").from("instance_list");
      return instances.map((instance) => ({
        ...instance,
        data: JSON.parse(instance.data)
      }));
    } catch (e) {
      return [];
    }
  });

  ipcMain.handle(ACTIONS.INSTANCE_GET, async (_event, id) => {
    try {
      let logEntries = await knex
        .select("*")
        .from("log")
        .where("instance", "=", id)
        .andWhereRaw("tag IS NOT NULL")
        .orderBy("ts");
      return logEntries.map((entry) => ({
        ...entry,
        data: JSON.parse(entry.data)
      }));
    } catch (e) {
      return [];
    }
  });

  ipcMain.handle(ACTIONS.PREFERENCES_GET, async () => {
    return preferences;
  });

  ipcMain.handle(ACTIONS.PREFERENCES_SET, async (_event, partialPrefs) => {
    await prefs.update(prefsFile, partialPrefs);
  });
});
