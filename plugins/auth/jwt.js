import path from "node:path";
import fs from "fs-extra";

/** @type {import("../../dist/index.js").ForgePlugin} */
const plugin = {
  id: "auth-jwt",
  category: "auth",
  name: "JWT Auth",
  description: "Custom JWT authentication middleware",
  async apply(ctx) {
    const authDir = path.join(ctx.projectDir, "src", "auth");
    await fs.ensureDir(authDir);
    await fs.writeFile(
      path.join(authDir, "jwt.ts"),
      `// JWT auth utilities for ${ctx.config.name}
export const JWT_SECRET = process.env.JWT_SECRET ?? "change-me-in-production";
`,
    );
    await fs.writeFile(
      path.join(ctx.projectDir, ".env.example"),
      `JWT_SECRET=your-secret-here
`,
      { flag: "a" },
    );
  },
};

export default plugin;
