import { readdir } from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";
import fs from "fs-extra";
import type { ForgeConfig, ForgePlugin } from "../types/index.js";
import { getPluginsDir } from "../utils/files.js";

async function loadPluginFile(filePath: string): Promise<ForgePlugin | null> {
  try {
    const mod = await import(pathToFileURL(filePath).href);
    const plugin = mod.default ?? mod.plugin;
    if (plugin && typeof plugin.apply === "function") {
      return plugin as ForgePlugin;
    }
  } catch {
    // Plugin failed to load — skip and fall back to base scaffold
  }
  return null;
}

export async function discoverPlugins(): Promise<ForgePlugin[]> {
  const pluginsDir = getPluginsDir();
  if (!(await fs.pathExists(pluginsDir))) {
    return [];
  }

  const categories = await readdir(pluginsDir, { withFileTypes: true });
  const plugins: ForgePlugin[] = [];

  for (const category of categories) {
    if (!category.isDirectory()) continue;

    const categoryDir = path.join(pluginsDir, category.name);
    const entries = await readdir(categoryDir, { withFileTypes: true });

    for (const entry of entries) {
      if (!entry.isFile() || !entry.name.endsWith(".js")) continue;
      const plugin = await loadPluginFile(
        path.join(categoryDir, entry.name),
      );
      if (plugin) plugins.push(plugin);
    }
  }

  return plugins;
}

export function resolvePluginsForConfig(
  allPlugins: ForgePlugin[],
  config: ForgeConfig,
): ForgePlugin[] {
  const selected = new Set<string>();

  const pick = (id: string) => {
    const plugin = allPlugins.find((p) => p.id === id);
    if (plugin) selected.add(plugin.id);
  };

  if (config.frontend) pick(`frontend-${config.frontend}`);
  if (config.backend) pick(`backend-${config.backend}`);
  if (config.database) pick(`database-${config.database}`);
  if (config.orm) pick(`orm-${config.orm}`);
  if (config.auth) pick(`auth-${config.auth}`);
  if (config.deployment) pick(`deployment-${config.deployment}`);

  for (const feature of config.features) {
    pick(`feature-${feature}`);
  }

  // Resolve dependencies
  const resolved = new Set<string>();
  const resolve = (id: string) => {
    if (resolved.has(id)) return;
    const plugin = allPlugins.find((p) => p.id === id);
    if (!plugin) return;
    for (const dep of plugin.requires ?? []) {
      resolve(dep);
    }
    resolved.add(id);
  };

  for (const id of selected) {
    resolve(id);
  }

  return allPlugins.filter((p) => resolved.has(p.id));
}
