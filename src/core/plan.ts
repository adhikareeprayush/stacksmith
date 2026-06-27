import type { ForgeConfig } from "../types/index.js";
import { isMernStack } from "../types/index.js";

export interface CreatePlan {
  config: ForgeConfig;
  /** Top-level paths that would be created, relative to the project root. */
  structure: string[];
  notes: string[];
}

/**
 * Describe what `create` would generate, without touching the filesystem.
 * Used by `--dry-run` and unit tests.
 */
export function buildCreatePlan(config: ForgeConfig): CreatePlan {
  if (isMernStack(config)) {
    return {
      config,
      structure: [
        "client/",
        "server/",
        "docker-compose.yml",
        ".env",
        ".env.example",
        ".gitignore",
        "package.json",
        "README.md",
        "stacksmith.config.json",
      ],
      notes: [
        "Full MERN scaffold: Express API (auth, models, services) + React/Vite client.",
      ],
    };
  }

  return {
    config,
    structure: [
      "package.json",
      ".env.example",
      "README.md",
      "stacksmith.config.json",
    ],
    notes: [
      `The "${config.preset ?? "selected"}" stack is not implemented yet — a minimal base project would be generated.`,
    ],
  };
}
