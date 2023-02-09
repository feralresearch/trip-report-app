import { knexInit } from "./knex/knexfile.js";

const vrcLogImport = {
  importRecords: ({ knex, id, jsonData, onLog }) => {
    const chunkSize = 500;
    return new Promise((resolve) => {
      knex
        .select("*")
        .from("import_history")
        .where({ import_id: id })
        .then(async (existing) => {
          if (existing?.length > 0) {
            onLog(`IMPORT SKIP: ${id}`);
            resolve();
          } else {
            const chunkCount = Math.ceil(jsonData.length / chunkSize);
            let idx = 0;
            for (const _x of Array.from({ length: chunkCount })) {
              const start = idx * chunkSize;
              const end = start + chunkSize;
              const data = jsonData.slice(start, end);
              await knex.batchInsert("log", data, chunkSize);
              idx++;
            }
            onLog(
              `...${id} - imported ${jsonData.length} records ${
                chunkCount > 1 ? `(in ${chunkCount} chunks)` : ""
              }`
            );
            await knex
              .insert({ ts: Date.now(), import_id: id })
              .into("import_history")
              .catch((e) => console.error(e));
            resolve();
          }
        });
    });
  }
};
export const { importRecords } = vrcLogImport;
export default vrcLogImport;
