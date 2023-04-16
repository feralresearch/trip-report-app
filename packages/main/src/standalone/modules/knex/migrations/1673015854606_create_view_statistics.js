const STATS_QUERY =
  '(SELECT (select count(*) from log) as total_records, (select count(*) from log WHERE tag="world_enter") as total_worlds_visited, (select count(*) from log WHERE tag="screenshot") as total_screenshots, (select count(*) from log WHERE tag="player") as total_player_encounters, (select count(*) from log WHERE tag="media") as total_media, (select MAX(ts) from log) as start_date, (select MIN(ts) from log) as end_date)';

export const up = function (knex) {
  return knex.schema.createViewOrReplace("statistics", function (view) {
    view.columns([
      "total_records",
      "total_worlds_visited",
      "total_screenshots",
      "total_player_encounters",
      "total_media",
      "start_date",
      "end_date"
    ]);
    view.as(knex.select("*").fromRaw(STATS_QUERY));
  });
};

export const down = function (knex) {
  return knex.schema.dropViewIfExists("statistics");
};
