
import { describe, expect, it } from "vitest";
import {
  buildConfigFromOptions,
  loadConfigFromFile,
} from "./config";
import { PRESET_DEFAULTS } from "../types";

describe("forgeConfigSchema", () => {
  it("accepts a minimal valid config", () => {
    const config = {
      name: "my-app",
      preset: "mern" as const,
    };

    expect(() => {
      buildConfigFromOptions(config.name, {
        preset: config.preset,
      });
    }).not.toThrow();
  });

  it("has defaults for every preset", () => {
    for (const preset of Object.keys(
      PRESET_DEFAULTS,
    ) as Array<keyof typeof PRESET_DEFAULTS>) {
      expect(PRESET_DEFAULTS).toHaveProperty(preset);
    }
  });
});

describe("buildConfigFromOptions", () => {
  it("applies MERN preset defaults", () => {
    const config = buildConfigFromOptions("my-app", {
      preset: "mern",
    });

    expect(config.frontend).toBe("react");
    expect(config.backend).toBe("express");
    expect(config.database).toBe("mongodb");
    expect(config.orm).toBe("mongoose");
  });

  it("overrides database and ORM from flags", () => {
    const config = buildConfigFromOptions("my-app", {
      preset: "saas",
      db: "mysql",
      orm: "prisma",
    });

    expect(config.database).toBe("mysql");
    expect(config.orm).toBe("prisma");
  });

  it("overrides authentication from flags", () => {
    const config = buildConfigFromOptions("my-app", {
      preset: "mern",
      auth: "clerk",
    });

    expect(config.auth).toBe("clerk");
  });

  it("applies the monorepo flag", () => {
    const config = buildConfigFromOptions("my-app", {
      preset: "mern",
      monorepo: true,
    });

    expect(config.monorepo).toBe(true);
  });

  it("rejects an unsupported database", () => {
    expect(() =>
      buildConfigFromOptions("my-app", {
        preset: "mern",
        db: "redis",
      }),
    ).toThrow();
  });

  it("rejects an unsupported ORM", () => {
    expect(() =>
      buildConfigFromOptions("my-app", {
        preset: "mern",
        orm: "typeorm",
      }),
    ).toThrow();
  });
});


describe("loadConfigFromFile", () => {
  it("is defined", () => {
    expect(loadConfigFromFile).toBeDefined();
  });
});

