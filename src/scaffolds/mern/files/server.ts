import type { Packages } from "../../../types/packages.js";
import type { GeneratedFile } from "./index.js";

export function serverFiles(
  name: string,
  pkg: Packages,
  _env: Record<string, string>,
): GeneratedFile[] {
  const serverDeps: Record<string, string> = {
    express: "^5.1.0",
    mongoose: "^8.15.1",
    bcryptjs: "^3.0.2",
    jsonwebtoken: "^9.0.2",
    dotenv: "^16.5.0",
  };

  const serverDevDeps: Record<string, string> = {
    "@types/express": "^5.0.3",
    "@types/bcryptjs": "^2.4.6",
    "@types/jsonwebtoken": "^9.0.9",
    "@types/node": "^22.15.29",
    typescript: "^5.8.3",
    tsx: "^4.19.4",
  };

  if (pkg.cors) {
    serverDeps.cors = "^2.8.5";
    serverDevDeps["@types/cors"] = "^2.8.18";
  }
  if (pkg.helmet) serverDeps.helmet = "^8.1.0";
  if (pkg.morgan) {
    serverDeps.morgan = "^1.10.0";
    serverDevDeps["@types/morgan"] = "^1.9.9";
  }
  if (pkg.rateLimit) serverDeps["express-rate-limit"] = "^7.5.0";
  if (pkg.compression) {
    serverDeps.compression = "^1.8.0";
    serverDevDeps["@types/compression"] = "^1.7.5";
  }
  if (pkg.cookieParser) {
    serverDeps["cookie-parser"] = "^1.4.7";
    serverDevDeps["@types/cookie-parser"] = "^1.4.8";
  }
  if (pkg.expressValidator) serverDeps["express-validator"] = "^7.2.1";
  if (pkg.multer) {
    serverDeps.multer = "^1.4.5-lts.2";
    serverDevDeps["@types/multer"] = "^1.4.12";
  }
  if (pkg.cloudinary) serverDeps.cloudinary = "^2.6.1";
  if (pkg.nodemailer) {
    serverDeps.nodemailer = "^7.0.3";
    serverDevDeps["@types/nodemailer"] = "^6.4.17";
  }
  if (pkg.winston) serverDeps.winston = "^3.17.0";

  return [
    {
      path: "server/package.json",
      content: JSON.stringify(
        {
          name: `${name}-server`,
          private: true,
          version: "0.1.0",
          type: "module",
          scripts: {
            dev: "tsx watch src/index.ts",
            build: "tsc",
            start: "node dist/index.js",
            lint: "tsc --noEmit",
          },
          dependencies: serverDeps,
          devDependencies: serverDevDeps,
        },
        null,
        2,
      ),
    },
    {
      path: "server/tsconfig.json",
      content: JSON.stringify(
        {
          compilerOptions: {
            target: "ES2022",
            module: "ESNext",
            moduleResolution: "bundler",
            lib: ["ES2022"],
            outDir: "dist",
            rootDir: "src",
            strict: true,
            esModuleInterop: true,
            skipLibCheck: true,
            resolveJsonModule: true,
            declaration: true,
            noUnusedLocals: true,
            noUnusedParameters: true,
          },
          include: ["src"],
          exclude: ["node_modules", "dist"],
        },
        null,
        2,
      ),
    },
    {
      path: "server/Dockerfile",
      content: `FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build
EXPOSE 5000
CMD ["npm", "start"]
`,
    },
    {
      path: "server/src/index.ts",
      content: getServerIndex(pkg),
    },
    {
      path: "server/src/app.ts",
      content: getAppTs(pkg),
    },
    {
      path: "server/src/config/env.ts",
      content: getEnvConfig(),
    },
    {
      path: "server/src/config/db.ts",
      content: getDbConfig(pkg),
    },
    {
      path: "server/src/models/User.model.ts",
      content: getUserModel(),
    },
    {
      path: "server/src/controllers/auth.controller.ts",
      content: getAuthController(),
    },
    {
      path: "server/src/controllers/user.controller.ts",
      content: getUserController(),
    },
    {
      path: "server/src/middleware/auth.middleware.ts",
      content: getAuthMiddleware(),
    },
    {
      path: "server/src/middleware/error.middleware.ts",
      content: getErrorMiddleware(),
    },
    {
      path: "server/src/middleware/validate.middleware.ts",
      content: getValidateMiddleware(pkg),
    },
    {
      path: "server/src/routes/index.ts",
      content: getRoutesIndex(),
    },
    {
      path: "server/src/routes/auth.routes.ts",
      content: getAuthRoutes(pkg),
    },
    {
      path: "server/src/routes/user.routes.ts",
      content: getUserRoutes(pkg),
    },
    {
      path: "server/src/services/auth.service.ts",
      content: getAuthService(),
    },
    ...(pkg.expressValidator
      ? [
          {
            path: "server/src/validators/auth.validator.ts",
            content: getAuthValidator(pkg),
          },
        ]
      : []),
    {
      path: "server/src/utils/AppError.ts",
      content: getAppError(),
    },
    {
      path: "server/src/utils/asyncHandler.ts",
      content: getAsyncHandler(),
    },
    {
      path: "server/src/utils/logger.ts",
      content: getLogger(pkg),
    },
    ...(pkg.multer
      ? [
          {
            path: "server/src/middleware/upload.middleware.ts",
            content: getUploadMiddleware(pkg),
          },
        ]
      : []),
    ...(pkg.nodemailer
      ? [
          {
            path: "server/src/services/email.service.ts",
            content: getEmailService(),
          },
        ]
      : []),
    ...(pkg.cloudinary
      ? [
          {
            path: "server/src/config/cloudinary.ts",
            content: getCloudinaryConfig(),
          },
        ]
      : []),
  ];
}

function getServerIndex(_pkg: Packages): string {
  return `import "dotenv/config";
import app from "./app.js";
import { connectDB } from "./config/db.js";
import { env } from "./config/env.js";
import { logger } from "./utils/logger.js";

async function start() {
  await connectDB();
  app.listen(env.PORT, () => {
    logger.info(\`Server running on http://localhost:\${env.PORT}\`);
  });
}

start().catch((err) => {
  logger.error("Failed to start server", err);
  process.exit(1);
});
`;
}

function getAppTs(pkg: Packages): string {
  const imports: string[] = ["import express from \"express\";"];
  const middleware: string[] = [];

  if (pkg.helmet) {
    imports.push('import helmet from "helmet";');
    middleware.push("app.use(helmet());");
  }
  if (pkg.cors) {
    imports.push('import cors from "cors";');
    imports.push('import { env } from "./config/env.js";');
    middleware.push(
      "app.use(cors({ origin: env.CLIENT_URL, credentials: true }));",
    );
  }
  if (pkg.compression) {
    imports.push('import compression from "compression";');
    middleware.push("app.use(compression());");
  }
  if (pkg.morgan) {
    imports.push('import morgan from "morgan";');
    middleware.push('app.use(morgan("dev"));');
  }
  if (pkg.rateLimit) {
    imports.push('import rateLimit from "express-rate-limit";');
    middleware.push(`app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: { success: false, message: "Too many requests" },
  }),
);`);
  }
  if (pkg.cookieParser) {
    imports.push('import cookieParser from "cookie-parser";');
    middleware.push("app.use(cookieParser());");
  }

  imports.push('import routes from "./routes/index.js";');
  imports.push(
    'import { errorHandler, notFoundHandler } from "./middleware/error.middleware.js";',
  );

  return `${imports.join("\n")}

const app = express();

${middleware.join("\n")}
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

app.use("/api", routes);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
`;
}

function getEnvConfig(): string {
  return `function requireEnv(key: string, fallback?: string): string {
  const value = process.env[key] ?? fallback;
  if (!value) {
    throw new Error(\`Missing required environment variable: \${key}\`);
  }
  return value;
}

export const env = {
  NODE_ENV: process.env.NODE_ENV ?? "development",
  PORT: parseInt(process.env.PORT ?? "5000", 10),
  CLIENT_URL: process.env.CLIENT_URL ?? "http://localhost:5173",
  MONGODB_URI: requireEnv("MONGODB_URI"),
  JWT_SECRET: requireEnv("JWT_SECRET"),
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN ?? "7d",
  SMTP_HOST: process.env.SMTP_HOST,
  SMTP_PORT: process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT, 10) : undefined,
  SMTP_USER: process.env.SMTP_USER,
  SMTP_PASS: process.env.SMTP_PASS,
  EMAIL_FROM: process.env.EMAIL_FROM,
  CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME,
  CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY,
  CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET,
} as const;
`;
}

function getDbConfig(_pkg: Packages): string {
  return `import mongoose from "mongoose";
import { env } from "./env.js";
import { logger } from "../utils/logger.js";

export async function connectDB(): Promise<void> {
  try {
    await mongoose.connect(env.MONGODB_URI);
    logger.info("MongoDB connected");
  } catch (error) {
    logger.error("MongoDB connection failed", error);
    process.exit(1);
  }

  mongoose.connection.on("disconnected", () => {
    logger.warn("MongoDB disconnected");
  });
}
`;
}

function getUserModel(): string {
  return `import mongoose, { type Document, Schema } from "mongoose";

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  role: "user" | "admin";
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, minlength: 6, select: false },
    role: { type: String, enum: ["user", "admin"], default: "user" },
  },
  { timestamps: true },
);

userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

export const User = mongoose.model<IUser>("User", userSchema);
`;
}

function getAuthController(): string {
  return `import type { Request, Response } from "express";
import { authService } from "../services/auth.service.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const register = asyncHandler(async (req: Request, res: Response) => {
  const { name, email, password } = req.body;
  const result = await authService.register({ name, email, password });
  res.status(201).json({ success: true, message: "Account created", data: result });
});

export const login = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body;
  const result = await authService.login({ email, password });
  res.json({ success: true, message: "Logged in", data: result });
});

export const getMe = asyncHandler(async (req: Request, res: Response) => {
  res.json({ success: true, data: { user: req.user } });
});
`;
}

function getUserController(): string {
  return `import type { Request, Response } from "express";
import { User } from "../models/User.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { AppError } from "../utils/AppError.js";

export const getUsers = asyncHandler(async (_req: Request, res: Response) => {
  const users = await User.find().select("-password");
  res.json({ success: true, data: users });
});

export const getUserById = asyncHandler(async (req: Request, res: Response) => {
  const user = await User.findById(req.params.id).select("-password");
  if (!user) throw new AppError("User not found", 404);
  res.json({ success: true, data: user });
});
`;
}

function getAuthMiddleware(): string {
  return `import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { User, type IUser } from "../models/User.model.js";
import { env } from "../config/env.js";
import { AppError } from "../utils/AppError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

declare global {
  namespace Express {
    interface Request {
      user?: IUser;
    }
  }
}

export const protect = asyncHandler(
  async (req: Request, _res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith("Bearer ")) {
      throw new AppError("Not authorized", 401);
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, env.JWT_SECRET) as { id: string };
    const user = await User.findById(decoded.id);

    if (!user) throw new AppError("User not found", 401);
    req.user = user;
    next();
  },
);

export const authorize = (...roles: string[]) =>
  (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      throw new AppError("Forbidden", 403);
    }
    next();
  };
`;
}

function getErrorMiddleware(): string {
  return `import type { Request, Response, NextFunction } from "express";
import { AppError } from "../utils/AppError.js";
import { logger } from "../utils/logger.js";

export function notFoundHandler(req: Request, _res: Response, next: NextFunction) {
  next(new AppError(\`Route not found: \${req.method} \${req.originalUrl}\`, 404));
}

export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction,
) {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
    });
  }

  logger.error("Unhandled error", err);
  res.status(500).json({
    success: false,
    message: process.env.NODE_ENV === "production" ? "Internal server error" : err.message,
  });
}
`;
}

function getValidateMiddleware(pkg: Packages): string {
  if (!pkg.expressValidator) {
    return `import type { Request, Response, NextFunction } from "express";

export function validate(_req: Request, _res: Response, next: NextFunction) {
  next();
}
`;
  }

  return `import type { Request, Response, NextFunction } from "express";
import { validationResult, type ValidationChain } from "express-validator";
import { AppError } from "../utils/AppError.js";

export function validate(validations: ValidationChain[]) {
  return async (req: Request, _res: Response, next: NextFunction) => {
    await Promise.all(validations.map((v) => v.run(req)));
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new AppError(errors.array()[0]?.msg ?? "Validation failed", 400);
    }
    next();
  };
}
`;
}

function getRoutesIndex(): string {
  return `import { Router } from "express";
import authRoutes from "./auth.routes.js";
import userRoutes from "./user.routes.js";

const router = Router();

router.get("/health", (_req, res) => {
  res.json({ success: true, message: "API is running" });
});

router.use("/auth", authRoutes);
router.use("/users", userRoutes);

export default router;
`;
}

function getAuthRoutes(pkg: Packages): string {
  if (pkg.expressValidator) {
    return `import { Router } from "express";
import { register, login, getMe } from "../controllers/auth.controller.js";
import { protect } from "../middleware/auth.middleware.js";
import { validate } from "../middleware/validate.middleware.js";
import { registerValidation, loginValidation } from "../validators/auth.validator.js";

const router = Router();

router.post("/register", validate(registerValidation), register);
router.post("/login", validate(loginValidation), login);
router.get("/me", protect, getMe);

export default router;
`;
  }

  return `import { Router } from "express";
import { register, login, getMe } from "../controllers/auth.controller.js";
import { protect } from "../middleware/auth.middleware.js";

const router = Router();

router.post("/register", register);
router.post("/login", login);
router.get("/me", protect, getMe);

export default router;
`;
}

function getUserRoutes(_pkg: Packages): string {
  return `import { Router } from "express";
import { getUsers, getUserById } from "../controllers/user.controller.js";
import { protect, authorize } from "../middleware/auth.middleware.js";

const router = Router();

router.use(protect);
router.get("/", authorize("admin"), getUsers);
router.get("/:id", getUserById);

export default router;
`;
}

function getAuthService(): string {
  return `import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { User } from "../models/User.model.js";
import { env } from "../config/env.js";
import { AppError } from "../utils/AppError.js";

interface RegisterInput {
  name: string;
  email: string;
  password: string;
}

interface LoginInput {
  email: string;
  password: string;
}

function signToken(userId: string): string {
  return jwt.sign({ id: userId }, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN,
  });
}

export const authService = {
  async register({ name, email, password }: RegisterInput) {
    const existing = await User.findOne({ email });
    if (existing) throw new AppError("Email already registered", 409);

    const hashed = await bcrypt.hash(password, 12);
    const user = await User.create({ name, email, password: hashed });
    const token = signToken(user._id.toString());

    return { user, token };
  },

  async login({ email, password }: LoginInput) {
    const user = await User.findOne({ email }).select("+password");
    if (!user) throw new AppError("Invalid credentials", 401);

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) throw new AppError("Invalid credentials", 401);

    const token = signToken(user._id.toString());
    user.password = undefined as unknown as string;

    return { user, token };
  },
};
`;
}

function getAuthValidator(pkg: Packages): string {
  if (!pkg.expressValidator) return "";

  return `import { body } from "express-validator";

export const registerValidation = [
  body("name").trim().notEmpty().withMessage("Name is required"),
  body("email").isEmail().withMessage("Valid email is required"),
  body("password").isLength({ min: 6 }).withMessage("Password must be at least 6 characters"),
];

export const loginValidation = [
  body("email").isEmail().withMessage("Valid email is required"),
  body("password").notEmpty().withMessage("Password is required"),
];
`;
}

function getAppError(): string {
  return `export class AppError extends Error {
  constructor(
    message: string,
    public statusCode: number = 500,
  ) {
    super(message);
    this.name = "AppError";
  }
}
`;
}

function getAsyncHandler(): string {
  return `import type { Request, Response, NextFunction, RequestHandler } from "express";

export function asyncHandler(fn: RequestHandler): RequestHandler {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}
`;
}

function getLogger(pkg: Packages): string {
  if (pkg.winston) {
    return `import winston from "winston";

export const logger = winston.createLogger({
  level: process.env.NODE_ENV === "production" ? "info" : "debug",
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json(),
  ),
  transports: [new winston.transports.Console()],
});
`;
  }

  return `export const logger = {
  info: (...args: unknown[]) => console.log("[INFO]", ...args),
  warn: (...args: unknown[]) => console.warn("[WARN]", ...args),
  error: (...args: unknown[]) => console.error("[ERROR]", ...args),
  debug: (...args: unknown[]) => console.debug("[DEBUG]", ...args),
};
`;
}

function getUploadMiddleware(_pkg: Packages): string {
  return `import multer from "multer";
import path from "node:path";

const storage = multer.diskStorage({
  destination: "uploads/",
  filename: (_req, file, cb) => {
    const unique = \`\${Date.now()}-\${Math.round(Math.random() * 1e9)}\`;
    cb(null, unique + path.extname(file.originalname));
  },
});

export const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowed = /jpeg|jpg|png|gif|webp/;
    const valid = allowed.test(path.extname(file.originalname).toLowerCase());
    cb(null, valid);
  },
});
`;
}

function getEmailService(): string {
  return `import nodemailer from "nodemailer";
import { env } from "../config/env.js";
import { logger } from "../utils/logger.js";

const transporter = nodemailer.createTransport({
  host: env.SMTP_HOST,
  port: env.SMTP_PORT,
  secure: env.SMTP_PORT === 465,
  auth: env.SMTP_USER ? { user: env.SMTP_USER, pass: env.SMTP_PASS } : undefined,
});

export async function sendEmail(to: string, subject: string, html: string) {
  if (!env.SMTP_HOST) {
    logger.warn("Email not configured — skipping send");
    return;
  }
  await transporter.sendMail({
    from: env.EMAIL_FROM,
    to,
    subject,
    html,
  });
}
`;
}

function getCloudinaryConfig(): string {
  return `import { v2 as cloudinary } from "cloudinary";
import { env } from "./env.js";

if (env.CLOUDINARY_CLOUD_NAME) {
  cloudinary.config({
    cloud_name: env.CLOUDINARY_CLOUD_NAME,
    api_key: env.CLOUDINARY_API_KEY,
    api_secret: env.CLOUDINARY_API_SECRET,
  });
}

export { cloudinary };
`;
}
