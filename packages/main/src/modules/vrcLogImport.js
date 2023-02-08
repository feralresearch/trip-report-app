import Promise from "bluebird";
import { knexInit } from "./knex/knexfile.js";

const vrcLogImport = {
  importRecords: ({ dataDir, id, jsonData, onLog }) => {
    const chunkSize = 500;

    return new Promise((resolve, reject) => {
      console.log(id);
      const knex = knexInit(dataDir);
      knex
        .select("*")
        .from("import_history")
        .where({ import_id: id })
        .then((existing) => {
          if (existing?.length > 0) {
            onLog(`IMPORT SKIP: ${id}`);
            knex.destroy();
            resolve();
          } else {
            const chunkCount = Math.ceil(jsonData.length / chunkSize);
            Promise.map(
              Array.from({ length: chunkCount }),
              async (_devnull, idx) => {
                const start = idx * chunkSize;
                const end = start + chunkSize;
                const data = jsonData.slice(start, end);
                await knex.batchInsert("log", data, chunkSize);
              },
              { concurrency: 1 } // Serialized import (concurrency = 1) is faster on SQLite!
            )
              .then(async () => {
                onLog(
                  `...${id} - imported ${jsonData.length} records ${
                    chunkCount > 1 ? `(in ${chunkCount} chunks)` : ""
                  }`
                );
                await knex
                  .insert({ ts: Date.now(), import_id: id })
                  .into("import_history")
                  .catch((e) => console.error(e));
                knex.destroy();
                resolve();
              })
              .catch(reject);
          }
        });
    });
  }
};
export const { importRecords } = vrcLogImport;
export default vrcLogImport;
