import fs from "fs";
import path from "path";
import readline from "readline";
import humanizeDuration from "humanize-duration";
import { DateTime, Interval } from "luxon";
import { v4 as uuidv4 } from "uuid";
import { buildDirectoryCache, ingestScreenshots } from "./vrcScreenshots.js";
import { importRecords } from "./vrcLogImport.js";
import { makeDir } from "./util.js";

const _annotateLogData = ({ preferences, data, file }) => {
  let currentWorldId, currentWorldName, instanceId;
  const finalTimestamp = data[data.length - 1]?.ts;
  data.forEach((record, idx) => {
    // First indication of world loading
    if (record.event.includes("[Behaviour] Destination fetching:")) {
      instanceId = uuidv4();
      currentWorldId = `wrld_${record.event
        .split("wrld_")[1]
        .split(":")[0]
        .trim()}`;
      record.tag = "world_load";
      record.data = { id: currentWorldId };
    }
    record.instance = instanceId;
    // World (Room) Enter
    if (record.event.includes("Entering Room")) {
      record.tag = "world_enter";
      currentWorldName = record.event.split("Entering Room:")[1].trim();
      const tsEnter = record.ts;
      const nextRoom = data.find(
        (item, thisIdx) =>
          (item.event.includes("Entering Room") ||
            item.event.includes("VRCApplication: OnApplicationQuit")) &&
          thisIdx > idx
      );
      const tsExit = nextRoom ? nextRoom.ts : finalTimestamp;
      const tsDuration = Interval.fromDateTimes(
        DateTime.fromMillis(tsEnter),
        DateTime.fromMillis(tsExit)
      )
        .toDuration()
        .valueOf();
      const tsString = `${DateTime.fromMillis(tsEnter).toLocaleString(
        DateTime.TIME_SIMPLE
      )} - ${DateTime.fromMillis(tsExit).toLocaleString(DateTime.TIME_SIMPLE)}`;
      record.data = {
        name: currentWorldName,
        tsEnter,
        tsExit,
        tsDuration,
        tsDurationString: humanizeDuration(tsDuration),
        tsString,
        url: `https://vrchat.com/home/world/${currentWorldId}`
      };
    }
    // Screenshot
    if (record.event.includes("Took screenshot to:")) {
      record.tag = "screenshot";
      const original = record.event.split("screenshot to: ")[1];
      const fileName = !original
        ? "ERROR"
        : path.basename(original.replaceAll("\\", "/"));
      record.data = {
        instance: instanceId,
        id: currentWorldId,
        fileName
      };
    }
    // Player
    if (record.event.includes("OnPlayerJoined")) {
      record.tag = "player";
      const name = `${record.event
        .replace("[Behaviour] OnPlayerJoined", "")
        .trim()
        .replaceAll("_", "")}`;
      record.data = {
        id: currentWorldId,
        instance: instanceId,
        name
      };
    }
    // Media
    if (record.event.includes("[Video Playback]")) {
      record.tag = "media";
      try {
        record.data = {
          instance: instanceId,
          id: currentWorldId,
          url: record.event.split("URL ")[1].split("'")[1].trim()
        };
      } catch {
        record.data = {
          instance: instanceId,
          id: currentWorldId,
          url: null,
          error: record.event
        };
      }
    }
    if (record.data)
      record.data = JSON.stringify({ ...record.data, logFile: file });
  });
  return preferences.dbOptimize
    ? data.filter((datum) => datum.tag?.length > 0)
    : data;
};

const vrcLogParse = {
  convertToJson: async (file, preferences) => {
    let idx = 0;
    const jsonData = [];
    const input = fs.createReadStream(file);
    input.on("error", (e) => console.error(e));
    const lineReader = readline.createInterface({
      input,
      crlfDelay: Infinity
    });
    lineReader.on("line", (line) => {
      if (line.trim().length > 0) {
        let lineArr = line.split(" ");
        const possibleDate = lineArr[0];
        const attemptSplit = possibleDate.split(".");
        if (
          attemptSplit.length === 3 &&
          !isNaN(parseInt(attemptSplit[0], 10))
        ) {
          const ts = Date.parse(`${lineArr[0]} ${lineArr[1]}`);
          lineArr.shift();
          lineArr.shift();
          const type = lineArr[0].trim();
          lineArr.shift();
          const event = lineArr
            .join(" ")
            .trim()
            .replace("-  ", "")
            .replaceAll("\r", "");
          jsonData.push({
            ts,
            type,
            event
          });
          idx++;
        } else {
          if (idx > 0) {
            jsonData[idx - 1].event = `${
              jsonData[idx - 1]?.event
            } ${lineArr.join(" ")}`;
          }
        }
      }
    });
    await new Promise((res) => lineReader.once("close", res));
    if (preferences.debugMode)
      console.log(
        `PARSE: ${path.basename(file)} - ${
          jsonData.length
        } records - HEAP: ${Math.round(
          process.memoryUsage().heapUsed / 1024 / 1024
        )} MB`
      );
    return preferences.dbAnnotate
      ? _annotateLogData({ preferences, data: jsonData, file })
      : jsonData;
  },
  processLogfiles: ({ knex, preferences, onLog }) => {
    if (!preferences.vrcLogDir.length) return;
    const directoryCache = buildDirectoryCache(preferences.vrcScreenshotDir);
    fs.promises
      .readdir(preferences.vrcLogDir)
      .then(async (files) => {
        const logFiles = files.filter((file) => file.includes(".txt"));

        for (const logFile of logFiles) {
          const file = path.join(preferences.vrcLogDir, logFile);
          const jsonData = await convertToJson(file, preferences);
          const id = file.replace(".json", "");
          if (preferences.debugMode) {
            console.log(`PROCESSING: ${id}`);
            console.log(file);
          }

          await importRecords({
            knex,
            id,
            jsonData,
            onLog
          });

          if (preferences.screenshotsManage)
            ingestScreenshots({
              assetList: jsonData.filter((item) => item.tag === "screenshot"),
              directoryCache,
              onLog,
              preferences
            });

          const removeAfterImport = () => {
            if (preferences.watcherRemoveAfterImport) {
              if (preferences.debugMode)
                console.log(`REMOVING LOGFILE: ${file}`);
              fs.unlinkSync(file);
            }
          };
          if (preferences.watcherBackupAfterImport) {
            var fileName = path.basename(file);
            const backupDir = path.join(preferences.dataDir, "backup");
            makeDir(backupDir);
            fs.copyFile(file, path.join(backupDir, fileName), (err) => {
              if (err) return;
              removeAfterImport();
            });
            if (preferences.debugMode)
              console.log(`BACKING UP LOGFILE: ${fileName}`);
          } else {
            removeAfterImport();
          }
        }
      })
      .catch((err) => {
        console.log(err);
      });
  }
};

export const { convertToJson, processLogfiles } = vrcLogParse;
export default vrcLogParse;
