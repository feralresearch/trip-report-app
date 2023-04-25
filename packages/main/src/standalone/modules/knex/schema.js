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
      ts: { type: "dateTime", nullable: false },
      filename: { type: "string", nullable: false, unique: true },
      photographer: { type: "string", nullable: true },
      wrld_id: { type: "string", nullable: true },
      usrs_in_image: { type: "json", nullable: true },
      tags: { type: "json", nullable: true },
      favorite: { type: "boolean", nullable: true },
      usrs_in_world: { type: "json", nullable: true },
      notes: { type: "string", nullable: true }
    },
    world: {
      ts: { type: "dateTime", nullable: false },
      name: { type: "string", nullable: false },
      wrld_id: { type: "string", nullable: false },
      notes: { type: "string", nullable: true }
    },
    user: {
      ts: { type: "dateTime", nullable: false },
      name: { type: "string", nullable: false },
      usr_id: { type: "string", nullable: false },
      notes: { type: "string", nullable: true }
    },
    media: {
      ts: { type: "dateTime", nullable: false },
      media_id: { type: "string", nullable: false },
      source: { type: "string", nullable: false },
      data: { type: "json", nullable: false },
      notes: { type: "string", nullable: true },
      indexes: [["media_id"]]
    }
  }
};
export default schema;
