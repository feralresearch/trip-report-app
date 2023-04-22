export { sha256sum } from "./nodeCrypto";
export { versions } from "./versions";
import { ipcRenderer, contextBridge } from "electron";
import { ACTIONS } from "../../main/src/standalone/modules/actions.js";

const addListener = (
  action: string,
  cb: (event: Electron.IpcRendererEvent, ...args: []) => void
) => {
  ipcRenderer.removeAllListeners(action);
  return ipcRenderer.on(action, cb);
};

contextBridge.exposeInMainWorld("electronAPI", {
  setTitle: (title: string) => ipcRenderer.send(ACTIONS.SET_TITLE, title),
  onIsWorkingUpdate: (
    cb: (event: Electron.IpcRendererEvent, ...args: []) => void
  ) => addListener(ACTIONS.PROGRESS, cb),
  onScanComplete: (
    cb: (event: Electron.IpcRendererEvent, ...args: []) => void
  ) => addListener(ACTIONS.DB_LOCK_RELEASE, cb),
  onWatcherGoOnline: (
    cb: (event: Electron.IpcRendererEvent, ...args: []) => void
  ) => addListener(ACTIONS.WATCHER_ONLINE, cb),
  onWatcherGoOffline: (
    cb: (event: Electron.IpcRendererEvent, ...args: []) => void
  ) => addListener(ACTIONS.WATCHER_OFFLINE, cb),
  onLogEvent: (cb: (event: Electron.IpcRendererEvent, ...args: []) => void) =>
    addListener(ACTIONS.LOG, cb)
});

contextBridge.exposeInMainWorld("databaseAPI", {
  rotateImage: (id: string, deg: number, cb: () => void) => {
    ipcRenderer.invoke(ACTIONS.ROTATE_IMAGE, [id, deg]).then(() => cb());
  },
  exportAsset: (id: string) => ipcRenderer.invoke(ACTIONS.EXPORT_ASSET, id),
  instancesGet: (filter: string) =>
    ipcRenderer.invoke(ACTIONS.INSTANCES_GET, filter),
  instanceGet: (id: string) => ipcRenderer.invoke(ACTIONS.INSTANCE_GET, id),
  statisticsGet: () => ipcRenderer.invoke(ACTIONS.STATISTICS_GET),
  preferencesGet: () => ipcRenderer.invoke(ACTIONS.PREFERENCES_GET),
  preferencesSet: (partialPrefs: object) =>
    ipcRenderer.invoke(ACTIONS.PREFERENCES_SET, partialPrefs),
  preferencesGetPath: () => ipcRenderer.invoke(ACTIONS.PREFERENCES_PATH),
  bulkImport: (options: string) =>
    ipcRenderer.invoke(ACTIONS.BULK_IMPORT, options),
  requestScan: () => ipcRenderer.invoke(ACTIONS.REQUEST_MANUAL_SCAN),

  mediaSet: (data: object) => ipcRenderer.invoke(ACTIONS.MEDIA_UPSERT, data),
  mediaGet: (media_id: string | Array<string>) =>
    ipcRenderer.invoke(ACTIONS.MEDIA_GET, media_id),
  mediaDelete: (media_id: string) =>
    ipcRenderer.invoke(ACTIONS.MEDIA_DELETE, media_id),

  screenshotSet: (data: object) =>
    ipcRenderer.invoke(ACTIONS.SCREENSHOT_SET, data),
  screenshotGet: (fileName: string) =>
    ipcRenderer.invoke(ACTIONS.SCREENSHOT_GET, fileName),
  screenshotFavorite: (fileName: string, isFavorite: boolean) =>
    ipcRenderer.invoke(ACTIONS.SCREENSHOT_FAVORITE, fileName, isFavorite),
  screenshotAnnotate: (fileName: string, annotation: string) =>
    ipcRenderer.invoke(ACTIONS.SCREENSHOT_ANNOTATE, fileName, annotation),

  userSet: (data: object) => ipcRenderer.invoke(ACTIONS.USER_SET, data),
  userGet: (usr_id: string) => ipcRenderer.invoke(ACTIONS.USER_GET, usr_id),

  worldSet: (data: object) => ipcRenderer.invoke(ACTIONS.WORLD_SET, data),
  worldGet: (wrld_id: string) => ipcRenderer.invoke(ACTIONS.WORLD_SET, wrld_id)
});
