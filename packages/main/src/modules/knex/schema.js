const schema = {
  tables: {
    log: {
      ts: { type: "dateTime", nullable: false },
      type: { type: "string", nullable: false },
      event: { type: "string", nullable: false },
      tag: { type: "string", nullable: true },
      instance: { type: "string", nullable: true },
      data: { type: "json", nullable: true },
      indexes: [["tag", "ts"]]
    },
    import_history: {
      ts: { type: "dateTime", nullable: false },
      import_id: { type: "string", nullable: false }
    }
  }
};
export default schema;
