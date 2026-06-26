import { checkbox, confirm } from "@inquirer/prompts";
import chalk from "chalk";
import {
  DEFAULT_PACKAGES,
  PACKAGE_OPTIONS,
  packagesSchema,
  type Packages,
} from "../types/packages.js";
import { getDefaultEnv, promptEnvVars } from "./env-prompts.js";

export interface MernWizardResult {
  packages: Packages;
  env: Record<string, string>;
}

export async function runMernWizard(
  projectName: string,
  interactive = true,
): Promise<MernWizardResult> {
  if (!interactive) {
    const packages = DEFAULT_PACKAGES;
    return {
      packages,
      env: getDefaultEnv(projectName, packages),
    };
  }

  console.log(chalk.bold("\n  Frontend packages"));
  const frontendSelected = await checkbox({
    message: "Select frontend packages to include",
    choices: PACKAGE_OPTIONS.filter((p) => p.group === "frontend").map((p) => ({
      name: `${p.name} — ${p.description}`,
      value: p.key,
      checked: p.default,
    })),
  });

  console.log(chalk.bold("\n  Backend packages"));
  const backendSelected = await checkbox({
    message: "Select backend packages to include",
    choices: PACKAGE_OPTIONS.filter((p) => p.group === "backend").map((p) => ({
      name: `${p.name} — ${p.description}`,
      value: p.key,
      checked: p.default,
    })),
  });

  const selected = new Set([...frontendSelected, ...backendSelected]);
  const packagesInput: Partial<Packages> = {};

  for (const opt of PACKAGE_OPTIONS) {
    packagesInput[opt.key] = selected.has(opt.key);
  }

  // Cloudinary requires multer
  if (packagesInput.cloudinary && !packagesInput.multer) {
    packagesInput.multer = true;
    console.log(
      chalk.yellow("  ℹ Cloudinary requires Multer — enabling Multer automatically"),
    );
  }

  const packages = packagesSchema.parse(packagesInput);

  console.log(chalk.bold("\n  Environment variables"));
  const configureEnv = await confirm({
    message: "Configure environment variables now?",
    default: true,
  });

  let env: Record<string, string>;
  if (configureEnv) {
    env = await promptEnvVars(projectName, packages);
  } else {
    env = getDefaultEnv(projectName, packages);
  }

  return { packages, env };
}
