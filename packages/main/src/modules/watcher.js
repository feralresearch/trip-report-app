import os from "os";
const isWin = os.platform() === "win32";
//const WQL = isWin ? require("wql-process-monitor/promises") : null;
import { subscribe, closeEventSink } from "wql-process-monitor/promises";
import readline from "readline";

// Detecting process shutdown on windows is aaaggghhh.
// This is the only thing I could get to reliably work.
// Without closeEventSink, WQL locks up
var rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});
rl.on("SIGINT", () => process.emit("SIGINT"));
process.on("SIGINT", (e) => {
  if (isWin)
    closeEventSink().then(() => {
      if (e.stack) console.log(e.stack);
      process.exit();
    });
});

export const initializeWatcher = ({ onProcess }) => {
  if (!isWin) {
    console.log("WARNING: Watcher only works on Windows!");
    return;
  }
  const retryIn = 2000;
  const maxRetries = 10;
  let retryCounter = 0;
  const registerWatch = async () => {
    try {
      const processMonitor = isWin
        ? await subscribe({
            creation: true,
            deletion: true,
            filter: [process.env.VRCHAT_PROCESS_NAME],
            whitelist: true
          })
        : null;

      processMonitor.on("creation", ([process, pid, filepath, user]) => {
        console.log(`VRCStarted: ${process}::${pid}(${user}) ["${filepath}"]`);
      });

      processMonitor.on("deletion", ([process, pid]) => {
        console.log(`VRCStopped: ${process}::${pid}`);
        onProcess();
      });
      console.log("WATCH: subscription OK!");
    } catch (e) {
      if (retryCounter > maxRetries) process.emit("SIGINT");
      const ms = retryIn + retryIn * retryCounter;
      retryCounter++;
      console.log(
        `WATCH: *** WQL failed, retry (${retryCounter}) in ${ms / 1000}s...`
      );
      setTimeout(() => registerWatch(), ms);
      return false;
    }
  };
  registerWatch();
};
