import path from "node:path";
import fs from "fs-extra";
import {
  readForgeConfig,
  writeForgeConfig,
  ensureDir,
} from "../utils/files.js";
import { dim, info, success, warn } from "../utils/logger.js";
import {
  getFeature,
  isPlannedFeature,
  listFeatures,
} from "../core/features/index.js";
import type { AddOptions } from "../types/index.js";

export async function addCommand(
  feature: string,
  options: AddOptions,
): Promise<void> {
  const cwd = process.cwd();
  const config = await readForgeConfig(cwd);

  if (!config) {
    throw new Error(
      "No stacksmith.config.json found. Run this command from a Stacksmith project root.",
    );
  }

  const module = getFeature(feature);

  if (!module) {
    if (isPlannedFeature(feature)) {
      warn(`Feature "${feature}" is planned but not implemented yet. Coming soon.`);
      return;
    }
    const available = listFeatures()
      .map((f) => f.id)
      .join(", ");
    throw new Error(
      `Unknown feature "${feature}". Available to add now: ${available}.`,
    );
  }

  if (options.provider) {
    info(`Provider: ${options.provider}`);
  }

  const files = module.files(config);
  let written = 0;
  let skipped = 0;

  for (const file of files) {
    const target = path.join(cwd, file.path);

    if (await fs.pathExists(target)) {
      warn(`skipped (exists): ${file.path}`);
      skipped++;
      continue;
    }

    await ensureDir(path.dirname(target));
    await fs.writeFile(target, file.contents);
    success(`added ${file.path}`);
    written++;
  }

  if (written > 0 && !config.features.includes(module.id)) {
    config.features = [...config.features, module.id];
    await writeForgeConfig(cwd, config);
    dim(`  recorded "${module.id}" in stacksmith.config.json`);
  }

  if (written === 0 && skipped > 0) {
    info(`"${module.id}" is already present — nothing to do.`);
  } else {
    success(`Added ${module.id} (${written} file(s)).`);
  }
}
