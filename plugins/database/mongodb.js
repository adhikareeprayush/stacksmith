import path from "node:path";
import fs from "fs-extra";

/** @type {import("../../dist/index.js").ForgePlugin} */
const plugin = {
  id: "database-mongodb",
  category: "database",
  name: "MongoDB",
  description: "MongoDB connection setup",
  requires: ["orm-mongoose"],
  async apply(ctx) {
    await fs.writeFile(
      path.join(ctx.projectDir, ".env.example"),
      `MONGODB_URI=mongodb://localhost:27017/${ctx.config.name}
`,
      { flag: "a" },
    );
  },
};

export default plugin;
