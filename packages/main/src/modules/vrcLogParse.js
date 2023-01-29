import fs from "fs";
import path from "path";
import readline from "readline";
import humanizeDuration from "humanize-duration";
import { DateTime, Interval } from "luxon";
import { v4 as uuidv4 } from "uuid";
import { envBool } from "../modules/util.js";
import { ingestScreenshots, buildDirectoryCache } from "./vrcScreenshots.js";
import { importRecords } from "./vrcLogImport.js";
import { makeDir } from "../modules/util.js";

const _annotateLogData = (data, file) => {
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
  return envBool(process.env.DB_OPTIMIZE)
    ? data.filter((datum) => datum.tag?.length > 0)
    : data;
};

const vrcLogParse = {
  convertToJson: async (file) => {
    let idx = 0;
    const jsonData = [];
    const input = fs.createReadStream(file);
    input.on("error", (e) => console.error(e));
    const rl = readline.createInterface({
      input,
      crlfDelay: Infinity
    });
    rl.on("line", (line) => {
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
    await new Promise((res) => rl.once("close", res));
    if (envBool(process.env.DEBUG))
      console.log(
        `PARSE: ${path.basename(file)} - ${
          jsonData.length
        } records - HEAP: ${Math.round(
          process.memoryUsage().heapUsed / 1024 / 1024
        )} MB`
      );
    return envBool(process.env.DB_ANNOTATE)
      ? _annotateLogData(jsonData, file)
      : jsonData;
  },
  processLogfiles: ({ knex, onLog }) => {
    const directoryCache = buildDirectoryCache();
    fs.promises.readdir(process.env.DIR_VRC_LOG_FILES).then(async (files) => {
      const logFiles = files.filter((file) => file.includes(".txt"));
      logFiles.forEach(async (logFile) => {
        const file = path.join(process.env.DIR_VRC_LOG_FILES, logFile);
        if (envBool(process.env.DEBUG)) console.log(`W->PROCESSING: ${file}`);
        const jsonData = await convertToJson(file);
        const id = file.replace(".json", "");
        await importRecords({ id, jsonData, knex, onLog });
        if (envBool(process.env.SCREENSHOTS_MANAGE))
          ingestScreenshots(
            jsonData.filter((item) => item.tag === "screenshot"),
            directoryCache,
            onLog
          );
        const removeAfterImport = () => {
          if (envBool(process.env.WATCHER_REMOVE_AFTER_IMPORT)) {
            if (envBool(process.env.DEBUG)) console.log(`W->REMOVING: ${file}`);
            fs.unlinkSync(file);
          }
        };
        if (envBool(process.env.WATCHER_BACKUP_AFTER_IMPORT)) {
          var fileName = path.basename(file);
          const backupDir = path.join(process.env.DIR_DATA, "backup");
          makeDir(backupDir);
          fs.copyFile(file, path.join(backupDir, fileName), (err) => {
            if (err) return;
            removeAfterImport();
          });
          if (envBool(process.env.DEBUG))
            console.log(`W->BACKING UP: ${file} to ${backupDir}`);
        } else {
          removeAfterImport();
        }
      });
    });
  }
};

export const { convertToJson, processLogfiles } = vrcLogParse;
export default vrcLogParse;
