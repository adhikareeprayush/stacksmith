import { z } from "zod";

export const packagesSchema = z.object({
  // Frontend
  tailwind: z.boolean().default(true),
  reactRouter: z.boolean().default(true),
  zustand: z.boolean().default(false),
  tanstackQuery: z.boolean().default(false),
  reactHookForm: z.boolean().default(true),
  axios: z.boolean().default(true),
  lucideReact: z.boolean().default(true),

  // Backend
  helmet: z.boolean().default(true),
  cors: z.boolean().default(true),
  morgan: z.boolean().default(true),
  rateLimit: z.boolean().default(true),
  compression: z.boolean().default(false),
  multer: z.boolean().default(false),
  cloudinary: z.boolean().default(false),
  nodemailer: z.boolean().default(false),
  winston: z.boolean().default(true),
  cookieParser: z.boolean().default(true),
  expressValidator: z.boolean().default(true),
});

export type Packages = z.infer<typeof packagesSchema>;

export const DEFAULT_PACKAGES = packagesSchema.parse({});

export interface PackageOption {
  key: keyof Packages;
  name: string;
  description: string;
  group: "frontend" | "backend";
  default: boolean;
}

export const PACKAGE_OPTIONS: PackageOption[] = [
  {
    key: "tailwind",
    name: "Tailwind CSS",
    description: "Utility-first CSS framework",
    group: "frontend",
    default: true,
  },
  {
    key: "reactRouter",
    name: "React Router",
    description: "Client-side routing",
    group: "frontend",
    default: true,
  },
  {
    key: "reactHookForm",
    name: "React Hook Form",
    description: "Form state management",
    group: "frontend",
    default: true,
  },
  {
    key: "axios",
    name: "Axios",
    description: "HTTP client for API calls",
    group: "frontend",
    default: true,
  },
  {
    key: "lucideReact",
    name: "Lucide React",
    description: "Icon library",
    group: "frontend",
    default: true,
  },
  {
    key: "zustand",
    name: "Zustand",
    description: "Lightweight state management",
    group: "frontend",
    default: false,
  },
  {
    key: "tanstackQuery",
    name: "TanStack Query",
    description: "Server state / data fetching",
    group: "frontend",
    default: false,
  },
  {
    key: "helmet",
    name: "Helmet",
    description: "Secure HTTP headers",
    group: "backend",
    default: true,
  },
  {
    key: "cors",
    name: "CORS",
    description: "Cross-origin resource sharing",
    group: "backend",
    default: true,
  },
  {
    key: "morgan",
    name: "Morgan",
    description: "HTTP request logging",
    group: "backend",
    default: true,
  },
  {
    key: "rateLimit",
    name: "Rate Limiting",
    description: "express-rate-limit middleware",
    group: "backend",
    default: true,
  },
  {
    key: "winston",
    name: "Winston",
    description: "Structured logging",
    group: "backend",
    default: true,
  },
  {
    key: "cookieParser",
    name: "Cookie Parser",
    description: "Parse Cookie header",
    group: "backend",
    default: true,
  },
  {
    key: "expressValidator",
    name: "Express Validator",
    description: "Request validation",
    group: "backend",
    default: true,
  },
  {
    key: "compression",
    name: "Compression",
    description: "Gzip response compression",
    group: "backend",
    default: false,
  },
  {
    key: "multer",
    name: "Multer",
    description: "Multipart file upload handling",
    group: "backend",
    default: false,
  },
  {
    key: "cloudinary",
    name: "Cloudinary",
    description: "Cloud image storage (requires Multer)",
    group: "backend",
    default: false,
  },
  {
    key: "nodemailer",
    name: "Nodemailer",
    description: "Email sending",
    group: "backend",
    default: false,
  },
];
