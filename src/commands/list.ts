import chalk from "chalk";
import { getPresetCatalog, getStackMatrix } from "../core/catalog.js";
import { listFeatures, PLANNED_FEATURES } from "../core/features/index.js";

export interface ListOptions {
  json?: boolean;
}

function mark(status: "available" | "planned"): string {
  return status === "available" ? chalk.green("✔") : chalk.yellow("○");
}

export async function listCommand(options: ListOptions = {}): Promise<void> {
  const presets = getPresetCatalog();
  const matrix = getStackMatrix();
  const features = listFeatures();

  if (options.json) {
    console.log(
      JSON.stringify(
        {
          presets,
          stack: matrix,
          features: {
            available: features.map((f) => f.id),
            planned: PLANNED_FEATURES,
          },
        },
        null,
        2,
      ),
    );
    return;
  }

  console.log(chalk.bold("\nPresets"));
  for (const preset of presets) {
    const tag =
      preset.status === "available"
        ? chalk.green("available")
        : chalk.yellow("planned");
    console.log(
      `  ${mark(preset.status)} ${chalk.cyan(preset.id.padEnd(11))} ${preset.description} ${chalk.dim(`(${tag})`)}`,
    );
  }

  console.log(chalk.bold("\nStack options"));
  for (const { category, options: opts } of matrix) {
    const rendered = opts
      .map((o) =>
        o.status === "available" ? chalk.green(o.id) : chalk.dim(o.id),
      )
      .join(", ");
    console.log(`  ${chalk.cyan(category.padEnd(11))} ${rendered}`);
  }

  console.log(chalk.bold("\nFeatures you can add"));
  for (const feature of features) {
    console.log(
      `  ${chalk.green("✔")} ${chalk.cyan(feature.id.padEnd(16))} ${feature.description}`,
    );
  }
  for (const planned of PLANNED_FEATURES) {
    console.log(`  ${chalk.yellow("○")} ${chalk.dim(planned.padEnd(16))} planned`);
  }

  console.log(
    chalk.dim(
      `\n  ${chalk.green("✔")} available today   ${chalk.yellow("○")} planned / roadmap\n`,
    ),
  );
}
