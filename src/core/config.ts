import fs from "fs-extra";
import {
  forgeConfigSchema,
  PRESET_DEFAULTS,
  type CreateOptions,
  type ForgeConfig,
  type Preset,
} from "../types/index.js";
import { readJson } from "../utils/files.js";

export function buildConfigFromOptions(
  name: string,
  options: CreateOptions,
): ForgeConfig {
  let base: Partial<ForgeConfig> = { name };

  if (options.fromConfig) {
    throw new Error(
      "Config file loading is handled in the create command before calling this",
    );
  }

  if (options.preset) {
    base = { ...base, ...PRESET_DEFAULTS[options.preset] };
  }

  if (options.db) {
    base.database = options.db as ForgeConfig["database"];
  }
  if (options.orm) {
    base.orm = options.orm as ForgeConfig["orm"];
  }
  if (options.auth) {
    base.auth = options.auth as ForgeConfig["auth"];
  }
  if (options.monorepo !== undefined) {
    base.monorepo = options.monorepo;
  }

  return forgeConfigSchema.parse(base);
}

export async function loadConfigFromFile(
  configPath: string,
  name: string,
): Promise<ForgeConfig> {
  if (!(await fs.pathExists(configPath))) {
    throw new Error(`Config file not found: ${configPath}`);
  }

  const raw = await readJson<Record<string, unknown>>(configPath);
  return forgeConfigSchema.parse({ ...raw, name });
}

export function getPresetChoices(): Array<{ name: string; value: Preset }> {
  return [
    { name: "MERN — Express + React + MongoDB", value: "mern" },
    { name: "Next.js Full — App Router + Prisma", value: "next-full" },
    { name: "SaaS — Next.js + Drizzle + Auth", value: "saas" },
    { name: "API — Backend-only", value: "api" },
    { name: "Portfolio — Static/SSG frontend", value: "portfolio" },
    { name: "Education — Simplified with docs", value: "education" },
  ];
}
