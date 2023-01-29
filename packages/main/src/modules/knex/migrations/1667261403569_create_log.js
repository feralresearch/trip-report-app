import { createTable } from "../util.js";

export const up = function (knex) {
  return createTable(knex, "log");
};

export const down = function (knex) {
  return knex.schema.dropTable("log");
};
