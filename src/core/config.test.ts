import { describe, expect, it } from "vitest";
import { buildConfigFromOptions } from "./config.js";
import { forgeConfigSchema, PRESET_DEFAULTS, presetSchema } from "../types/index.js";

describe("forgeConfigSchema", () => {
  it("parses a minimal valid config", () => {
    const config = forgeConfigSchema.parse({ name: "my-app" });
    expect(config.name).toBe("my-app");
    expect(config.monorepo).toBe(false);
    expect(config.features).toEqual([]);
  });
});

describe("PRESET_DEFAULTS", () => {
  it("defines all documented presets", () => {
    for (const preset of presetSchema.options) {
      expect(PRESET_DEFAULTS[preset]).toBeDefined();
      expect(PRESET_DEFAULTS[preset].preset).toBe(preset);
    }
  });
});

describe("buildConfigFromOptions", () => {
  it("applies mern preset defaults", () => {
    const config = buildConfigFromOptions("my-app", { preset: "mern" });
    expect(config.frontend).toBe("react");
    expect(config.backend).toBe("express");
    expect(config.database).toBe("mongodb");
    expect(config.orm).toBe("mongoose");
  });

  it("overrides db and orm from flags", () => {
    const config = buildConfigFromOptions("my-app", {
      preset: "saas",
      db: "mysql",
      orm: "prisma",
    });
    expect(config.database).toBe("mysql");
    expect(config.orm).toBe("prisma");
  });
});
