import path from "path";
import fs from "fs";
import sharp from "sharp";
import { fdir } from "fdir";
import { makeDir } from "./util.js";
import { parseVrchatScreenshotName } from "./vrcScreenshotsUtil.js";

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
      const data = parseVrchatScreenshotName(fileName);
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

export const { buildDirectoryCache, ingestScreenshots } = vrcScreenshots;
export default vrcScreenshots;
