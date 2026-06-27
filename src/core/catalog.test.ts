import { describe, expect, it } from "vitest";
import {
  getPresetCatalog,
  getStackMatrix,
  isOptionAvailable,
  isPresetAvailable,
} from "./catalog.js";
import { presetSchema } from "../types/index.js";

describe("catalog", () => {
  it("marks only mern as an available preset", () => {
    expect(isPresetAvailable("mern")).toBe(true);
    expect(isPresetAvailable("saas")).toBe(false);
  });

  it("includes every preset with a status", () => {
    const catalog = getPresetCatalog();
    expect(catalog).toHaveLength(presetSchema.options.length);
    expect(catalog.find((p) => p.id === "mern")?.status).toBe("available");
  });

  it("reports option availability honestly", () => {
    expect(isOptionAvailable("frontend", "react")).toBe(true);
    expect(isOptionAvailable("frontend", "vue")).toBe(false);
    expect(isOptionAvailable("orm", "mongoose")).toBe(true);
    expect(isOptionAvailable("orm", "drizzle")).toBe(false);
  });

  it("builds a stack matrix covering all categories", () => {
    const matrix = getStackMatrix();
    const categories = matrix.map((m) => m.category);
    expect(categories).toContain("frontend");
    expect(categories).toContain("deployment");
    const frontend = matrix.find((m) => m.category === "frontend");
    expect(frontend?.options.some((o) => o.status === "available")).toBe(true);
  });
});
