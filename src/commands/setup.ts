import { execSync } from "node:child_process";
import fs from "fs-extra";
import path from "node:path";
import { readForgeConfig } from "../utils/files.js";
import { info, success, warn } from "../utils/logger.js";

export async function setupCommand(): Promise<void> {
  const cwd = process.cwd();
  const config = await readForgeConfig(cwd);

  if (!config) {
    throw new Error(
      "No forge.config.json found. Run this command from a Forgekit project root.",
    );
  }

  info(`Setting up ${config.name}...`);

  const envExample = path.join(cwd, ".env.example");
  const envFile = path.join(cwd, ".env");

  if ((await fs.pathExists(envExample)) && !(await fs.pathExists(envFile))) {
    await fs.copy(envExample, envFile);
    success("Created .env from .env.example");
  } else if (!(await fs.pathExists(envExample))) {
    warn("No .env.example found — skipping env setup");
  }

  if (await fs.pathExists(path.join(cwd, "package.json"))) {
    info("Installing dependencies...");
    execSync("npm install", { cwd, stdio: "inherit" });
    success("Dependencies installed");
  }

  if (!(await fs.pathExists(path.join(cwd, ".git"))) && isGitAvailable()) {
    info("Initializing git repository...");
    execSync("git init", { cwd, stdio: "inherit" });
    success("Git repository initialized");
  }

  success("Setup complete.");
}

function isGitAvailable(): boolean {
  try {
    execSync("git --version", { stdio: "ignore" });
    return true;
  } catch {
    return false;
  }
}
