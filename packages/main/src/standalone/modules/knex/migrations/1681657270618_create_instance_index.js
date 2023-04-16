export const up = function (knex) {
  return knex.schema.table("log", (table) => {
    table.index(["instance"], `idx_instance_id`);
  });
};

export const down = function (knex) {
  return knex.schema.table("log", (table) => {
    table.dropIndex("idx_instance_id");
  });
};
