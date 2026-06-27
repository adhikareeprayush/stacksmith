import path from "node:path";
import fs from "fs-extra";
import { readForgeConfig, readJson } from "../utils/files.js";
import { forgeConfigSchema } from "../types/index.js";
import { missingEnvKeys } from "../core/env-check.js";
import { error, info, success, warn } from "../utils/logger.js";

interface Check {
  name: string;
  run: () => Promise<boolean | string>;
}

export async function doctorCommand(): Promise<void> {
  const cwd = process.cwd();
  const config = await readForgeConfig(cwd);

  if (!config) {
    error("No stacksmith.config.json found in current directory.");
    process.exitCode = 1;
    return;
  }

  info(`Diagnosing ${config.name}...\n`);

  const checks: Check[] = [
    {
      name: "stacksmith.config.json matches schema",
      run: async () => {
        const raw = await readJson<Record<string, unknown>>(
          path.join(cwd, "stacksmith.config.json"),
        );
        const result = forgeConfigSchema.safeParse(raw);
        return result.success || `invalid: ${result.error.issues[0]?.message}`;
      },
    },
    {
      name: "package.json exists",
      run: async () => fs.pathExists(path.join(cwd, "package.json")),
    },
    {
      name: ".env file exists",
      run: async () => fs.pathExists(path.join(cwd, ".env")),
    },
    {
      name: ".env defines every key from .env.example",
      run: async () => {
        const examplePath = path.join(cwd, ".env.example");
        const envPath = path.join(cwd, ".env");
        if (!(await fs.pathExists(examplePath))) return true;
        if (!(await fs.pathExists(envPath))) return "missing .env";
        const missing = missingEnvKeys(
          await fs.readFile(examplePath, "utf8"),
          await fs.readFile(envPath, "utf8"),
        );
        return missing.length === 0
          ? true
          : `missing: ${missing.join(", ")}`;
      },
    },
    {
      name: "node_modules installed",
      run: async () => fs.pathExists(path.join(cwd, "node_modules")),
    },
    {
      name: `Node.js >= 20 (current: ${process.versions.node})`,
      run: async () => Number(process.versions.node.split(".")[0]) >= 20,
    },
  ];

  let failed = 0;

  for (const check of checks) {
    const result = await check.run();
    if (result === true) {
      success(check.name);
    } else if (result === false) {
      warn(check.name);
      failed++;
    } else {
      warn(`${check.name} — ${result}`);
      failed++;
    }
  }

  console.log();
  if (failed === 0) {
    success("All checks passed.");
  } else {
    warn(`${failed} check(s) need attention. Run \`stacksmith setup\` to fix common issues.`);
    process.exitCode = 1;
  }
}
