import { z } from "zod";
import { packagesSchema } from "./packages.js";

export { packagesSchema, type Packages, DEFAULT_PACKAGES } from "./packages.js";

export const presetSchema = z.enum([
  "mern",
  "next-full",
  "saas",
  "api",
  "portfolio",
  "education",
]);

export type Preset = z.infer<typeof presetSchema>;

export const frontendSchema = z.enum([
  "react",
  "next",
  "vue",
  "nuxt",
  "sveltekit",
  "astro",
]);

export const backendSchema = z.enum([
  "express",
  "fastify",
  "nestjs",
  "hono",
  "trpc",
]);

export const databaseSchema = z.enum([
  "mongodb",
  "postgres",
  "mysql",
  "sqlite",
  "supabase",
  "planetscale",
]);

export const ormSchema = z.enum(["mongoose", "prisma", "drizzle"]);

export const authSchema = z.enum([
  "jwt",
  "authjs",
  "better-auth",
  "lucia",
  "clerk",
  "supabase",
]);

export const deploymentSchema = z.enum([
  "vercel",
  "railway",
  "render",
  "fly",
  "aws",
  "docker",
]);

export const forgeConfigSchema = z.object({
  name: z.string().min(1),
  preset: presetSchema.optional(),
  monorepo: z.boolean().default(false),
  frontend: frontendSchema.optional(),
  backend: backendSchema.optional(),
  database: databaseSchema.optional(),
  orm: ormSchema.optional(),
  auth: authSchema.optional(),
  deployment: deploymentSchema.optional(),
  features: z.array(z.string()).default([]),
  packages: packagesSchema.optional(),
  env: z.record(z.string()).optional(),
  author: z
    .object({
      name: z.string().optional(),
      email: z.string().email().optional(),
    })
    .optional(),
});

export type ForgeConfig = z.infer<typeof forgeConfigSchema>;

export type PluginCategory =
  | "frontend"
  | "backend"
  | "database"
  | "auth"
  | "feature"
  | "deployment";

export interface PluginContext {
  config: ForgeConfig;
  projectDir: string;
  templateDir: string;
}

export interface ForgePlugin {
  id: string;
  category: PluginCategory;
  name: string;
  description: string;
  /** IDs this plugin depends on (e.g. drizzle depends on postgres) */
  requires?: string[];
  apply: (ctx: PluginContext) => Promise<void>;
}

export interface CreateOptions {
  preset?: Preset;
  db?: string;
  orm?: string;
  auth?: string;
  fromConfig?: string;
  monorepo?: boolean;
  yes?: boolean;
  dryRun?: boolean;
}

export interface AddOptions {
  provider?: string;
}

export function isMernStack(config: ForgeConfig): boolean {
  return (
    config.preset === "mern" ||
    (config.frontend === "react" &&
      config.backend === "express" &&
      config.database === "mongodb" &&
      config.orm === "mongoose")
  );
}

export const PRESET_DEFAULTS: Record<
  Preset,
  Partial<Omit<ForgeConfig, "name">>
> = {
  mern: {
    preset: "mern",
    frontend: "react",
    backend: "express",
    database: "mongodb",
    orm: "mongoose",
    auth: "jwt",
    deployment: "docker",
  },
  "next-full": {
    preset: "next-full",
    frontend: "next",
    database: "postgres",
    orm: "prisma",
    auth: "authjs",
    deployment: "vercel",
  },
  saas: {
    preset: "saas",
    frontend: "next",
    database: "postgres",
    orm: "drizzle",
    auth: "better-auth",
    deployment: "vercel",
    features: ["billing", "email"],
  },
  api: {
    preset: "api",
    backend: "fastify",
    database: "postgres",
    orm: "drizzle",
    deployment: "docker",
  },
  portfolio: {
    preset: "portfolio",
    frontend: "astro",
    deployment: "vercel",
  },
  education: {
    preset: "education",
    frontend: "react",
    backend: "express",
    database: "sqlite",
    orm: "prisma",
    deployment: "docker",
    features: ["docs"],
  },
};
