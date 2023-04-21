import { createTable } from "../util.js";

export const up = function (knex) {
  return createTable(knex, "screenshot");
};

export const down = function (knex) {
  return knex.schema.dropTable("screenshot");
};
