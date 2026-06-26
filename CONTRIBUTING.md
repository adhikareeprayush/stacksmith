# Contributing to Stacksmith

Thanks for your interest in contributing! Stacksmith is designed to be extended through plugins.

> **Current state (v0.1.x, early access):** only the **MERN** stack is implemented end-to-end
> (see `src/scaffolds/mern/`). The plugin loader and `ForgePlugin` interface exist, but most
> categories below have few or no plugins yet, and the `add` / `ai` / `update` commands are stubs.
> The highest-impact contributions are new plugins that fill in the stack matrix in the
> [README](README.md#why-stacksmith), or new presets that compose them.

## Development setup

```bash
git clone https://github.com/adhikareeprayush/stacksmith.git
cd stacksmith
npm install
npm run build
npm link
```

## Project layout

```
src/
├── cli.ts              # CLI entry point
├── commands/           # create, add, update, doctor, ai, setup
├── core/               # generator, wizard, config, plugin-loader
├── scaffolds/          # full, dedicated stack generators (MERN lives here)
├── types/              # shared TypeScript types and Zod schemas
└── utils/              # file helpers, logging

plugins/                # target categories — most are intentionally sparse today
├── frontend/           # React ✅ · Next.js/Vue/etc. 🚧
├── backend/            # Express ✅ · Fastify/NestJS/etc. 🚧
├── database/           # MongoDB + Mongoose ✅ · Postgres/Prisma/Drizzle/etc. 🚧
├── auth/               # JWT ✅ · Auth.js/Better Auth/etc. 🚧
├── deployment/         # Docker ✅ · Vercel/Fly.io/etc. 🚧
└── features/           # payments, file-upload, email, etc. 🚧

templates/              # shared Handlebars templates
```

## Plugin API

Each plugin is a JavaScript module in `plugins/<category>/` that exports a default object:

```js
/** @type {import("../../dist/index.js").ForgePlugin} */
const plugin = {
  id: "frontend-react",
  category: "frontend",
  name: "React",
  description: "React SPA with Vite and TypeScript",
  requires: [],
  async apply(ctx) {
    // ctx.config, ctx.projectDir, ctx.templateDir
  },
};

export default plugin;
```

### Plugin ID conventions

| Category   | ID format              | Example              |
|------------|------------------------|----------------------|
| frontend   | `frontend-<name>`      | `frontend-next`      |
| backend    | `backend-<name>`       | `backend-fastify`    |
| database   | `database-<name>`      | `database-postgres`  |
| orm        | `orm-<name>`           | `orm-drizzle`        |
| auth       | `auth-<name>`          | `auth-better-auth`   |
| deployment | `deployment-<name>`    | `deployment-vercel`  |
| feature    | `feature-<name>`       | `feature-payments`   |

## Adding a new plugin

1. Create `plugins/<category>/<name>.js` following the API above.
2. Map the config field to your plugin ID in `src/core/plugin-loader.ts`.
3. Test: `stacksmith create test-app --preset mern -y`

## Code style

- TypeScript strict mode for `src/`
- Run `npm run lint` and `npm test` before submitting a PR
- Conventional commits enforced via commitlint

## Pull requests

1. Fork the repo and create a feature branch
2. Keep changes focused — one plugin or feature per PR when possible
3. Update README if you add a new preset, command, or supported stack option
