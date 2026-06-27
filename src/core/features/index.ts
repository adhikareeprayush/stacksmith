import type { ForgeConfig } from "../../types/index.js";

export interface GeneratedFile {
  /** Path relative to the project root. */
  path: string;
  contents: string;
}

export interface FeatureModule {
  id: string;
  /** Alternative names that resolve to this feature. */
  aliases?: string[];
  description: string;
  /** Files this feature writes into an existing project. */
  files: (config: ForgeConfig) => GeneratedFile[];
}

/** Features that are documented in the README but not implemented yet. */
export const PLANNED_FEATURES = [
  "auth",
  "payments",
  "file-upload",
  "email",
  "billing",
  "docs",
] as const;

const githubActions: FeatureModule = {
  id: "github-actions",
  aliases: ["ci", "gh-actions", "actions"],
  description: "GitHub Actions CI workflow (install, lint, test, build)",
  files: () => [
    {
      path: ".github/workflows/ci.yml",
      contents: `name: CI

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  build:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        node-version: [20.x, 22.x]
    steps:
      - uses: actions/checkout@v4

      - name: Use Node.js \${{ matrix.node-version }}
        uses: actions/setup-node@v4
        with:
          node-version: \${{ matrix.node-version }}
          cache: npm

      - name: Install dependencies
        run: npm ci

      - name: Lint
        run: npm run lint --if-present

      - name: Test
        run: npm test --if-present

      - name: Build
        run: npm run build --if-present
`,
    },
  ],
};

const editorconfig: FeatureModule = {
  id: "editorconfig",
  description: "Shared .editorconfig for consistent formatting",
  files: () => [
    {
      path: ".editorconfig",
      contents: `root = true

[*]
charset = utf-8
end_of_line = lf
indent_style = space
indent_size = 2
insert_final_newline = true
trim_trailing_whitespace = true

[*.md]
trim_trailing_whitespace = false
`,
    },
  ],
};

const dockerignore: FeatureModule = {
  id: "dockerignore",
  description: "A .dockerignore to keep images small",
  files: () => [
    {
      path: ".dockerignore",
      contents: `node_modules
npm-debug.log
dist
build
coverage
.git
.gitignore
.env
.env.*
!.env.example
*.md
.DS_Store
`,
    },
  ],
};

const vscode: FeatureModule = {
  id: "vscode",
  aliases: ["editor-settings"],
  description: "VS Code recommended extensions and workspace settings",
  files: () => [
    {
      path: ".vscode/extensions.json",
      contents: `${JSON.stringify(
        {
          recommendations: [
            "dbaeumer.vscode-eslint",
            "esbenp.prettier-vscode",
            "editorconfig.editorconfig",
          ],
        },
        null,
        2,
      )}\n`,
    },
    {
      path: ".vscode/settings.json",
      contents: `${JSON.stringify(
        {
          "editor.formatOnSave": true,
          "editor.defaultFormatter": "esbenp.prettier-vscode",
          "editor.codeActionsOnSave": { "source.fixAll.eslint": "explicit" },
        },
        null,
        2,
      )}\n`,
    },
  ],
};

const REGISTRY: FeatureModule[] = [
  githubActions,
  editorconfig,
  dockerignore,
  vscode,
];

export function listFeatures(): FeatureModule[] {
  return REGISTRY;
}

export function getFeature(name: string): FeatureModule | undefined {
  const key = name.toLowerCase();
  return REGISTRY.find(
    (f) => f.id === key || (f.aliases ?? []).includes(key),
  );
}

export function isPlannedFeature(name: string): boolean {
  return (PLANNED_FEATURES as readonly string[]).includes(name.toLowerCase());
}
