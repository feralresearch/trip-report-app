import fs from "fs";

console.log("Hi");

fs.promises
  .readdir("/Volumes/Tentacle/Andrew/Screenshots/VRCLogs/")
  .then(async (files) => {
    const logFiles = files.filter((file) => file.includes(".txt"));
    console.log(`LOGPARSER: ${logFiles.length} logfiles found...`);
  })
  .catch((err) => {
    console.log(
      `LOGPARSER: ERROR: Log directory missing ${preferences.vrcLogDir}`
    );
  });
console.log("Bye");


/Volumes/Tentacle/Andrew/Screenshots/VRCLogs/
/Volumes/Tentacle/Andrew/Screenshots/