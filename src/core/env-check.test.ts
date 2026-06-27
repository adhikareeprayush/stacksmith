import { describe, expect, it } from "vitest";
import { missingEnvKeys, parseEnvKeys } from "./env-check.js";

describe("env-check", () => {
  it("parses keys and ignores comments and blanks", () => {
    const content = `# comment\n\nPORT=3000\nMONGODB_URI=mongodb://x\n  # indented comment\nJWT_SECRET=`;
    expect(parseEnvKeys(content)).toEqual([
      "PORT",
      "MONGODB_URI",
      "JWT_SECRET",
    ]);
  });

  it("finds keys present in example but missing from env", () => {
    const example = `PORT=3000\nMONGODB_URI=\nJWT_SECRET=`;
    const env = `PORT=5000\nMONGODB_URI=mongodb://localhost`;
    expect(missingEnvKeys(example, env)).toEqual(["JWT_SECRET"]);
  });

  it("returns nothing when env covers the example", () => {
    expect(missingEnvKeys("A=\nB=", "A=1\nB=2\nC=3")).toEqual([]);
  });
});
