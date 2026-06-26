import { input, password } from "@inquirer/prompts";
import type { Packages } from "../types/packages.js";

export interface EnvVarDefinition {
  key: string;
  message: string;
  default?: string;
  secret?: boolean;
  when?: (packages: Packages) => boolean;
}

export const ENV_DEFINITIONS: EnvVarDefinition[] = [
  {
    key: "NODE_ENV",
    message: "Node environment",
    default: "development",
  },
  {
    key: "PORT",
    message: "Server port",
    default: "5000",
  },
  {
    key: "CLIENT_URL",
    message: "Frontend URL (for CORS)",
    default: "http://localhost:5173",
  },
  {
    key: "MONGODB_URI",
    message: "MongoDB connection URI",
    default: "mongodb://localhost:27017/my-app",
  },
  {
    key: "JWT_SECRET",
    message: "JWT secret key",
    secret: true,
  },
  {
    key: "JWT_EXPIRES_IN",
    message: "JWT expiration",
    default: "7d",
  },
  {
    key: "CLOUDINARY_CLOUD_NAME",
    message: "Cloudinary cloud name",
    when: (p) => p.cloudinary,
  },
  {
    key: "CLOUDINARY_API_KEY",
    message: "Cloudinary API key",
    secret: true,
    when: (p) => p.cloudinary,
  },
  {
    key: "CLOUDINARY_API_SECRET",
    message: "Cloudinary API secret",
    secret: true,
    when: (p) => p.cloudinary,
  },
  {
    key: "SMTP_HOST",
    message: "SMTP host",
    default: "smtp.gmail.com",
    when: (p) => p.nodemailer,
  },
  {
    key: "SMTP_PORT",
    message: "SMTP port",
    default: "587",
    when: (p) => p.nodemailer,
  },
  {
    key: "SMTP_USER",
    message: "SMTP username / email",
    when: (p) => p.nodemailer,
  },
  {
    key: "SMTP_PASS",
    message: "SMTP password",
    secret: true,
    when: (p) => p.nodemailer,
  },
  {
    key: "EMAIL_FROM",
    message: "Default from address",
    when: (p) => p.nodemailer,
  },
];

export function getDefaultEnv(
  projectName: string,
  packages: Packages,
): Record<string, string> {
  const env: Record<string, string> = {
    NODE_ENV: "development",
    PORT: "5000",
    CLIENT_URL: "http://localhost:5173",
    MONGODB_URI: `mongodb://localhost:27017/${projectName}`,
    JWT_SECRET: generateJwtSecret(),
    JWT_EXPIRES_IN: "7d",
  };

  if (packages.cloudinary) {
    env.CLOUDINARY_CLOUD_NAME = "";
    env.CLOUDINARY_API_KEY = "";
    env.CLOUDINARY_API_SECRET = "";
  }

  if (packages.nodemailer) {
    env.SMTP_HOST = "smtp.gmail.com";
    env.SMTP_PORT = "587";
    env.SMTP_USER = "";
    env.SMTP_PASS = "";
    env.EMAIL_FROM = "";
  }

  return env;
}

export async function promptEnvVars(
  projectName: string,
  packages: Packages,
  defaults?: Record<string, string>,
): Promise<Record<string, string>> {
  const base = defaults ?? getDefaultEnv(projectName, packages);
  const env: Record<string, string> = { ...base };

  // Replace placeholder in MONGODB_URI default
  if (env.MONGODB_URI) {
    env.MONGODB_URI = env.MONGODB_URI.replace("/my-app", `/${projectName}`);
  }

  const applicable = ENV_DEFINITIONS.filter(
    (def) => !def.when || def.when(packages),
  );

  for (const def of applicable) {
    const currentDefault = env[def.key] ?? def.default ?? "";

    if (def.secret) {
      const value = await password({
        message: def.message,
        mask: "*",
      });
      env[def.key] = value || currentDefault;
    } else {
      const value = await input({
        message: def.message,
        default: currentDefault,
      });
      env[def.key] = value;
    }
  }

  return env;
}

function generateJwtSecret(): string {
  const chars =
    "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let result = "";
  for (let i = 0; i < 48; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export function formatEnvFile(env: Record<string, string>): string {
  const lines = Object.entries(env).map(([key, value]) => `${key}=${value}`);
  return `${lines.join("\n")}\n`;
}
