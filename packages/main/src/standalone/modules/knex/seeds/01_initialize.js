import { v4 as uuidv4 } from "uuid";
import logInitData from "./initialize/log.json" assert { type: "json" };

export const seed = async (knex) => {
  const seedIfEmpty = async (tableName, data) => {
    if (data.length === 0) return;
    const existing = await knex.select("*").from(tableName);
    if (existing.length === 0) {
      const d = data.map((datum) => {
        if (Object.keys(datum).includes("uuid")) datum.uuid = uuidv4();
        if (Object.keys(datum).includes("created_at"))
          datum.created_at = new Date().toLocaleString("en-US");
        if (Object.keys(datum).includes("updated_at"))
          datum.updated_at = new Date().toLocaleString("en-US");
        return datum;
      });
      console.log(`SEEDING: ${tableName}`);
      await knex(tableName).insert(d);
    }
  };
  try {
    seedIfEmpty("log", logInitData);
  } catch (e) {
    console.debug(e);
  }
};
