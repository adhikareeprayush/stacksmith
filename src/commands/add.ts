import { readForgeConfig } from "../utils/files.js";
import { error, info, success, warn } from "../utils/logger.js";
import type { AddOptions } from "../types/index.js";

const SUPPORTED_FEATURES = [
  "auth",
  "payments",
  "file-upload",
  "email",
  "billing",
  "docs",
] as const;

export async function addCommand(
  feature: string,
  options: AddOptions,
): Promise<void> {
  const config = await readForgeConfig(process.cwd());

  if (!config) {
    throw new Error(
      "No forge.config.json found. Run this command from a Forgekit project root.",
    );
  }

  if (!SUPPORTED_FEATURES.includes(feature as (typeof SUPPORTED_FEATURES)[number])) {
    warn(`Unknown feature "${feature}". Supported: ${SUPPORTED_FEATURES.join(", ")}`);
  }

  if (options.provider) {
    info(`Provider: ${options.provider}`);
  }

  // Plugin-based feature injection will be implemented per feature module
  error(`Feature "${feature}" is not yet implemented. Coming soon.`);
  success(`Config loaded for project: ${config.name}`);
}
