import path from "node:path";
import fs from "fs-extra";
import ora from "ora";
import type { ForgeConfig, PluginContext } from "../types/index.js";
import { isMernStack } from "../types/index.js";
import {
  ensureDir,
  getTemplatesDir,
  writeForgeConfig,
} from "../utils/files.js";
import { discoverPlugins, resolvePluginsForConfig } from "./plugin-loader.js";
import { generateMernProject } from "../scaffolds/mern/generator.js";
import { runMernWizard } from "./mern-wizard.js";

export async function generateProject(
  projectDir: string,
  config: ForgeConfig,
): Promise<void> {
  // MERN stack uses dedicated comprehensive scaffold
  if (isMernStack(config)) {
    let mernConfig = config;
    if (!config.packages || !config.env) {
      const mernOptions = await runMernWizard(config.name, false);
      mernConfig = {
        ...config,
        packages: config.packages ?? mernOptions.packages,
        env: config.env ?? mernOptions.env,
      };
    }
    await generateMernProject(projectDir, mernConfig);
    await writeForgeConfig(projectDir, mernConfig);
    return;
  }

  const spinner = ora("Scaffolding project...").start();

  try {
    await ensureDir(projectDir);

    const plugins = await discoverPlugins();
    const resolved = resolvePluginsForConfig(plugins, config);

    const ctx: PluginContext = {
      config,
      projectDir,
      templateDir: getTemplatesDir(),
    };

    if (resolved.length === 0) {
      await writeBaseProject(ctx);
    } else {
      for (const plugin of resolved) {
        spinner.text = `Applying ${plugin.name}...`;
        await plugin.apply(ctx);
      }
    }

    await writeForgeConfig(projectDir, config);
    spinner.succeed("Project scaffolded successfully");
  } catch (err) {
    spinner.fail("Scaffolding failed");
    throw err;
  }
}

async function writeBaseProject(ctx: PluginContext): Promise<void> {
  const { config, projectDir } = ctx;

  await fs.writeFile(
    path.join(projectDir, "README.md"),
    `# ${config.name}

Generated with [Forgekit](https://github.com/forgekit/forgekit).

## Getting started

\`\`\`bash
npm install
npm run dev
\`\`\`
`,
  );

  await fs.writeFile(
    path.join(projectDir, "package.json"),
    JSON.stringify(
      {
        name: config.name,
        version: "0.1.0",
        private: true,
        type: "module",
        scripts: {
          dev: 'echo "Configure your dev script"',
          build: 'echo "Configure your build script"',
          start: 'echo "Configure your start script"',
        },
      },
      null,
      2,
    ),
  );

  await fs.writeFile(
    path.join(projectDir, ".env.example"),
    `# ${config.name} environment variables
# Copy to .env and fill in values

NODE_ENV=development
`,
  );
}
