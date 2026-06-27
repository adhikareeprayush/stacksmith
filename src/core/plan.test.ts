import { describe, expect, it } from "vitest";
import { buildCreatePlan } from "./plan.js";
import { forgeConfigSchema } from "../types/index.js";

describe("buildCreatePlan", () => {
  it("plans a full client/server tree for mern", () => {
    const config = forgeConfigSchema.parse({ name: "demo", preset: "mern" });
    const plan = buildCreatePlan(config);
    expect(plan.structure).toContain("client/");
    expect(plan.structure).toContain("server/");
    expect(plan.structure).toContain("stacksmith.config.json");
  });

  it("plans a minimal base project for unimplemented stacks", () => {
    const config = forgeConfigSchema.parse({ name: "demo", preset: "saas" });
    const plan = buildCreatePlan(config);
    expect(plan.structure).not.toContain("client/");
    expect(plan.structure).toContain("package.json");
    expect(plan.notes[0]).toMatch(/not implemented/i);
  });
});
