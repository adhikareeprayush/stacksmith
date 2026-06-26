import type { Packages } from "../../../types/packages.js";
import { clientFiles } from "./client.js";
import { rootFiles } from "./root.js";
import { serverFiles } from "./server.js";

export interface GeneratedFile {
  path: string;
  content: string;
}

export function getMernFileTree(
  name: string,
  packages: Packages,
  env: Record<string, string>,
): GeneratedFile[] {
  return [
    ...rootFiles(name, packages, env),
    ...clientFiles(name, packages, env),
    ...serverFiles(name, packages, env),
  ];
}
