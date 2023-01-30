import { app, ipcMain, BrowserWindow, protocol, dialog } from "electron";
import "./security-restrictions";
import { restoreOrCreateWindow } from "/@/mainWindow";
import ACTIONS from "./actions.js";
import Knex from "knex";
import knexConfig from "./modules/knex/knexfile.js";
import { fork } from "child_process";
import { fileNameToPath } from "./modules/vrcScreenshots.js";
import * as fs from "fs";
const knex = Knex(knexConfig);
import sharp from "sharp";
sharp.cache(false);

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

// Create the application window when the background process is ready.
app
  .whenReady()
  .then(async () => {
    const window = await restoreOrCreateWindow();

    const child = fork("./packages/main/src/modules/server.js");
    child.on("message", async (m: string) => {
      const { action, payload } = JSON.parse(m);
      window.webContents.send(action, payload);
    });
    child.on("close", function (code) {
      console.log("child process exited with code " + code);
    });
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
app.whenReady().then(() => {
  protocol.registerFileProtocol("asset", (request, cb) => {
    if (process.env.DIR_DATA && !request.url.includes(process.env.DIR_DATA))
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

ipcMain.handle(ACTIONS.ROTATE_IMAGE, async (_event, args) => {
  const [id, deg] = args;
  if (id.includes(".png")) {
    const fileName = id;
    const promises: any[] = [];
    let pathToFile = fileNameToPath(fileName);
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
      const child = fork("./packages/main/src/modules/export.js", [id, dst]);
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
    return logEntries.map((logEntry) => ({
      ...logEntry,
      data: JSON.parse(logEntry.data)
    }));
  } catch (e) {
    return [];
  }
});
