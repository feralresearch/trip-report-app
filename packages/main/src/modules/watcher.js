// If WQL hangs, you can reliably un-stick it by restarting "Windows Management Instrumentation" in "Services" panel

import os from "os";
const isWin = os.platform() === "win32";
import readline from "readline";
import { subscribe, closeEventSink } from "wql-process-monitor";

// Without closeEventSink, WQL locks up
const terminate = (e) => {
  if (isWin) {
    console.log("WATCHER: Goodbye!");
    closeEventSink().then(() => {
      if (e?.stack) console.log(e.stack);
      process.exit();
    });
  }
};

// This hack works if we call this script directly, but not from electron!
if (isWin) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  rl.on("SIGINT", () => process.emit("SIGINT"));
}

// Works from above and by itself on a normal OS with signalling
// (but also not needed since this is for WQL cleanup)
process.on("SIGINT", (e) => terminate(e));

// Works by being sent a signal from the parent (child.send("SIGINT");)
process.on("message", (msg) => {
  if (msg === "SIGINT") terminate();
});

export const initializeWatcher = ({ processName, onProcess }) => {
  if (!isWin)
    return console.log("WATCHER: WARNING: Watcher only works on Windows!");
  if (!processName)
    return console.log("WATCHER: WARNING: Need to specify process name");

  console.log(`WATCHER: Filter on ${processName}`);
  const retryIn = 2000;
  const maxRetries = 10;
  let retryCounter = 0;
  const registerWatch = async () => {
    try {
      const processMonitor = isWin
        ? await subscribe({
            creation: true,
            deletion: true,
            bin: {
              filter: [processName],
              whitelist: true
            }
          })
        : null;

      processMonitor.on("creation", ([process, pid, filepath, user]) => {
        console.log(
          `WATCHER: >>> Started ${process}::${pid}(${user}) ["${filepath}"]`
        );
      });

      processMonitor.on("deletion", ([process, pid]) => {
        console.log(`WATCHER: <<< Stopped: ${process}::${pid}`);
        onProcess();
      });
      console.log(`WATCHER: OK! Subscription to ${processName}`);
    } catch (e) {
      if (retryCounter > maxRetries) process.emit("SIGINT");
      const ms = retryIn + retryIn * retryCounter;
      retryCounter++;
      console.log(
        `WATCHER: *** ERROR *** WQL to ${processName} failed, retry (${retryCounter}) in ${
          ms / 1000
        }s...`
      );
      console.log(e);
      setTimeout(() => registerWatch(), ms);
      return false;
    }
  };
  registerWatch();
};
