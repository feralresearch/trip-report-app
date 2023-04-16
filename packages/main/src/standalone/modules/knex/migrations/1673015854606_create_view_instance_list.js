export const up = function (knex) {
  return knex.schema.createViewOrReplace("instance_list", function (view) {
    view.columns(["instance", "ts", "tag", "data"]);
    view.as(
      knex
        .distinct()
        .from("log")
        .pluck("instance")
        .select(["ts", "tag", "data"])
        .where("tag", "=", "world_enter")
        .groupBy("instance")
        .orderBy("ts")
    );
  });
};

export const down = function (knex) {
  return knex.schema.dropViewIfExists("instance_list");
};
