import { readForgeConfig } from "../utils/files.js";
import { info, warn } from "../utils/logger.js";

export async function updateCommand(): Promise<void> {
  const config = await readForgeConfig(process.cwd());

  if (!config) {
    throw new Error(
      "No forge.config.json found. Run this command from a Forgekit project root.",
    );
  }

  info(`Updating boilerplate patterns for ${config.name}...`);
  warn("Update command is not yet implemented. Coming soon.");
}
