export { createCommand } from "./commands/create.js";
export { addCommand } from "./commands/add.js";
export { updateCommand } from "./commands/update.js";
export { doctorCommand } from "./commands/doctor.js";
export { aiCommand } from "./commands/ai.js";
export { setupCommand } from "./commands/setup.js";
export { listCommand } from "./commands/list.js";

export { generateProject } from "./core/generator.js";
export { runWizard } from "./core/wizard.js";
export {
  buildConfigFromOptions,
  loadConfigFromFile,
} from "./core/config.js";
export { buildCreatePlan } from "./core/plan.js";
export {
  getPresetCatalog,
  getStackMatrix,
  isPresetAvailable,
  isOptionAvailable,
} from "./core/catalog.js";
export {
  listFeatures,
  getFeature,
  isPlannedFeature,
  PLANNED_FEATURES,
} from "./core/features/index.js";
export { parseEnvKeys, missingEnvKeys } from "./core/env-check.js";
export { discoverPlugins, resolvePluginsForConfig } from "./core/plugin-loader.js";

export type {
  ForgeConfig,
  ForgePlugin,
  PluginContext,
  Preset,
  CreateOptions,
  AddOptions,
} from "./types/index.js";

export {
  forgeConfigSchema,
  PRESET_DEFAULTS,
  presetSchema,
} from "./types/index.js";
