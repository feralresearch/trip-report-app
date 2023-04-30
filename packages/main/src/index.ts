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
import {
  ACTIONS,
  upsert,
  read,
  destroy
} from "./standalone/modules/actions.js";
import icon from "../../../buildResources/icon_19x19.png";
import type { ChildProcess } from "child_process";
import { fork } from "child_process";
import { knexInit } from "./standalone/modules/knex/knexfile.js";
import { fileNameToPath } from "./standalone/modules/vrcScreenshotsUtil.js";
import * as fs from "fs";
import prefs from "./standalone/modules/prefs.js";
import path from "path";
import sharp from "sharp";
import os from "os";
const isWin = os.platform() === "win32";
let logWatcherProcess: ChildProcess;
sharp.cache(false);

// Disable Hardware Acceleration to save more system resources.
app.disableHardwareAcceleration();

const vrcLogDir = path.join(
  app.getPath("home"),
  "AppData",
  "LocalLow",
  "VRChat",
  "VRChat"
);
const vrcScreenshotDir = path.join(app.getPath("home"), "Pictures", "VRChat");

const isInAsar = fs.existsSync(
  path.join(process.resourcesPath, "app.asar.unpacked")
);

const rootDirectory = isInAsar
  ? path.join(
      process.resourcesPath,
      "app.asar.unpacked",
      "packages",
      "main",
      "dist"
    )
  : __dirname;

const pathToMigrations = path.join(
  rootDirectory,
  "standalone",
  "modules",
  "knex",
  "migrations"
);

const pathToSeeds = path.join(
  rootDirectory,
  "standalone",
  "modules",
  "knex",
  "seeds"
);

const prefsFile = path.join(app.getPath("userData"), "config.json");
prefs
  .load({
    prefsFile,
    vrcLogDir,
    vrcScreenshotDir
  })
  ?.then((preferences) => {
    let knex = knexInit({
      pathToDatabase: preferences.dataDir,
      pathToMigrations,
      pathToSeeds
    });
    // Prevent electron from running multiple instances.
    knex?.migrate.latest().then(() => {
      const isSingleInstance = app.requestSingleInstanceLock();
      if (!isSingleInstance) {
        app.quit();
        process.exit(0);
      }
      app.on("second-instance", restoreOrCreateWindow);

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
      app
        .whenReady()
        .then(async () => {
          const pathToWatcherScript = path.join(
            `${
              isInAsar
                ? path.join(
                    process.resourcesPath,
                    "app.asar.unpacked",
                    "packages",
                    "main",
                    "dist"
                  )
                : __dirname
            }`,
            "standalone",
            "logWatcher.js"
          );

          if (!logWatcherProcess) {
            logWatcherProcess = fork(pathToWatcherScript, [
              prefsFile,
              vrcLogDir,
              vrcScreenshotDir
            ]);

            logWatcherProcess.removeAllListeners();

            logWatcherProcess.on("message", async (m: string) => {
              const { action } = JSON.parse(m);
              switch (action) {
                case ACTIONS.DB_LOCK_REQUEST:
                  console.log("DB: LOCK REQUESTED BY CHILD PROCESS");
                  knex?.destroy(() => {
                    logWatcherProcess.send(
                      JSON.stringify({ action: ACTIONS.DB_LOCK_GIVEN })
                    );
                    console.log("DB: LOCK GIVEN BY PARENT PROCESS");
                  });
                  break;

                case ACTIONS.DB_LOCK_RELEASE:
                  console.log("DB: LOCK RELEASED BY CHILD PROCESS");
                  knex = knexInit({
                    pathToDatabase: preferences.dataDir,
                    pathToMigrations,
                    pathToSeeds
                  });
                  break;

                default:
                //console.log(`WARNING: Unhandled action ${action}`);
              }
            });

            logWatcherProcess.on("close", (code: number) => {
              console.log(`ERROR: WATCHER CRASHED: exit code ${code}`);
            });

            // NOTE: On windows, there is no way to fire this with ctrl-c during dev >.<
            app.on("quit", () => {
              if (isWin) logWatcherProcess.send("SIGINT");
            });
          }
          // Open on launch
          launchMainWindow();
        })
        .catch((e) => console.error("Failed create window:", e));

      // Check for new version of the application - production mode only.
      /*
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
    */

      // Create custom protocol for local media loading
      app.whenReady().then(async () => {
        const preferences = await prefs.load({
          prefsFile,
          vrcLogDir,
          vrcScreenshotDir
        });
        protocol.registerFileProtocol("asset", (request, cb) => {
          if (
            preferences.dataDir &&
            !decodeURI(request.url).includes(preferences.dataDir)
          )
            return cb("404");
          const url = decodeURI(
            request.url.split("?")[0].replace("asset://", "")
          );
          try {
            return cb(url);
          } catch (e) {
            console.error(e);
            return cb("404");
          }
        });
      });

      app.whenReady().then(async () => {
        // APP
        ipcMain.on(ACTIONS.SET_TITLE, (event, title) => {
          const win = BrowserWindow.fromWebContents(event.sender);
          if (win) win.setTitle(title);
        });

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
            const pathToFile = fileNameToPath(fileName, preferences.dataDir);
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

              const pathToScript = path.join(
                `${
                  isInAsar
                    ? path.join(
                        process.resourcesPath,
                        "app.asar.unpacked",
                        "packages",
                        "main",
                        "dist"
                      )
                    : __dirname
                }`,
                "standalone",
                "export.js"
              );

              const child = fork(pathToScript, [
                prefsFile,
                id,
                dst,
                preferences.dataDir
              ]);
              child.on("message", async (progress: string) => {
                if (win) win.webContents.send(ACTIONS.PROGRESS, progress);
              });
              child.on("close", function (_code) {
                if (win) win.webContents.send(ACTIONS.PROGRESS, 0);
              });
            }
          }
        });

        ipcMain.handle(ACTIONS.REQUEST_MANUAL_SCAN, () => {
          logWatcherProcess.send(
            JSON.stringify({ action: ACTIONS.INVOKE_MANUAL_SCAN })
          );
        });

        ipcMain.handle(ACTIONS.BULK_IMPORT, (event, options = "{}") => {
          const { logs, screenshots } = JSON.parse(options);
          if (!logs || !screenshots)
            return { error: "Provide both logs and screenshot paths" };

          const win = BrowserWindow.fromWebContents(event.sender);
          const child = fork("./packages/main/src/standalone/bulkImport.js", [
            prefsFile,
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

        ipcMain.handle(ACTIONS.STATISTICS_GET, async () => {
          try {
            const stats = knex
              ? await knex.select("*").from("statistics")
              : null;
            return stats ? stats[0] : null;
          } catch (e) {
            return {};
          }
        });

        // INSTANCES
        ipcMain.handle(
          ACTIONS.INSTANCES_GET,
          async (_event, filter = "instance_list") => {
            try {
              const instances = knex
                ? await knex.select("*").from(filter).orderBy("ts", "desc")
                : [];
              return instances.map((instance) => ({
                ...instance,
                data: JSON.parse(instance.data)
              }));
            } catch (e) {
              return [];
            }
          }
        );

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

            const entries = logEntries.map((entry) => ({
              ...entry,
              data: JSON.parse(entry.data)
            }));
            return entries;
          } catch (e) {
            return [];
          }
        });

        // PREFERENCES
        let debounceTimer: NodeJS.Timeout;
        const debounce = (callback: () => void, time: number) => {
          global.clearTimeout(debounceTimer);
          debounceTimer = global.setTimeout(callback, time);
        };

        ipcMain.handle(ACTIONS.PREFERENCES_PATH, async () => {
          return path.join(app.getPath("userData"), "config.json");
        });

        ipcMain.handle(ACTIONS.PREFERENCES_GET, async () => {
          return preferences;
        });

        ipcMain.handle(
          ACTIONS.PREFERENCES_SET,
          async (_event, partialPrefs) => {
            debounce(async () => {
              await prefs.update({
                prefsFile,
                partialPrefs,
                vrcLogDir,
                vrcScreenshotDir
              });
            }, 500);
          }
        );

        // MEDIA
        ipcMain.handle(ACTIONS.MEDIA_UPSERT, async (_event, data) => {
          return upsert({
            knex,
            table: "media",
            idField: "media_id",
            id: data.media_id,
            data
          });
        });

        ipcMain.handle(ACTIONS.MEDIA_GET, async (_event, media_id) => {
          return read({
            knex,
            table: "media",
            idField: "media_id",
            id: media_id
          });
        });

        ipcMain.handle(ACTIONS.MEDIA_DELETE, async (_event, media_id) => {
          return destroy({
            knex,
            table: "media",
            idField: "media_id",
            id: media_id
          });
        });

        // SCREENSHOTS
        ipcMain.handle(ACTIONS.SCREENSHOT_SET, (_event, data) => {
          data = {
            ...data,
            usrs_in_image: JSON.stringify(data.usrs_in_image),
            tags: JSON.stringify(data.tags)
          };
          return upsert({
            knex,
            table: "screenshot",
            idField: "filename",
            id: data.filename,
            data
          });
        });

        ipcMain.handle(ACTIONS.SCREENSHOT_GET, async (_event, fileName) => {
          const attemptParse = (data: string) => {
            let retval;
            try {
              retval = JSON.parse(data);
            } catch (e) {
              retval = data;
            }
            return retval;
          };
          const data = await read({
            knex,
            table: "screenshot",
            idField: "filename",
            id: fileName,
            orderBy: "id"
          });

          return data.map((item: { usrs_in_image: string; tags: string }) => ({
            ...item,
            usrs_in_image: attemptParse(item.usrs_in_image),
            tags: attemptParse(item.tags)
          }));
        });

        ipcMain.handle(
          ACTIONS.SCREENSHOT_FAVORITE,
          (_event, fileName, isFavorite) => {
            return upsert({
              knex,
              table: "screenshot",
              idField: "filename",
              id: fileName,
              data: { favorite: isFavorite ? 1 : 0 }
            });
          }
        );

        ipcMain.handle(
          ACTIONS.SCREENSHOT_ANNOTATE,
          (_event, fileName, notes) => {
            return upsert({
              knex,
              table: "screenshot",
              idField: "filename",
              id: fileName,
              data: { notes }
            });
          }
        );

        // USER
        ipcMain.handle(ACTIONS.USER_SET, (_event, data) => {
          return upsert({
            knex,
            table: "user",
            idField: "usr_id",
            id: data.usr_id,
            data
          });
        });

        ipcMain.handle(ACTIONS.USER_GET, (_event, usr_id) => {
          return read({
            knex,
            table: "user",
            idField: "usr_id",
            id: usr_id
          });
        });

        // WORLD
        ipcMain.handle(ACTIONS.WORLD_SET, (_event, data) => {
          return upsert({
            knex,
            table: "world",
            idField: "wrld_id",
            id: data.wrld_id,
            data
          });
        });

        ipcMain.handle(ACTIONS.WORLD_GET, (_event, wrld_id) => {
          return read({
            knex,
            table: "world",
            idField: "wrld_id",
            id: wrld_id
          });
        });
      });
    });
  });
