import { createTable } from "../util.js";

export const up = function (knex) {
  return createTable(knex, "import_history");
};

export const down = function (knex) {
  return knex.schema.dropTable("import_history");
};
