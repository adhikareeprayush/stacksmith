import path from "node:path";
import fs from "fs-extra";
import ora from "ora";
import type { ForgeConfig } from "../../types/index.js";
import { DEFAULT_PACKAGES } from "../../types/packages.js";
import { formatEnvFile } from "../../core/env-prompts.js";
import { getMernFileTree } from "./files/index.js";

export async function generateMernProject(
  projectDir: string,
  config: ForgeConfig,
): Promise<void> {
  const spinner = ora("Scaffolding MERN project...").start();

  try {
    const packages = config.packages ?? DEFAULT_PACKAGES;
    const env = config.env ?? {};
    const files = getMernFileTree(config.name, packages, env);

    for (const file of files) {
      const filePath = path.join(projectDir, file.path);
      await fs.ensureDir(path.dirname(filePath));
      await fs.writeFile(filePath, file.content);
    }

    // Write .env with collected values
    spinner.text = "Writing environment files...";
    await fs.writeFile(path.join(projectDir, ".env"), formatEnvFile(env));

    // .env.example with placeholders (no secrets)
    const envExample = { ...env };
    if (envExample.JWT_SECRET) envExample.JWT_SECRET = "your-jwt-secret-here";
    if (envExample.SMTP_PASS) envExample.SMTP_PASS = "your-smtp-password";
    if (envExample.CLOUDINARY_API_SECRET)
      envExample.CLOUDINARY_API_SECRET = "your-cloudinary-secret";
    await fs.writeFile(
      path.join(projectDir, ".env.example"),
      formatEnvFile(envExample),
    );

    spinner.succeed("MERN project scaffolded successfully");
  } catch (err) {
    spinner.fail("MERN scaffolding failed");
    throw err;
  }
}
