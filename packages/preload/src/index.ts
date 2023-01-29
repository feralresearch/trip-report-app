export { sha256sum } from "./nodeCrypto";
export { versions } from "./versions";
import { ipcRenderer, contextBridge } from "electron";
import ACTIONS from "../../main/src/actions.js";

contextBridge.exposeInMainWorld("electronAPI", {
  setTitle: (title: string) => ipcRenderer.send("set-title", title),
  onIsWorkingUpdate: (
    cb: (event: Electron.IpcRendererEvent, ...args: []) => void
  ) => ipcRenderer.on(ACTIONS.PROGRESS, cb),
  onLogEvent: (cb: (event: Electron.IpcRendererEvent, ...args: []) => void) =>
    ipcRenderer.on(ACTIONS.LOG, cb)
});

contextBridge.exposeInMainWorld("databaseAPI", {
  DIR_DATA: process.env.DIR_DATA,
  rotateImage: (id: string, deg: number, cb: any) => {
    ipcRenderer.invoke(ACTIONS.ROTATE_IMAGE, [id, deg]).then(() => cb());
  },
  exportAsset: (id: string) => ipcRenderer.invoke(ACTIONS.EXPORT_ASSET, id),
  instancesGet: () => ipcRenderer.invoke(ACTIONS.INSTANCES_GET),
  instanceGet: (id: string) => ipcRenderer.invoke(ACTIONS.INSTANCE_GET, id),
  statisticsGet: () => ipcRenderer.invoke(ACTIONS.STATISTICS_GET)
});
