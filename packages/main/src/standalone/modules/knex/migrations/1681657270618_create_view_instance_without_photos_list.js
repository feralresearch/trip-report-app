export const up = function (knex) {
  return knex.raw(
    'CREATE VIEW "instance_without_photos_list" ("instance", "ts", "tag", "data") AS select distinct "instance", "ts", "tag", "data" from "log" where "tag" = "world_enter" AND instance NOT in (select distinct "instance" from "log" where "tag" = "screenshot" group by "instance") group by "instance" order by "ts" asc'
  );
};

export const down = function (knex) {
  return knex.raw('drop view if exists "instance_without_photos_list"');
};
