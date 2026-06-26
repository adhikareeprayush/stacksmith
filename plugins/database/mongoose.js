import path from "node:path";
import fs from "fs-extra";

/** @type {import("../../dist/index.js").ForgePlugin} */
const plugin = {
  id: "orm-mongoose",
  category: "database",
  name: "Mongoose",
  description: "Mongoose ODM with sample User model",
  async apply(ctx) {
    const modelsDir = path.join(ctx.projectDir, "src", "models");
    await fs.ensureDir(modelsDir);
    await fs.writeFile(
      path.join(modelsDir, "user.ts"),
      `import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true },
    name: { type: String },
    role: { type: String, enum: ["user", "admin"], default: "user" },
  },
  { timestamps: true },
);

export const User = mongoose.model("User", userSchema);
`,
    );
  },
};

export default plugin;
