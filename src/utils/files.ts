import path from "node:path";
import { fileURLToPath } from "node:url";
import fs from "fs-extra";
import type { ForgeConfig } from "../types/index.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function findPackageRoot(startDir: string): string {
  let dir = startDir;
  while (dir !== path.dirname(dir)) {
    if (fs.existsSync(path.join(dir, "package.json"))) {
      return dir;
    }
    dir = path.dirname(dir);
  }
  return startDir;
}

export const PACKAGE_ROOT = findPackageRoot(__dirname);

export function getPluginsDir(): string {
  return path.join(PACKAGE_ROOT, "plugins");
}

export function getTemplatesDir(): string {
  return path.join(PACKAGE_ROOT, "templates");
}

export async function ensureDir(dir: string): Promise<void> {
  await fs.ensureDir(dir);
}

export async function writeJson(
  filePath: string,
  data: unknown,
): Promise<void> {
  await fs.writeJson(filePath, data, { spaces: 2 });
}

export async function readJson<T>(filePath: string): Promise<T> {
  return fs.readJson(filePath) as Promise<T>;
}

export function resolveProjectDir(name: string, cwd = process.cwd()): string {
  return path.resolve(cwd, name);
}

export function getForgeConfigPath(projectDir: string): string {
  return path.join(projectDir, "stacksmith.config.json");
}

export async function writeForgeConfig(
  projectDir: string,
  config: ForgeConfig,
): Promise<void> {
  await writeJson(getForgeConfigPath(projectDir), config);
}

export async function readForgeConfig(
  projectDir: string,
): Promise<ForgeConfig | null> {
  const configPath = getForgeConfigPath(projectDir);
  if (!(await fs.pathExists(configPath))) {
    return null;
  }
  return readJson<ForgeConfig>(configPath);
}

export async function projectExists(projectDir: string): Promise<boolean> {
  return fs.pathExists(projectDir);
}
