import type { Packages } from "../../../types/packages.js";
import type { GeneratedFile } from "./index.js";

export function rootFiles(
  name: string,
  packages: Packages,
  env: Record<string, string>,
): GeneratedFile[] {
  const port = env.PORT ?? "5000";

  return [
    {
      path: "package.json",
      content: JSON.stringify(
        {
          name,
          version: "0.1.0",
          private: true,
          description: `${name} — MERN stack application`,
          scripts: {
            dev: "concurrently \"npm run dev:server\" \"npm run dev:client\"",
            "dev:client": "npm run dev --workspace=client",
            "dev:server": "npm run dev --workspace=server",
            build: "npm run build --workspace=client && npm run build --workspace=server",
            start: "npm run start --workspace=server",
            lint: "npm run lint --workspaces --if-present",
          },
          workspaces: ["client", "server"],
          devDependencies: {
            concurrently: "^9.1.2",
          },
          engines: {
            node: ">=20",
          },
        },
        null,
        2,
      ),
    },
    {
      path: ".gitignore",
      content: `node_modules/
dist/
build/
.env
.env.local
*.log
.DS_Store
coverage/
uploads/
`,
    },
    {
      path: "docker-compose.yml",
      content: `services:
  mongodb:
    image: mongo:7
    restart: unless-stopped
    ports:
      - "27017:27017"
    volumes:
      - mongodb_data:/data/db
    environment:
      MONGO_INITDB_DATABASE: ${name}

  server:
    build:
      context: ./server
      dockerfile: Dockerfile
    restart: unless-stopped
    ports:
      - "${port}:${port}"
    env_file:
      - .env
    depends_on:
      - mongodb
    environment:
      MONGODB_URI: mongodb://mongodb:27017/${name}

  client:
    build:
      context: ./client
      dockerfile: Dockerfile
    restart: unless-stopped
    ports:
      - "5173:80"
    depends_on:
      - server

volumes:
  mongodb_data:
`,
    },
    {
      path: "README.md",
      content: `# ${name}

Full-stack MERN application generated with [Stacksmith](https://github.com/adhikareeprayush/stacksmith).

## Stack

- **Frontend**: React + Vite + TypeScript${packages.tailwind ? " + Tailwind CSS" : ""}
- **Backend**: Express + TypeScript
- **Database**: MongoDB + Mongoose
- **Auth**: JWT

## Getting started

\`\`\`bash
# Install dependencies
npm install

# Start MongoDB (if using Docker)
docker compose up mongodb -d

# Run dev servers (client + API)
npm run dev
\`\`\`

- Frontend: ${env.CLIENT_URL ?? "http://localhost:5173"}
- API: http://localhost:${port}
- Health check: http://localhost:${port}/api/health

## Project structure

\`\`\`
${name}/
├── client/          # React frontend (Vite)
├── server/          # Express API
├── docker-compose.yml
├── .env             # Environment variables (configured during setup)
└── package.json     # Workspace root
\`\`\`

## Scripts

| Command | Description |
|---------|-------------|
| \`npm run dev\` | Start client and server concurrently |
| \`npm run dev:client\` | Start frontend only |
| \`npm run dev:server\` | Start backend only |
| \`npm run build\` | Build both workspaces |
| \`npm start\` | Start production server |

## Environment

Copy \`.env.example\` to \`.env\` and update values as needed. Your \`.env\` was pre-filled during project creation.
`,
    },
  ];
}
