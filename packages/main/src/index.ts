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
import icon from "../../../buildResources/icon_19x19.png";
import type { ChildProcess } from "child_process";
import { fork } from "child_process";
import { fileNameToPath } from "./modules/vrcScreenshots.js";
import * as fs from "fs";
import prefs from "./modules/prefs.js";
import path from "path";
import { knexInit } from "./modules/knex/knexfile.js";
import sharp from "sharp";
import os from "os";
const isWin = os.platform() === "win32";

sharp.cache(false);

//app.commandLine.appendSwitch("js-flags", "--max-old-space-size=8192");

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

app.setLoginItemSettings({
  openAtLogin: true
});

const launchMainWindow = async () => {
  const window = await restoreOrCreateWindow();
  window.removeMenu();
  let isAppQuitting = false;
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
  const tray = new Tray(nativeImage.createFromDataURL(icon));
  const contextMenu = Menu.buildFromTemplate([
    {
      label: "Open",
      click() {
        launchMainWindow();
      }
    },
    { type: "separator" },
    { role: "quit" }
  ]);

  tray.setToolTip("Trip Report");
  tray.setContextMenu(contextMenu);
  tray.on("click", () => {
    launchMainWindow();
  });
});

// Create the application window when the background process is ready.
let logWatcherProcess: ChildProcess;
app
  .whenReady()
  .then(async () => {
    // Log Watcher
    if (!logWatcherProcess) {
      logWatcherProcess = fork("./packages/main/src/modules/logWatcher.js", [
        prefs.prefsFile ? prefs.prefsFile : ""
      ]);

      // NOTE: On windows, there is no way to fire this with ctrl-c during dev >.<
      app.on("quit", () => {
        if (isWin) logWatcherProcess.send("SIGINT");
      });
    }
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
        (module.default.autoUpdater as typeof module["autoUpdater"]);
      return autoUpdater.checkForUpdatesAndNotify();
    })
    .catch((e) => console.error("Failed check updates:", e));
}

// Create custom protocol for local media loading
app.whenReady().then(async () => {
  const preferences = await prefs.load();
  protocol.registerFileProtocol("asset", (request, cb) => {
    if (
      preferences.dataDir &&
      !decodeURI(request.url).includes(preferences.dataDir)
    )
      return cb("404");
    const url = decodeURI(request.url.split("?")[0].replace("asset://", ""));
    try {
      return cb(url);
    } catch (e) {
      console.error(e);
      return cb("404");
    }
  });
});

app.whenReady().then(async () => {
  const preferences = await prefs.load();
  const knex = knexInit(preferences.dataDir);

  ipcMain.handle(ACTIONS.ROTATE_IMAGE, async (_event, args) => {
    const [id, deg] = args;
    if (id.includes(".png")) {
      const fileName = id;
      const promises: unknown[] = [];
      const pathToFile = fileNameToPath(fileName, preferences.dataDir);
      [
        pathToFile,
        pathToFile.replace("original.png", "thumbnail.png"),
        pathToFile.replace("original.png", "preview.png")
      ].forEach((path) => {
        promises.push(
          new Promise<void>((resolve) => {
            sharp(path)
              .rotate(deg)
              .toBuffer((e, buffer) => {
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
      if (typeof selectFolder === "object" && selectFolder.filePath) {
        const data = fs.readFileSync(pathToFile);
        fs.writeFile(selectFolder.filePath, data, (err: unknown) => {
          if (err) console.error(err);
        });
      }
    } else {
      const selectFolder = await dialog.showSaveDialog({
        defaultPath: `~/Desktop/${id}.zip`,
        properties: ["showOverwriteConfirmation"]
      });
      if (typeof selectFolder === "object" && selectFolder.filePath) {
        const dst = selectFolder.filePath;
        const child = fork("./packages/main/src/modules/export.js", [
          prefs.prefsFile,
          id,
          dst,
          preferences.dataDir
        ]);
        child.on("message", async (progress: string) => {
          if (win) win.webContents.send(ACTIONS.PROGRESS, progress);
        });
        child.on("close", function (code) {
          console.log("Export exited with code " + code);
          if (win) win.webContents.send(ACTIONS.PROGRESS, 0);
        });
      }
    }
  });

  ipcMain.on("set-title", (event, title) => {
    const win = BrowserWindow.fromWebContents(event.sender);
    if (win) win.setTitle(title);
  });

  ipcMain.handle(ACTIONS.BULK_IMPORT, (event, options = "{}") => {
    const { logs, screenshots } = JSON.parse(options);
    if (!logs || !screenshots)
      return { error: "Provide both logs and screenshot paths" };

    const win = BrowserWindow.fromWebContents(event.sender);
    const child = fork("./packages/main/src/modules/bulkImport.js", [
      prefs.prefsFile,
      logs,
      screenshots
    ]);
    child.on("close", function (code) {
      console.log("Bulk import exited with code " + code);
      if (win) win.webContents.send(ACTIONS.PROGRESS, 0);
    });
    child.on("message", async (progress: string) => {
      if (win) win.webContents.send(ACTIONS.PROGRESS, progress);
    });
    return { message: "launched" };
  });

  ipcMain.handle(ACTIONS.PREFERENCES_PATH, async () => {
    return path.join(app.getPath("userData"), "config.json");
  });

  ipcMain.handle(ACTIONS.STATISTICS_GET, async () => {
    try {
      const stats = knex ? await knex.select("*").from("statistics") : null;
      return stats ? stats[0] : null;
    } catch (e) {
      return {};
    }
  });

  ipcMain.handle(ACTIONS.INSTANCES_GET, async () => {
    try {
      const instances = knex
        ? await knex.select("*").from("instance_list").orderBy("ts", "desc")
        : [];
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
      const logEntries = knex
        ? await knex
            .select("*")
            .from("log")
            .where("instance", "=", id)
            .andWhereRaw("tag IS NOT NULL")
            .orderBy("ts")
        : [];
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

  let debounceTimer: NodeJS.Timeout;
  const debounce = (callback: () => void, time: number) => {
    global.clearTimeout(debounceTimer);
    debounceTimer = global.setTimeout(callback, time);
  };

  ipcMain.handle(ACTIONS.PREFERENCES_SET, async (_event, partialPrefs) => {
    debounce(async () => {
      await prefs.update(partialPrefs);
    }, 500);
  });
});
