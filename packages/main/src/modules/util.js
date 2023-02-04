import fs from "fs";
import path from "path";
import { exec as exec$0 } from "child_process";
const exec = { exec: exec$0 }.exec;

const util = {
  isProcessRunning: ({ windows, mac, linux }) => {
    return new Promise(function (resolve, reject) {
      const plat = process.platform;
      const cmd =
        plat == "win32"
          ? "tasklist"
          : plat == "darwin"
          ? "ps -ax | grep " + mac
          : plat == "linux"
          ? "ps -A"
          : "";
      const proc =
        plat == "win32"
          ? windows
          : plat == "darwin"
          ? mac
          : plat == "linux"
          ? linux
          : "";
      if (cmd === "" || proc === "") {
        resolve(false);
      }
      exec(cmd, function (err, stdout, stderr) {
        resolve(stdout?.toLowerCase().indexOf(proc?.toLowerCase()) > -1);
      });
    });
  },
  makeDir: (dir, cb) => {
    if (!dir) return;
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
      if (typeof cb === "function") cb();
    } else {
      if (typeof cb === "function") cb();
    }
  },
  traverse: async ({ recurse = false, src, onFile, onDir }) => {
    if (!src) return;
    try {
      const files = await fs.promises.readdir(src);
      for (const file of files) {
        const srcPath = path.join(src, file);
        const stat = await fs.promises.stat(srcPath);
        if (stat.isFile()) {
          if (typeof onFile === "function") onFile(srcPath);
        } else if (stat.isDirectory()) {
          if (typeof onDir === "function") {
            onDir(srcPath);
            if (recurse)
              module.exports.traverse({ recurse, src: srcPath, onFile, onDir });
          }
        }
      }
    } catch (e) {
      console.error("[ 🚨 ]: ", e);
    }
  },
  debounce: (callback, wait) => {
    // https://www.joshwcomeau.com/snippets/javascript/debounce/
    let timeoutId = null;
    return (...args) => {
      global.clearTimeout(timeoutId);
      timeoutId = global.setTimeout(() => {
        callback.apply(null, args);
      }, wait);
    };
  },
  envBool: (value) => {
    if (typeof value === "string")
      return value?.toLowerCase() === "true" ? true : false;
  },
  forceDbRebuild: (dataDir) => {
    console.log("*** FORCE REMOVING DATABASE ***");
    const dbFile = path.join(dataDir, "database.db");
    try {
      fs.copyFileSync(
        dbFile,
        dbFile.replace(".db", `_backup_${Date.now()}.db`)
      );
      fs.unlink(dbFile, () => {});
    } catch {}
  }
};

export const { envBool, makeDir, isProcessRunning, forceDbRebuild } = util;
export default util;
