export { sha256sum } from "./nodeCrypto";
export { versions } from "./versions";
import { ipcRenderer, contextBridge } from "electron";
import ACTIONS from "../../main/src/actions.js";

const addListener = (action: string, cb: any) => {
  ipcRenderer.removeAllListeners(action);
  return ipcRenderer.on(action, cb);
};

contextBridge.exposeInMainWorld("electronAPI", {
  setTitle: (title: string) => ipcRenderer.send("set-title", title),
  onIsWorkingUpdate: (
    cb: (event: Electron.IpcRendererEvent, ...args: []) => void
  ) => addListener(ACTIONS.PROGRESS, cb),
  onLogEvent: (cb: (event: Electron.IpcRendererEvent, ...args: []) => void) =>
    addListener(ACTIONS.LOG, cb)
});

contextBridge.exposeInMainWorld("databaseAPI", {
  rotateImage: (id: string, deg: number, cb: any) => {
    ipcRenderer.invoke(ACTIONS.ROTATE_IMAGE, [id, deg]).then(() => cb());
  },
  exportAsset: (id: string) => ipcRenderer.invoke(ACTIONS.EXPORT_ASSET, id),
  instancesGet: () => ipcRenderer.invoke(ACTIONS.INSTANCES_GET),
  instanceGet: (id: string) => ipcRenderer.invoke(ACTIONS.INSTANCE_GET, id),
  statisticsGet: () => ipcRenderer.invoke(ACTIONS.STATISTICS_GET),
  preferencesGet: () => ipcRenderer.invoke(ACTIONS.PREFERENCES_GET),
  preferencesSet: (partialPrefs: object) =>
    ipcRenderer.invoke(ACTIONS.PREFERENCES_SET, partialPrefs),
  preferencesGetPath: () => ipcRenderer.invoke(ACTIONS.PREFS_PATH)
});
