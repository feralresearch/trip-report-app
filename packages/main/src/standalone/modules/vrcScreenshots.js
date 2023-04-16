import path from "path";
import fs from "fs";
import sharp from "sharp";
import { fdir } from "fdir";
import { makeDir } from "./util.js";

const _ingestScreenshot = (screenshot, directoryCache, onLog, forceRebuild) => {
  if (fs.existsSync(screenshot.original) && !forceRebuild) {
    onLog(`SKIP: ${screenshot.fileName}`);
  } else {
    const found = directoryCache.filter((item) =>
      item.includes(screenshot.fileName)
    );
    if (found.length > 0) {
      onLog(`SCREENSHOT INGEST: ${screenshot.fileName}`);
      fs.copyFile(found[0], screenshot.original, () => {
        sharp(screenshot.original)
          .resize({ width: 300 })
          .toFile(screenshot.thumbnail);

        sharp(screenshot.original)
          .resize({ width: 1024 })
          .toFile(screenshot.preview);
      });
      try {
        fs.copyFile(
          found[0].replace(".png", "_Environment.png"),
          screenshot.original.replace(".png", "_Environment.png"),
          // eslint-disable-next-line @typescript-eslint/no-empty-function
          () => {}
        );
        fs.copyFile(
          found[0].replace(".png", "_Player.png"),
          screenshot.original.replace(".png", "_Player.png"),
          // eslint-disable-next-line @typescript-eslint/no-empty-function
          () => {}
        );
      } catch (e) {
        console.error(e);
      }
    } else {
      onLog(`SCREENSHOT WARN: Cannot locate: ${screenshot.fileName}`);
    }
  }
};

const vrcScreenshots = {
  fileNameToPath: (fileName, dataDir) => {
    const metaData = vrcScreenshots.parseVrchatScreenshotName(fileName);
    const filePath = `${dataDir}/assets/${metaData.year}/${
      metaData.month
    }/${fileName.replace(".png", "")}/original.png`;
    return filePath;
  },
  parseVrchatScreenshotName: (fileName) => {
    const fileNameSplit = fileName.replaceAll("NYE23-", "NYE23_").split("_");
    const metaData = fileNameSplit[1].includes("x")
      ? {
          month: fileNameSplit[2]?.split("-")[1],
          day: fileNameSplit[2]?.split("-")[2],
          year: fileNameSplit[2]?.split("-")[0],
          width: fileNameSplit[1]?.split("x")[0],
          height: fileNameSplit[1]?.split("x")[1]
        }
      : {
          month: fileNameSplit[1]?.split("-")[1],
          day: fileNameSplit[1]?.split("-")[2],
          year: fileNameSplit[1]?.split("-")[0],
          width: parseInt(fileNameSplit[3]?.split("x")[0], 10),
          height: parseInt(fileNameSplit[3]?.split("x")[1], 10)
        };
    return metaData;
  },
  buildDirectoryCache: ({ vrcScreenshotDir, onLog }) => {
    if (!vrcScreenshotDir) {
      onLog("ERROR: Please specify a screenshot directory");
      return null;
    }
    const findApi = new fdir()
      .filter((path) => !path.startsWith("node_modules"))
      .filter((path) => !path.startsWith("."))
      .withBasePath()
      .withDirs()
      .crawl(vrcScreenshotDir);
    onLog(`SCREENSHOT: CACHING (Might take a while...): ${vrcScreenshotDir}`);
    let startTime = performance.now();
    let directoryCache = findApi.sync();
    directoryCache = directoryCache.filter(
      (file) => path.extname(file) === ".png"
    );
    onLog(
      `SCREENSHOT: CACHING ...${directoryCache.length} files. Took ${(
        (performance.now() - startTime) *
        0.001
      ).toFixed(0)} seconds`
    );
    return directoryCache;
  },
  ingestScreenshots: ({
    assetList,
    directoryCache = null,
    onLog,
    preferences
  }) => {
    if (assetList.length === 0) return;
    if (!directoryCache)
      directoryCache = vrcScreenshots.buildDirectoryCache({ onLog });
    return assetList.map((item) => {
      const logged = item.event.split("screenshot to: ")[1];
      if (!logged) return null;
      const fileName = path.basename(logged?.replaceAll("\\", "/"));
      const data = vrcScreenshots.parseVrchatScreenshotName(fileName);
      const filePath = path.join(
        preferences.dataDir,
        "assets",
        data["year"],
        data["month"],
        fileName.replace(".png", "")
      );
      makeDir(filePath);
      const screenshot = {
        logged,
        fileName,
        data,
        source: path.join(preferences.vrcScreenshotDir, fileName),
        thumbnail: path.join(filePath, "thumbnail.png"),
        preview: path.join(filePath, "preview.png"),
        original: path.join(filePath, "original.png")
      };
      _ingestScreenshot(
        screenshot,
        directoryCache,
        onLog,
        preferences.screenshotsForceRebuild
      );
      return screenshot;
    });
  }
};

export const {
  buildDirectoryCache,
  ingestScreenshots,
  parseVrchatScreenshotName,
  fileNameToPath
} = vrcScreenshots;
export default vrcScreenshots;