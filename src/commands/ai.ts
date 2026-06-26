import { readForgeConfig } from "../utils/files.js";
import { info, warn } from "../utils/logger.js";

export async function aiCommand(description: string): Promise<void> {
  const config = await readForgeConfig(process.cwd());

  if (!config) {
    throw new Error(
      "No forge.config.json found. Run this command from a Forgekit project root.",
    );
  }

  info(`AI request: "${description}"`);
  info(`Project: ${config.name}`);
  warn("AI-assisted scaffolding is not yet implemented. Coming soon.");
}
