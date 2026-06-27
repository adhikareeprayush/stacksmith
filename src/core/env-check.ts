/** Parse the variable names defined in a .env-style file. */
export function parseEnvKeys(content: string): string[] {
  const keys: string[] = [];
  for (const rawLine of content.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;
    const match = line.match(/^([A-Za-z_][A-Za-z0-9_]*)\s*=/);
    if (match?.[1]) keys.push(match[1]);
  }
  return keys;
}

/** Keys present in the example file but missing from the actual .env. */
export function missingEnvKeys(exampleContent: string, envContent: string): string[] {
  const defined = new Set(parseEnvKeys(envContent));
  return parseEnvKeys(exampleContent).filter((key) => !defined.has(key));
}
