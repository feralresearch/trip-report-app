export const ACTIONS = {
  PROGRESS: "PROGRESS",
  STATISTICS_GET: "STATISTICS_GET",
  INSTANCE_GET: "INSTANCE_GET",
  INSTANCES_GET: "INSTANCES_GET",
  LOG: "LOG",
  DB_LOCK_REQUEST: "DB_LOCK_REQUEST",
  DB_LOCK_GIVEN: "DB_LOCK_GIVEN",
  DB_LOCK_RELEASE: "DB_LOCK_RELEASE",
  EXPORT_ASSET: "EXPORT_ASSET",
  ROTATE_IMAGE: "ROTATE_IMAGE",
  PREFERENCES_GET: "PREFERENCES_GET",
  PREFERENCES_SET: "PREFERENCES_SET",
  PREFERENCES_PATH: "PREFERENCES_PATH",
  BULK_IMPORT: "BULK_IMPORT"
};

export const ipcSend = (action, payload = {}) => {
  if (process.send) {
    process.send(JSON.stringify({ action, payload }));
  } else {
    console.log(`${action}:${payload}`);
  }
};

export default { ACTIONS, ipcSend };
