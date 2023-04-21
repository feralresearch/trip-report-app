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
    },
    screenshot: {
      filename: { type: "string", nullable: false },
      wrld_id: { type: "string", nullable: false },
      usrs_in_image: { type: "string", nullable: false },
      tags: { type: "string", nullable: false },
      favorite: { type: "boolean", nullable: false },
      usrs_in_world: { type: "string", nullable: false },
      notes: { type: "string", nullable: false }
    },
    world: {
      ts: { type: "dateTime", nullable: false },
      name: { type: "string", nullable: false },
      wrld_id: { type: "string", nullable: false },
      notes: { type: "string", nullable: false }
    },
    user: {
      ts: { type: "dateTime", nullable: false },
      name: { type: "string", nullable: false },
      usr_id: { type: "string", nullable: false },
      notes: { type: "string", nullable: false }
    },
    media: {
      ts: { type: "dateTime", nullable: false },
      media_id: { type: "string", nullable: false },
      source: { type: "string", nullable: false },
      data: { type: "json", nullable: true },
      notes: { type: "string", nullable: false },
      indexes: [["media_id"]]
    }
  }
};
export default schema;
