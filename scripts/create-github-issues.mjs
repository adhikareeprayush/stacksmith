#!/usr/bin/env node
/**
 * Create contribution issues on GitHub for Stacksmith.
 *
 * Usage:
 *   gh auth login && node scripts/create-github-issues.mjs
 *   GITHUB_TOKEN=ghp_xxx node scripts/create-github-issues.mjs
 *   node scripts/create-github-issues.mjs --dry-run
 */
import { requireGithubToken } from './github-auth.mjs';

const REPO = process.env.GITHUB_REPO ?? 'adhikareeprayush/stacksmith';
const DRY_RUN = process.argv.includes('--dry-run');
const TOKEN = requireGithubToken({ dryRun: DRY_RUN });

const [owner, repo] = REPO.split('/');

async function gh(path, { method = 'GET', body } = {}) {
  if (DRY_RUN) {
    console.log(`[dry-run] ${method} ${path}`);
    if (body) console.log(`  ${body.title ?? ''}`);
    return { number: 0, html_url: `https://github.com/${REPO}/issues/0` };
  }

  const res = await fetch(`https://api.github.com${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${TOKEN}`,
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
      'User-Agent': 'stacksmith-issue-bootstrap',
      ...(body ? { 'Content-Type': 'application/json' } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`GitHub API ${method} ${path} → ${res.status}: ${text}`);
  }

  if (res.status === 204) return null;
  return res.json();
}

const MAINTAINER = '[@adhikareeprayush](https://github.com/adhikareeprayush)';

/** @type {{ title: string; labels: string[]; body: string }[]} */
const ISSUES = [
  // ── Epics ──
  {
    title: '[Epic] Expand the stack matrix beyond MERN',
    labels: ['epic', 'scaffold', 'plugin', 'help wanted'],
    body: `## Goal
Today only the MERN preset generates a full project. Deliver the other stacks advertised in the README.

## Checklist
- [ ] \`api\` preset — backend-only scaffold
- [ ] \`next-full\` preset — Next.js App Router + Prisma
- [ ] \`saas\` preset — Next.js + Postgres + Drizzle + auth
- [ ] \`portfolio\` preset — static/SSG frontend
- [ ] \`education\` preset — simplified structure with docs
- [ ] Postgres + Prisma and Drizzle plugins
- [ ] Fastify / NestJS backend plugins

## Reference
- \`src/core/catalog.ts\` (availability source of truth)
- \`src/types/index.ts\` (\`PRESET_DEFAULTS\`)
- \`src/scaffolds/mern/\` (reference scaffold)

## Maintainer
${MAINTAINER}`,
  },
  {
    title: '[Epic] Make the plugin system drive generation',
    labels: ['epic', 'plugin', 'scaffold', 'help wanted'],
    body: `## Goal
The plugin loader exists but non-MERN configs fall back to a stub base project. Make \`generateProject\` compose plugins.

## Checklist
- [ ] Resolve and apply plugins for arbitrary configs in \`generateProject\`
- [ ] Define a stable \`ForgePlugin.apply(ctx)\` contract + shared Handlebars helpers
- [ ] Wire \`plugins/\` (react, express, mongodb, mongoose, jwt, docker) into real output
- [ ] Document the plugin API end-to-end in CONTRIBUTING.md

## Reference
- \`src/core/generator.ts\` (\`writeBaseProject\` fallback)
- \`src/core/plugin-loader.ts\`
- \`plugins/*/*.js\`

## Maintainer
${MAINTAINER}`,
  },
  {
    title: '[Epic] Complete the CLI command set',
    labels: ['epic', 'cli', 'help wanted'],
    body: `## Goal
Finish the commands promised in the README.

## Checklist
- [x] \`create\` (MERN), \`create --dry-run\`
- [x] \`list\`
- [x] \`add\` (github-actions, editorconfig, dockerignore, vscode)
- [x] \`doctor\`, \`setup\`
- [ ] \`update\` — refresh generated boilerplate to latest patterns
- [ ] \`ai\` — AI-assisted module generation
- [ ] Stack-level \`add auth|payments|file-upload|email\`

## Reference
- \`src/cli.ts\`, \`src/commands/\`

## Maintainer
${MAINTAINER}`,
  },
  {
    title: '[Epic] OSS launch readiness',
    labels: ['epic', 'documentation', 'ci', 'help wanted'],
    body: `## Goal
Make the repository welcoming and safe for external contributors.

## Checklist
- [x] MIT LICENSE
- [x] CONTRIBUTING.md
- [x] SECURITY.md
- [x] Issue templates + labels
- [x] CI workflow (\`.github/workflows/ci.yml\`)
- [ ] Enable GitHub Discussions
- [ ] Add CODEOWNERS (optional)
- [ ] Publish a CHANGELOG / release notes flow

## Maintainer
${MAINTAINER}`,
  },

  // ── Good first issues ──
  {
    title: 'Add an eslint+prettier feature module to `add`',
    labels: ['good first issue', 'dx', 'feature', 'help wanted'],
    body: `## Summary
\`stacksmith add\` supports github-actions, editorconfig, dockerignore, and vscode. Add an \`eslint-prettier\` feature that drops in shared config files.

## Tasks
- [ ] Add a new \`FeatureModule\` in \`src/core/features/index.ts\` (id: \`eslint-prettier\`)
- [ ] Generate \`.prettierrc\`, \`eslint.config.js\` (flat config), and a \`.prettierignore\`
- [ ] Add a unit test in \`src/core/features/features.test.ts\`

## Files
- \`src/core/features/index.ts\`
- \`src/core/features/features.test.ts\``,
  },
  {
    title: 'Add a gitignore feature module to `add`',
    labels: ['good first issue', 'dx', 'help wanted'],
    body: `## Summary
Add \`stacksmith add gitignore\` to write a sensible Node \`.gitignore\` into an existing project.

## Tasks
- [ ] New \`FeatureModule\` (id: \`gitignore\`) in \`src/core/features/index.ts\`
- [ ] Skip gracefully if \`.gitignore\` already exists (the runner already handles this)
- [ ] Cover it in \`features.test.ts\`

## Files
- \`src/core/features/index.ts\``,
  },
  {
    title: 'Add a husky + commitlint feature module to `add`',
    labels: ['good first issue', 'dx', 'feature', 'help wanted'],
    body: `## Summary
Offer \`stacksmith add git-hooks\` to scaffold Husky + commitlint into a generated project.

## Tasks
- [ ] New \`FeatureModule\` generating \`.husky/pre-commit\`, \`commitlint.config.js\`
- [ ] Document that the user must run \`npm pkg set scripts.prepare=husky\` (or print a hint)
- [ ] Add a test

## Files
- \`src/core/features/index.ts\``,
  },
  {
    title: 'Add a --json flag to `doctor`',
    labels: ['good first issue', 'cli', 'help wanted'],
    body: `## Summary
\`stacksmith list\` supports \`--json\`. Add the same to \`doctor\` for scripting/CI.

## Tasks
- [ ] Collect check results into a structured array
- [ ] Print JSON when \`--json\` is passed (no chalk)
- [ ] Register the flag in \`src/cli.ts\`

## Files
- \`src/commands/doctor.ts\`
- \`src/cli.ts\``,
  },
  {
    title: 'Add tests for the `add` command file injection',
    labels: ['good first issue', 'testing', 'help wanted'],
    body: `## Summary
Feature modules are unit-tested, but \`addCommand\` (which writes files and updates config) is not.

## Tasks
- [ ] Use a temp dir + a fixture \`stacksmith.config.json\`
- [ ] Assert files are written, config \`features\` is updated, and re-running is idempotent
- [ ] Assert planned features print "coming soon" and unknown features throw

## Files
- \`src/commands/add.ts\`
- new \`src/commands/add.test.ts\``,
  },
  {
    title: 'Document each preset with an example in the README',
    labels: ['good first issue', 'documentation', 'help wanted'],
    body: `## Summary
The README lists presets but only MERN has a runnable example. Add a short "what you get" note per preset and mark planned ones clearly.

## Files
- \`README.md\`
- \`src/core/catalog.ts\` (status source of truth)`,
  },

  // ── Features ──
  {
    title: 'Implement the `api` preset (backend-only scaffold)',
    labels: ['feature', 'scaffold', 'backend', 'help wanted'],
    body: `## Summary
The \`api\` preset currently produces a stub base project. Implement a real backend-only scaffold (Express or Fastify) mirroring the MERN server.

## Tasks
- [ ] Add \`src/scaffolds/api/\` (controllers, routes, error handling, env, Dockerfile)
- [ ] Branch to it from \`generateProject\` like MERN does
- [ ] Mark \`api\` available in \`src/core/catalog.ts\`
- [ ] Update README status

## Files
- \`src/core/generator.ts\`
- \`src/scaffolds/mern/\` (reference)
- \`src/core/catalog.ts\``,
  },
  {
    title: 'Implement a Postgres + Prisma database plugin',
    labels: ['feature', 'database', 'plugin', 'help wanted'],
    body: `## Summary
Add Postgres + Prisma as a real generated option (connection, schema, sample model, migrations).

## Tasks
- [ ] \`plugins/database/postgres.js\` and \`plugins/database/prisma.js\` (or a combined ORM plugin)
- [ ] Map config → plugin IDs in \`src/core/plugin-loader.ts\`
- [ ] Add \`postgres\`/\`prisma\` to the available set in \`src/core/catalog.ts\`

## Files
- \`plugins/database/\`
- \`src/core/plugin-loader.ts\`
- \`src/core/catalog.ts\``,
  },
  {
    title: 'Add a Fastify backend plugin',
    labels: ['feature', 'backend', 'plugin', 'help wanted'],
    body: `## Summary
Add Fastify as a backend option, composable with the database/auth plugins.

## Tasks
- [ ] \`plugins/backend/fastify.js\`
- [ ] Generate server bootstrap, routes, plugins, and error handling
- [ ] Register in \`src/core/plugin-loader.ts\` and \`src/core/catalog.ts\`

## Files
- \`plugins/backend/fastify.js\`
- \`src/core/plugin-loader.ts\``,
  },
  {
    title: 'Implement the `stacksmith update` command',
    labels: ['feature', 'cli', 'help wanted'],
    body: `## Summary
\`update\` is a stub. It should refresh generated boilerplate (configs, CI, lint rules) to the latest Stacksmith patterns based on \`stacksmith.config.json\`.

## Tasks
- [ ] Define what "update" touches (safe, non-destructive files only)
- [ ] Diff/preview before writing; support \`--dry-run\`
- [ ] Never overwrite user source without confirmation

## Files
- \`src/commands/update.ts\`
- \`src/core/features/index.ts\` (reuse generators)`,
  },
  {
    title: 'Implement `stacksmith ai` with a local Ollama provider',
    labels: ['feature', 'ai', 'cli', 'help wanted'],
    body: `## Summary
\`ai\` is a stub. Implement module generation that follows the project's conventions, starting with a local Ollama provider (no cloud keys required).

## Tasks
- [ ] Add a provider abstraction (\`ollama\` first)
- [ ] Read \`stacksmith.config.json\` for context (stack, paths)
- [ ] Generate files into the existing project with a confirmation step
- [ ] Document \`OLLAMA_HOST\` / model env vars

## Files
- \`src/commands/ai.ts\`
- \`README.md\` (.env docs)`,
  },
  {
    title: 'Add Vitest and sample tests to the generated MERN server',
    labels: ['feature', 'testing', 'scaffold', 'help wanted'],
    body: `## Summary
Generated MERN projects ship without tests. Add Vitest + a couple of example tests (e.g. auth service, a route) to the server scaffold.

## Tasks
- [ ] Add Vitest config + scripts to the generated \`server/package.json\`
- [ ] Add example unit + supertest integration test
- [ ] Wire into the generated CI workflow

## Files
- \`src/scaffolds/mern/files/server.ts\`
- \`src/scaffolds/mern/files/root.ts\``,
  },
  {
    title: 'Add a Vercel deployment plugin',
    labels: ['feature', 'deployment', 'plugin', 'help wanted'],
    body: `## Summary
Only Docker is implemented for deployment. Add Vercel output (\`vercel.json\` + docs) for frontend/Next stacks.

## Tasks
- [ ] \`plugins/deployment/vercel.js\`
- [ ] Generate \`vercel.json\` tuned to the selected frontend
- [ ] Register in \`src/core/plugin-loader.ts\` and \`src/core/catalog.ts\`

## Files
- \`plugins/deployment/vercel.js\`
- \`src/core/catalog.ts\``,
  },
];

async function existingTitles() {
  const titles = new Set();
  let page = 1;
  while (true) {
    const issues = await gh(
      `/repos/${owner}/${repo}/issues?state=all&per_page=100&page=${page}`,
    );
    if (!issues.length) break;
    for (const issue of issues) {
      if (!issue.pull_request) titles.add(issue.title);
    }
    page++;
  }
  return titles;
}

console.log(`Repository: ${REPO}`);
if (DRY_RUN) console.log('DRY RUN — no issues will be created\n');

const seen = DRY_RUN ? new Set() : await existingTitles();
let created = 0;
let skipped = 0;

for (const issue of ISSUES) {
  if (seen.has(issue.title)) {
    console.log(`skip (exists): ${issue.title}`);
    skipped++;
    continue;
  }

  const result = await gh(`/repos/${owner}/${repo}/issues`, {
    method: 'POST',
    body: {
      title: issue.title,
      body: issue.body,
      labels: issue.labels,
    },
  });
  console.log(`created #${result.number}: ${issue.title}`);
  console.log(`  ${result.html_url}`);
  created++;
  seen.add(issue.title);

  // GitHub secondary rate limit
  if (!DRY_RUN) await new Promise((r) => setTimeout(r, 1200));
}

console.log(`\nDone. Created: ${created}, skipped: ${skipped}`);
