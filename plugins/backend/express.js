import path from "node:path";
import fs from "fs-extra";

/** @type {import("../../dist/index.js").ForgePlugin} */
const plugin = {
  id: "backend-express",
  category: "backend",
  name: "Express",
  description: "Express API with TypeScript",
  async apply(ctx) {
    const srcDir = path.join(ctx.projectDir, "src", "server");
    await fs.ensureDir(srcDir);
    await fs.writeFile(
      path.join(srcDir, "index.ts"),
      `import express from "express";

const app = express();
const port = process.env.PORT ?? 3000;

app.get("/health", (_req, res) => {
  res.json({ status: "ok", service: "${ctx.config.name}" });
});

app.listen(port, () => {
  console.log(\`Server running on http://localhost:\${port}\`);
});
`,
    );
  },
};

export default plugin;
