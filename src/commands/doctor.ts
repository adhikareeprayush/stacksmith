import fs from "fs-extra";
import { readForgeConfig } from "../utils/files.js";
import { error, info, success, warn } from "../utils/logger.js";

interface Check {
  name: string;
  run: () => Promise<boolean>;
}

export async function doctorCommand(): Promise<void> {
  const cwd = process.cwd();
  const config = await readForgeConfig(cwd);

  if (!config) {
    error("No forge.config.json found in current directory.");
    process.exitCode = 1;
    return;
  }

  info(`Diagnosing ${config.name}...\n`);

  const checks: Check[] = [
    {
      name: "forge.config.json is valid",
      run: async () => config.name.length > 0,
    },
    {
      name: ".env file exists",
      run: async () => fs.pathExists(`${cwd}/.env`),
    },
    {
      name: "node_modules installed",
      run: async () => fs.pathExists(`${cwd}/node_modules`),
    },
    {
      name: "package.json exists",
      run: async () => fs.pathExists(`${cwd}/package.json`),
    },
  ];

  let failed = 0;

  for (const check of checks) {
    const passed = await check.run();
    if (passed) {
      success(check.name);
    } else {
      warn(check.name);
      failed++;
    }
  }

  console.log();
  if (failed === 0) {
    success("All checks passed.");
  } else {
    warn(`${failed} check(s) need attention. Run \`forgekit setup\` to fix common issues.`);
    process.exitCode = 1;
  }
}
