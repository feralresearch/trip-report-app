export const formConfig = [
  {
    key: "openAtLogin",
    display: "Open at login",
    tooltip: "Starts Trip Report on login, accessible via the system tray",
    hidden: false
  },
  {
    key: "showInTaskbar",
    display: "Show in taskbar",
    tooltip:
      "Display a taskbar icon for the trip report window when it is open",
    hidden: true
  },
  {
    key: "vrcProcessName",
    display: "VRC Process Name",
    tooltip:
      "The name of the VRC process to watch. You probably shouldn't ever change this!",
    hidden: true
  },
  {
    key: "watcherEnabled",
    display: "Watch enabled",
    tooltip: "Automatically watch and ingest new logs",
    hidden: false
  },
  {
    key: "watcherRemoveAfterImport",
    display: "Remove logs after import",
    tooltip:
      "Remove the log files from the source directory after import. Note that VRChat itself will delete logs every 24 hours. You might also want to turn on backups",
    hidden: false
  },
  {
    key: "watcherBackupAfterImport",
    display: "Backup logs after import",
    tooltip: "Keep a copy of the original VRC Logs after importing them.",
    hidden: false
  },
  {
    key: "dbForceRebuild",
    display: "DB: Force Rebuild",
    tooltip: "",
    hidden: true
  },
  {
    key: "dbAnnotate",
    display: "DB: Annotate Records",
    tooltip: "",
    hidden: true
  },
  {
    key: "dbOptimize",
    display: "DB: Only record useful",
    tooltip: "",
    hidden: true
  },
  {
    key: "screenshotsManage",
    display: "Manage Screenshots",
    tooltip:
      "If this is unchecked, Trip Report will not manage screenshots at all (no galleries will be built). Galleries created prior to changing this will remain in place. ",
    hidden: false
  },
  {
    key: "screenshotsForceRebuild",
    display: "Force Screenshot Rebuild",
    tooltip:
      "If true, will not skip existing screenshots but will overwrite them. If changes (such as image rotation) have been applied, this will overwrite those changes as well ",
    hidden: true
  },
  {
    key: "vrcLogDir",
    display: "VRC Logs",
    tooltip: "Folder where VRChat keeps logfiles",
    hidden: false
  },
  {
    key: "vrcScreenshotDir",
    display: "VRC Screenshots",
    tooltip: "Folder where VRChat keeps screenshots",
    hidden: false
  },
  {
    key: "dataDir",
    display: "Data",
    tooltip: "Directory with the application stores its data",
    hidden: false
  },
  {
    key: "debugMode",
    display: "Debug Mode",
    tooltip: "Log additional debugging info",
    hidden: true
  },
  {
    key: "googleApiKey",
    display: "Google API Key",
    tooltip: "Required to resolve information about media links",
    hidden: false
  }
];
