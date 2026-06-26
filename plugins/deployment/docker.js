import path from "node:path";
import fs from "fs-extra";

/** @type {import("../../dist/index.js").ForgePlugin} */
const plugin = {
  id: "deployment-docker",
  category: "deployment",
  name: "Docker",
  description: "Dockerfile and docker-compose for local development",
  async apply(ctx) {
    await fs.writeFile(
      path.join(ctx.projectDir, "Dockerfile"),
      `FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
EXPOSE 3000
CMD ["npm", "start"]
`,
    );
    await fs.writeFile(
      path.join(ctx.projectDir, "docker-compose.yml"),
      `services:
  app:
    build: .
    ports:
      - "3000:3000"
    env_file:
      - .env
`,
    );
  },
};

export default plugin;
