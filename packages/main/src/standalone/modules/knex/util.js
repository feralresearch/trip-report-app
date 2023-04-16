import schema from "./schema.js";

const util = {
  createTable: (knex, tableName) => {
    const tableDef = schema.tables[tableName];
    return knex.schema.createTable(tableName, (table) => {
      console.log(`DB: CREATING TABLE: ${tableName}`);
      Object.keys(tableDef)?.forEach((rowName) => {
        const row = tableDef[rowName];
        if (rowName !== "indexes") {
          if (row.primary) table.primary(rowName);
          try {
            if (row.nullable) {
              if (row.unique) {
                table[row.type](rowName, row.maxlength).unique().nullable();
              } else {
                table[row.type](rowName, row.maxlength).nullable();
              }
            } else {
              if (row.unique) {
                table[row.type](rowName, row.maxlength).unique().notNullable();
              } else {
                table[row.type](rowName, row.maxlength).notNullable();
              }
            }
          } catch (e) {
            console.error(row);
            console.error(e);
          }
        } else {
          row.forEach((index, idx) => {
            table.index(index, `index_${tableName}_${idx}`);
          });
        }
      });
      table.increments();
    });
  }
};
export const { createTable } = util;
export default util;
