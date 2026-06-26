import path from "node:path";
import fs from "fs-extra";

/** @type {import("../../dist/index.js").ForgePlugin} */
const plugin = {
  id: "frontend-react",
  category: "frontend",
  name: "React",
  description: "React SPA with Vite and TypeScript",
  async apply(ctx) {
    await fs.ensureDir(path.join(ctx.projectDir, "src"));
    await fs.writeFile(
      path.join(ctx.projectDir, "src", "main.tsx"),
      `import React from "react";
import ReactDOM from "react-dom/client";

function App() {
  return <h1>Hello from ${ctx.config.name}</h1>;
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
`,
    );
  },
};

export default plugin;
