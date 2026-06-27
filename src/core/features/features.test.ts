import { describe, expect, it } from "vitest";
import { getFeature, isPlannedFeature, listFeatures } from "./index.js";
import { forgeConfigSchema } from "../../types/index.js";

const config = forgeConfigSchema.parse({ name: "demo", preset: "mern" });

describe("feature registry", () => {
  it("resolves features by id and alias", () => {
    expect(getFeature("github-actions")?.id).toBe("github-actions");
    expect(getFeature("ci")?.id).toBe("github-actions");
    expect(getFeature("CI")?.id).toBe("github-actions");
    expect(getFeature("nope")).toBeUndefined();
  });

  it("exposes planned features distinctly from implemented ones", () => {
    expect(isPlannedFeature("auth")).toBe(true);
    expect(isPlannedFeature("github-actions")).toBe(false);
  });

  it("every feature produces at least one file with a relative path", () => {
    for (const feature of listFeatures()) {
      const files = feature.files(config);
      expect(files.length).toBeGreaterThan(0);
      for (const file of files) {
        expect(file.path).not.toMatch(/^\//);
        expect(file.contents.length).toBeGreaterThan(0);
      }
    }
  });
});
