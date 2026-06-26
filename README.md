# Stacksmith

> The full-stack scaffolding tool that doesn't lock you in.

Stacksmith is an interactive CLI that generates production-grade, full-stack boilerplates — personalized to your stack, your database, your auth provider, and your deployment target. No more starting every project by copy-pasting your last one and deleting half of it.

[![npm version](https://img.shields.io/npm/v/@adhikareeprayush/stacksmith.svg)](https://www.npmjs.com/package/@adhikareeprayush/stacksmith)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](CONTRIBUTING.md)
[![Status: early access](https://img.shields.io/badge/status-early%20access-orange.svg)](#project-status)

---

## Project status

**Stacksmith is in early access (`v0.1.x`).** The plugin architecture and the long-term
vision below are real, but only one stack ships end-to-end today:

- ✅ **Shipping now:** the **MERN** preset (Express + React + MongoDB + Mongoose + JWT + Docker)
  generates a complete, production-shaped project — full server, client, auth, Docker, and config.
- 🚧 **In progress / planned:** every other frontend, backend, database, ORM, auth provider,
  preset, and the `add` / `ai` / `update` commands. See the [Roadmap](#roadmap).

If you run Stacksmith with a stack that isn't implemented yet, you'll get a minimal base project
(not a full scaffold). We'd rather be upfront about that than surprise you. Contributions that fill
in the matrix are very welcome — that's exactly what the plugin system is for.

---

## Why Stacksmith?

Most generators give you one opinionated stack and call it a day. Stacksmith is being built so your
stack is a set of composable choices. The target matrix (✅ = available today, 🚧 = planned):

- **Frontend**: React ✅ · Next.js 🚧 · Vue/Nuxt 🚧 · SvelteKit 🚧 · Astro 🚧
- **Backend**: Express ✅ · Fastify 🚧 · NestJS 🚧 · Hono 🚧 · tRPC 🚧
- **Database**: MongoDB ✅ · PostgreSQL 🚧 · MySQL 🚧 · SQLite 🚧 · Supabase 🚧 · PlanetScale 🚧
- **ORM/ODM**: Mongoose ✅ · Prisma 🚧 · Drizzle 🚧
- **Auth**: JWT (custom) ✅ · Auth.js 🚧 · Better Auth 🚧 · Lucia 🚧 · Clerk 🚧 · Supabase Auth 🚧
- **Deployment target**: Docker ✅ · Vercel 🚧 · Railway 🚧 · Render 🚧 · Fly.io 🚧 · AWS 🚧

MERN is the friendly default that works today; the rest is the roadmap we're building toward.

---

## Quick Start

The MERN stack works end-to-end right now:

```bash
npx @adhikareeprayush/stacksmith create my-app --preset mern
```

Or skip the prompts entirely:

```bash
npx @adhikareeprayush/stacksmith create my-app --preset mern -y
```

> Prefer a shorter command? Install it globally once — `npm i -g @adhikareeprayush/stacksmith` —
> and then use the `stacksmith` command directly (e.g. `stacksmith create my-app --preset mern`).

This generates a complete project: an Express server (controllers, services, models, JWT auth,
validation, error handling, logging), a React + Vite client (auth context, pages, UI components,
API layer), `docker-compose.yml`, a pre-filled `.env`, and a `stacksmith.config.json`.

### Presets

| Preset      | Status | Description                                       |
|-------------|--------|---------------------------------------------------|
| `mern`      | ✅ available | Express + React + MongoDB (Mongoose) + JWT + Docker |
| `next-full` | 🚧 planned   | Next.js App Router + Server Actions + Prisma      |
| `saas`      | 🚧 planned   | Next.js + Postgres + Drizzle + auth + billing     |
| `api`       | 🚧 planned   | Minimal backend-only API                          |
| `portfolio` | 🚧 planned   | Static/SSG frontend, no backend                   |
| `education` | 🚧 planned   | Simplified structure for learning, with docs      |

Selecting a planned preset today produces a minimal base project, not the full stack described above.

---

## What the MERN scaffold gives you

### 🎛️ Interactive wizard
A guided CLI experience (@inquirer/prompts + Chalk + Ora) walks you through project name, package
choices, and environment variables, then pre-fills your `.env`.

### 🗄️ Real database integration
Choosing MongoDB does more than drop in a config file. Stacksmith generates connection setup, a User
model, auth controllers/services, and validation.

### 🚀 Docker-ready
`docker-compose.yml` plus per-service Dockerfiles for the client and server.

### ✅ Production-quality defaults
- TypeScript across client and server
- Structured logging, centralized error handling, async handlers
- JWT auth with middleware and validators
- `.env.example` with documented variables

---

## Planned features

These are part of the vision but **not implemented yet** — tracked on the [Roadmap](#roadmap):

- 🧩 Plugin-based templates for every category (the loader exists; most plugins don't)
- 🤖 `stacksmith ai "<description>"` — AI-assisted module generation
- 🔄 `stacksmith add <feature>` — add auth/payments/file-upload after the fact
- 🧪 `stacksmith update` — update generated boilerplate to latest patterns

---

## Commands

```bash
stacksmith create <name> --preset mern   # ✅ full MERN scaffold (interactive)
stacksmith create <name> [flags]         # ✅ non-interactive with --preset mern -y
stacksmith setup                         # ✅ post-generation: install deps, git init, env setup
stacksmith doctor                        # ✅ diagnose config/env issues
stacksmith add <feature>                 # 🚧 not yet implemented
stacksmith update                        # 🚧 not yet implemented
stacksmith ai <description>              # 🚧 not yet implemented
```

---

## Project Structure (generated MERN app)

```
my-app/
├── client/              # React + Vite frontend
├── server/              # Express + Mongoose backend
├── docker-compose.yml
├── stacksmith.config.json
├── .env / .env.example
└── README.md
```

---

## Roadmap

- [ ] Additional presets (`next-full`, `saas`, `api`, `portfolio`, `education`)
- [ ] More frontends (Next.js, Vue/Nuxt, SvelteKit, Astro)
- [ ] More backends (Fastify, NestJS, Hono, tRPC)
- [ ] More databases & ORMs (Postgres, MySQL, SQLite + Prisma, Drizzle)
- [ ] More auth providers (Auth.js, Better Auth, Lucia, Clerk, Supabase)
- [ ] More deployment targets (Vercel, Railway, Render, Fly.io, AWS)
- [ ] `add`, `ai`, and `update` commands
- [ ] Monorepo (Turborepo) output
- [ ] Plugin marketplace / community template registry

---

## Contributing

Stacksmith is built to be extended, and the most valuable contributions right now are new plugins that
fill in the stack matrix above. See [CONTRIBUTING.md](CONTRIBUTING.md) for the plugin API and
submission guidelines.

---

## License

MIT © Stacksmith Contributors
