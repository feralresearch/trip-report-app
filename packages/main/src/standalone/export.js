"use strict";
import fs from "fs";
import { parseVrchatScreenshotName } from "../modules/vrcScreenshots.js";
import AdmZip from "adm-zip";
import { exit } from "process";
const zip = new AdmZip();
import prefs from "../modules/prefs.js";
import { knexInit } from "../modules/knex/knexfile.js";

const prefsFile = process.argv[2];
const id = process.argv[3];
const dst = process.argv[4];
const dataDir = process.argv[5];

const updateProgress = (val) => process.send(val);

updateProgress(1);

const preferences = await prefs.load(prefsFile);
const knex = knexInit(preferences.dataDir);

const logEntries = await knex
  .select("*")
  .from("log")
  .where("tag", "screenshot")
  .andWhere("instance", id);

const imageList = logEntries.map((entry) => JSON.parse(entry.data).fileName);
imageList.forEach((fileName, idx) => {
  const metaData = parseVrchatScreenshotName(fileName);
  const filePath = `${dataDir}/assets/${metaData.year}/${
    metaData.month
  }/${fileName.replace(".png", "")}/original.png`;
  const data = fs.readFileSync(filePath);
  updateProgress(1 - idx / imageList.length);
  zip.addFile(`${fileName}.png`, Buffer.from(data, "utf8"));
});

zip.writeZip(dst);

exit();
