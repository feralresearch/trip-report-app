"use strict";
import Knex from "knex";
import fs from "fs";
import { parseVrchatScreenshotName } from "./vrcScreenshots.js";
import AdmZip from "adm-zip";
import { exit } from "process";
import knexConfig from "./knex/knexfile.js";
const zip = new AdmZip();

const id = process.argv[2];
const dst = process.argv[3];
const dataDir = process.argv[4];

const updateProgress = (val) => process.send(val);

updateProgress(1);

//const knex = Knex(knexConfig);
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
  var data = fs.readFileSync(filePath);
  updateProgress(1 - idx / imageList.length);
  zip.addFile(`${fileName}.png`, Buffer.from(data, "utf8"));
});

zip.writeZip(dst);

exit();
