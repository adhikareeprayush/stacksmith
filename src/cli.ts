import { Command } from "commander";
import { createCommand } from "./commands/create.js";
import { addCommand } from "./commands/add.js";
import { updateCommand } from "./commands/update.js";
import { doctorCommand } from "./commands/doctor.js";
import { aiCommand } from "./commands/ai.js";
import { setupCommand } from "./commands/setup.js";
import { listCommand } from "./commands/list.js";
import { banner, error } from "./utils/logger.js";
import { presetSchema } from "./types/index.js";
import type { CreateOptions } from "./types/index.js";

const program = new Command();

program
  .name("stacksmith")
  .description("Full-stack scaffolding tool that doesn't lock you in")
  .version("0.1.0");

program
  .command("create")
  .description("Create a new project")
  .argument("<name>", "project name")
  .option("--preset <preset>", "preset to use")
  .option("--db <database>", "database choice")
  .option("--orm <orm>", "ORM choice")
  .option("--auth <auth>", "auth provider")
  .option("--from-config <path>", "load choices from stacksmith.config.json")
  .option("--monorepo", "use monorepo structure")
  .option("--dry-run", "preview the configuration and file plan without writing")
  .option("-y, --yes", "skip interactive wizard (requires --preset)")
  .action(async (name: string, options) => {
    banner();
    try {
      const createOptions: CreateOptions = {
        preset: options.preset
          ? presetSchema.parse(options.preset)
          : undefined,
        db: options.db,
        orm: options.orm,
        auth: options.auth,
        fromConfig: options.fromConfig,
        monorepo: options.monorepo,
        yes: options.yes,
        dryRun: options.dryRun,
      };
      await createCommand(name, createOptions);
    } catch (err) {
      error(err instanceof Error ? err.message : String(err));
      process.exitCode = 1;
    }
  });

program
  .command("add")
  .description("Add a feature to an existing project")
  .argument("<feature>", "feature to add (auth, payments, file-upload, etc.)")
  .option("--provider <provider>", "provider for the feature")
  .action(async (feature: string, options) => {
    try {
      await addCommand(feature, { provider: options.provider });
    } catch (err) {
      error(err instanceof Error ? err.message : String(err));
      process.exitCode = 1;
    }
  });

program
  .command("update")
  .description("Update generated boilerplate to latest patterns")
  .action(async () => {
    try {
      await updateCommand();
    } catch (err) {
      error(err instanceof Error ? err.message : String(err));
      process.exitCode = 1;
    }
  });

program
  .command("doctor")
  .description("Diagnose config and environment issues")
  .action(async () => {
    try {
      await doctorCommand();
    } catch (err) {
      error(err instanceof Error ? err.message : String(err));
      process.exitCode = 1;
    }
  });

program
  .command("ai")
  .description("AI-assisted module generation")
  .argument("<description>", "what to generate")
  .action(async (description: string) => {
    try {
      await aiCommand(description);
    } catch (err) {
      error(err instanceof Error ? err.message : String(err));
      process.exitCode = 1;
    }
  });

program
  .command("setup")
  .description("Post-generation setup: install deps, git init, env setup")
  .action(async () => {
    try {
      await setupCommand();
    } catch (err) {
      error(err instanceof Error ? err.message : String(err));
      process.exitCode = 1;
    }
  });

program
  .command("list")
  .alias("ls")
  .description("List available presets, stack options, and features")
  .option("--json", "output as JSON")
  .action(async (options) => {
    try {
      await listCommand({ json: options.json });
    } catch (err) {
      error(err instanceof Error ? err.message : String(err));
      process.exitCode = 1;
    }
  });

program.parse();
