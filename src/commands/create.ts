import { generateProject } from "../core/generator.js";
import { buildConfigFromOptions, loadConfigFromFile } from "../core/config.js";
import { runWizard } from "../core/wizard.js";
import { runMernWizard } from "../core/mern-wizard.js";
import type { CreateOptions } from "../types/index.js";
import { isMernStack } from "../types/index.js";
import {
  projectExists,
  resolveProjectDir,
} from "../utils/files.js";
import { dim, info, success } from "../utils/logger.js";

export async function createCommand(
  name: string,
  options: CreateOptions,
): Promise<void> {
  const projectDir = resolveProjectDir(name);

  if (await projectExists(projectDir)) {
    throw new Error(`Directory already exists: ${projectDir}`);
  }

  let config;

  if (options.fromConfig) {
    config = await loadConfigFromFile(options.fromConfig, name);
  } else if (options.yes && options.preset) {
    config = buildConfigFromOptions(name, options);
    if (isMernStack(config)) {
      const mernOptions = await runMernWizard(name, false);
      config = { ...config, ...mernOptions };
    }
  } else if (options.preset && !options.yes) {
    // Preset provided but no -y: still run interactive wizard for packages/env
    config = buildConfigFromOptions(name, options);
    if (isMernStack(config)) {
      const mernOptions = await runMernWizard(name, true);
      config = { ...config, ...mernOptions };
    }
  } else {
    config = await runWizard(name);
  }

  await generateProject(projectDir, config);

  success(`Created ${name}`);
  dim(`  cd ${name}`);
  dim("  npm install");
  dim("  npm run dev");
  info("Your .env file has been pre-configured. Run npm install && npm run dev to start.");
}
