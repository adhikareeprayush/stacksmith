import {
  confirm,
  input,
  select,
} from "@inquirer/prompts";
import chalk from "chalk";
import {
  forgeConfigSchema,
  isMernStack,
  PRESET_DEFAULTS,
  type ForgeConfig,
} from "../types/index.js";
import { getPresetChoices } from "./config.js";
import { runMernWizard } from "./mern-wizard.js";

export async function runWizard(projectName: string): Promise<ForgeConfig> {
  const usePreset = await confirm({
    message: "Start from a preset?",
    default: true,
  });

  let base: Partial<ForgeConfig> = { name: projectName };

  if (usePreset) {
    const preset = await select({
      message: "Choose a preset",
      choices: getPresetChoices(),
    });
    base = { ...base, ...PRESET_DEFAULTS[preset] };
  } else {
    base.frontend = await select<NonNullable<ForgeConfig["frontend"]>>({
      message: "Frontend framework",
      choices: [
        { name: "React", value: "react" },
        { name: "Next.js (App Router)", value: "next" },
        { name: "Vue", value: "vue" },
        { name: "Nuxt", value: "nuxt" },
        { name: "SvelteKit", value: "sveltekit" },
        { name: "Astro", value: "astro" },
      ],
    });

    const includeBackend = await confirm({
      message: "Include a backend?",
      default: base.frontend !== "astro",
    });

    if (includeBackend) {
      base.backend = await select<NonNullable<ForgeConfig["backend"]>>({
        message: "Backend framework",
        choices: [
          { name: "Express", value: "express" },
          { name: "Fastify", value: "fastify" },
          { name: "NestJS", value: "nestjs" },
          { name: "Hono", value: "hono" },
          { name: "tRPC", value: "trpc" },
        ],
      });
    }

    const includeDatabase = await confirm({
      message: "Include a database?",
      default: true,
    });

    if (includeDatabase) {
      base.database = await select<NonNullable<ForgeConfig["database"]>>({
        message: "Database",
        choices: [
          { name: "MongoDB", value: "mongodb" },
          { name: "PostgreSQL", value: "postgres" },
          { name: "MySQL", value: "mysql" },
          { name: "SQLite", value: "sqlite" },
          { name: "Supabase", value: "supabase" },
          { name: "PlanetScale", value: "planetscale" },
        ],
      });

      if (base.database !== "mongodb") {
        base.orm = await select<NonNullable<ForgeConfig["orm"]>>({
          message: "ORM",
          choices: [
            { name: "Prisma", value: "prisma" },
            { name: "Drizzle", value: "drizzle" },
          ],
        });
      } else {
        base.orm = "mongoose";
      }
    }

    const includeAuth = await confirm({
      message: "Include authentication?",
      default: true,
    });

    if (includeAuth) {
      base.auth = await select<NonNullable<ForgeConfig["auth"]>>({
        message: "Auth provider",
        choices: [
          { name: "JWT (custom)", value: "jwt" },
          { name: "Auth.js", value: "authjs" },
          { name: "Better Auth", value: "better-auth" },
          { name: "Lucia", value: "lucia" },
          { name: "Clerk", value: "clerk" },
          { name: "Supabase Auth", value: "supabase" },
        ],
      });
    }
  }

  // MERN-specific interactive package & env configuration
  const parsed = forgeConfigSchema.parse(base);
  if (isMernStack(parsed)) {
    console.log(chalk.bold.cyan("\n  ⚙  MERN stack configuration"));
    const mernConfig = await runMernWizard(projectName, true);
    base.packages = mernConfig.packages;
    base.env = mernConfig.env;
  }

  base.monorepo = await confirm({
    message: "Use monorepo structure (Turborepo)?",
    default: false,
  });

  base.deployment = await select<NonNullable<ForgeConfig["deployment"]>>({
    message: "Deployment target",
    choices: [
      { name: "Vercel", value: "vercel" },
      { name: "Railway", value: "railway" },
      { name: "Render", value: "render" },
      { name: "Fly.io", value: "fly" },
      { name: "AWS", value: "aws" },
      { name: "Self-hosted Docker", value: "docker" },
    ],
  });

  const authorName = await input({
    message: "Author name (optional)",
    default: "",
  });
  const authorEmail = await input({
    message: "Author email (optional)",
    default: "",
  });

  if (authorName || authorEmail) {
    base.author = {
      ...(authorName ? { name: authorName } : {}),
      ...(authorEmail ? { email: authorEmail } : {}),
    };
  }

  return forgeConfigSchema.parse(base);
}
