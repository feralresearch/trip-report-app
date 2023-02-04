console.log("Running...");

process.on("SIGINT", () => {
  console.log("EVENT: SIGINT");
  process.exit();
});

process.on("exit", () => {
  console.log("EVENT: EXIT");
});

setInterval(() => {}, 60000);
