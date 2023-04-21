import { createTable } from "../util.js";

export const up = function (knex) {
  return createTable(knex, "world");
};

export const down = function (knex) {
  return knex.schema.dropTable("world");
};
