import { PRESET_DEFAULTS, presetSchema, type Preset } from "../types/index.js";

export type Availability = "available" | "planned";

export interface PresetInfo {
  id: Preset;
  status: Availability;
  description: string;
}

export interface StackOption {
  id: string;
  status: Availability;
}

export interface StackCategory {
  category: string;
  options: StackOption[];
}

/**
 * The single source of truth for what actually ships today vs. what is on the
 * roadmap. Keep this honest — the `list` command and docs read from it.
 */
const AVAILABLE: Record<string, ReadonlyArray<string>> = {
  frontend: ["react"],
  backend: ["express"],
  database: ["mongodb"],
  orm: ["mongoose"],
  auth: ["jwt"],
  deployment: ["docker"],
};

const ALL_OPTIONS: Record<string, ReadonlyArray<string>> = {
  frontend: ["react", "next", "vue", "nuxt", "sveltekit", "astro"],
  backend: ["express", "fastify", "nestjs", "hono", "trpc"],
  database: ["mongodb", "postgres", "mysql", "sqlite", "supabase", "planetscale"],
  orm: ["mongoose", "prisma", "drizzle"],
  auth: ["jwt", "authjs", "better-auth", "lucia", "clerk", "supabase"],
  deployment: ["vercel", "railway", "render", "fly", "aws", "docker"],
};

const PRESET_DESCRIPTIONS: Record<Preset, string> = {
  mern: "Express + React + MongoDB (Mongoose) + JWT + Docker",
  "next-full": "Next.js App Router + Server Actions + Prisma",
  saas: "Next.js + Postgres + Drizzle + auth + billing",
  api: "Minimal backend-only API",
  portfolio: "Static/SSG frontend, no backend",
  education: "Simplified structure for learning, with docs",
};

/** Only the MERN preset ships end-to-end today. */
export function isPresetAvailable(preset: Preset): boolean {
  return preset === "mern";
}

export function isOptionAvailable(category: string, option: string): boolean {
  return (AVAILABLE[category] ?? []).includes(option);
}

export function getPresetCatalog(): PresetInfo[] {
  return presetSchema.options.map((id) => ({
    id,
    status: isPresetAvailable(id) ? "available" : "planned",
    description: PRESET_DESCRIPTIONS[id] ?? PRESET_DEFAULTS[id]?.preset ?? "",
  }));
}

export function getStackMatrix(): StackCategory[] {
  return Object.entries(ALL_OPTIONS).map(([category, options]) => ({
    category,
    options: options.map((id) => ({
      id,
      status: isOptionAvailable(category, id) ? "available" : "planned",
    })),
  }));
}
