import type { Packages } from "../../../types/packages.js";
import type { GeneratedFile } from "./index.js";

export function clientFiles(
  name: string,
  pkg: Packages,
  env: Record<string, string>,
): GeneratedFile[] {
  const apiUrl = `http://localhost:${env.PORT ?? "5000"}/api`;

  const clientDeps: Record<string, string> = {
    react: "^19.1.0",
    "react-dom": "^19.1.0",
  };

  const clientDevDeps: Record<string, string> = {
    "@types/react": "^19.1.6",
    "@types/react-dom": "^19.1.5",
    "@vitejs/plugin-react": "^4.5.2",
    typescript: "^5.8.3",
    vite: "^6.3.5",
  };

  if (pkg.reactRouter) clientDeps["react-router-dom"] = "^7.6.2";
  if (pkg.axios) clientDeps.axios = "^1.9.0";
  if (pkg.reactHookForm) clientDeps["react-hook-form"] = "^7.57.0";
  if (pkg.zustand) clientDeps.zustand = "^5.0.5";
  if (pkg.tanstackQuery) {
    clientDeps["@tanstack/react-query"] = "^5.80.6";
  }
  if (pkg.lucideReact) clientDeps["lucide-react"] = "^0.514.0";
  if (pkg.tailwind) {
    clientDevDeps.tailwindcss = "^4.1.8";
    clientDevDeps["@tailwindcss/vite"] = "^4.1.8";
  }

  const files: GeneratedFile[] = [
    {
      path: "client/package.json",
      content: JSON.stringify(
        {
          name: `${name}-client`,
          private: true,
          version: "0.1.0",
          type: "module",
          scripts: {
            dev: "vite",
            build: "tsc -b && vite build",
            preview: "vite preview",
            lint: "tsc --noEmit",
          },
          dependencies: clientDeps,
          devDependencies: clientDevDeps,
        },
        null,
        2,
      ),
    },
    {
      path: "client/tsconfig.json",
      content: JSON.stringify(
        {
          compilerOptions: {
            target: "ES2022",
            useDefineForClassFields: true,
            lib: ["ES2022", "DOM", "DOM.Iterable"],
            module: "ESNext",
            skipLibCheck: true,
            moduleResolution: "bundler",
            allowImportingTsExtensions: true,
            isolatedModules: true,
            moduleDetection: "force",
            noEmit: true,
            jsx: "react-jsx",
            strict: true,
            noUnusedLocals: true,
            noUnusedParameters: true,
            noFallthroughCasesInSwitch: true,
            noUncheckedSideEffectImports: true,
            baseUrl: ".",
            paths: { "@/*": ["src/*"] },
          },
          include: ["src"],
        },
        null,
        2,
      ),
    },
    {
      path: "client/tsconfig.node.json",
      content: JSON.stringify(
        {
          compilerOptions: {
            target: "ES2022",
            lib: ["ES2023"],
            module: "ESNext",
            skipLibCheck: true,
            moduleResolution: "bundler",
          },
          include: ["vite.config.ts"],
        },
        null,
        2,
      ),
    },
    {
      path: "client/vite.config.ts",
      content: `import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "node:path";
${pkg.tailwind ? 'import tailwindcss from "@tailwindcss/vite";\n' : ""}
export default defineConfig({
  plugins: [react()${pkg.tailwind ? ", tailwindcss()" : ""}],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    port: 5173,
    proxy: {
      "/api": {
        target: "${apiUrl.replace("/api", "")}",
        changeOrigin: true,
      },
    },
  },
});
`,
    },
    {
      path: "client/index.html",
      content: `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${name}</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
`,
    },
    {
      path: "client/Dockerfile",
      content: `FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
`,
    },
    {
      path: "client/nginx.conf",
      content: `server {
  listen 80;
  root /usr/share/nginx/html;
  index index.html;

  location / {
    try_files $uri $uri/ /index.html;
  }

  location /api {
    proxy_pass http://server:${env.PORT ?? "5000"};
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";
    proxy_set_header Host $host;
  }
}
`,
    },
    {
      path: "client/src/vite-env.d.ts",
      content: `/// <reference types="vite/client" />
`,
    },
    {
      path: "client/src/main.tsx",
      content: getMainTsx(pkg),
    },
    {
      path: "client/src/App.tsx",
      content: getAppTsx(pkg),
    },
    {
      path: "client/src/index.css",
      content: pkg.tailwind
        ? `@import "tailwindcss";\n\nbody {\n  @apply bg-gray-50 text-gray-900 antialiased;\n}\n`
        : `*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }\nbody { font-family: system-ui, sans-serif; background: #f9fafb; color: #111827; }\n`,
    },
    {
      path: "client/src/types/index.ts",
      content: `export interface User {
  _id: string;
  name: string;
  email: string;
  role: "user" | "admin";
  createdAt: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data?: {
    user: User;
    token: string;
  };
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
}
`,
    },
    {
      path: "client/src/services/api.ts",
      content: getApiService(pkg, apiUrl),
    },
    {
      path: "client/src/context/AuthContext.tsx",
      content: getAuthContext(pkg),
    },
    {
      path: "client/src/hooks/useAuth.ts",
      content: `import { useContext } from "react";
import { AuthContext } from "@/context/AuthContext";

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
`,
    },
    {
      path: "client/src/components/layout/Layout.tsx",
      content: getLayout(pkg),
    },
    {
      path: "client/src/components/layout/Header.tsx",
      content: getHeader(pkg, name),
    },
    {
      path: "client/src/components/layout/Footer.tsx",
      content: `export function Footer() {
  return (
    <footer className="border-t border-gray-200 bg-white py-6 text-center text-sm text-gray-500">
      <p>&copy; {new Date().getFullYear()} ${name}. Built with Stacksmith.</p>
    </footer>
  );
}
`,
    },
    {
      path: "client/src/components/ui/Button.tsx",
      content: getButton(pkg),
    },
    {
      path: "client/src/components/ui/Input.tsx",
      content: getInput(pkg),
    },
    {
      path: "client/src/components/ui/Spinner.tsx",
      content: getSpinner(pkg),
    },
    {
      path: "client/src/components/auth/LoginForm.tsx",
      content: getLoginForm(pkg),
    },
    {
      path: "client/src/components/auth/RegisterForm.tsx",
      content: getRegisterForm(pkg),
    },
    {
      path: "client/src/pages/Home.tsx",
      content: getHomePage(pkg, name),
    },
    {
      path: "client/src/pages/Login.tsx",
      content: getLoginPage(),
    },
    {
      path: "client/src/pages/Register.tsx",
      content: getRegisterPage(),
    },
    {
      path: "client/src/pages/Dashboard.tsx",
      content: getDashboardPage(pkg),
    },
    {
      path: "client/src/pages/NotFound.tsx",
      content: getNotFoundPage(pkg),
    },
    {
      path: "client/src/utils/storage.ts",
      content: `const TOKEN_KEY = "auth_token";

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

export function removeToken(): void {
  localStorage.removeItem(TOKEN_KEY);
}
`,
    },
  ];

  return files;
}

function getMainTsx(pkg: Packages): string {
  if (pkg.tanstackQuery) {
    return `import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import App from "./App";
import "./index.css";

const queryClient = new QueryClient();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </StrictMode>,
);
`;
  }

  return `import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
`;
}

function getAppTsx(pkg: Packages): string {
  const routerImport = pkg.reactRouter
    ? `import { BrowserRouter, Routes, Route } from "react-router-dom";\n`
    : "";
  const authImport = `import { AuthProvider } from "@/context/AuthContext";\n`;
  const layoutImport = `import { Layout } from "@/components/layout/Layout";\n`;
  const pagesImport = `import { Home } from "@/pages/Home";
import { Login } from "@/pages/Login";
import { Register } from "@/pages/Register";
import { Dashboard } from "@/pages/Dashboard";
import { NotFound } from "@/pages/NotFound";\n`;

  if (!pkg.reactRouter) {
    return `${authImport}import { Home } from "@/pages/Home";

export default function App() {
  return (
    <AuthProvider>
      <Home />
    </AuthProvider>
  );
}
`;
  }

  return `${routerImport}${authImport}${layoutImport}${pagesImport}
export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
`;
}

function getApiService(pkg: Packages, apiUrl: string): string {
  if (pkg.axios) {
    return `import axios from "axios";
import { getToken, removeToken } from "@/utils/storage";

const api = axios.create({
  baseURL: "${apiUrl}",
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = \`Bearer \${token}\`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      removeToken();
      window.location.href = "/login";
    }
    return Promise.reject(error);
  },
);

export default api;
`;
  }

  return `const API_URL = "${apiUrl}";

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem("auth_token");
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };
  if (token) headers.Authorization = \`Bearer \${token}\`;

  const res = await fetch(\`\${API_URL}\${endpoint}\`, { ...options, headers });
  if (!res.ok) throw new Error(await res.text());
  return res.json() as Promise<T>;
}

export default { get: <T>(url: string) => request<T>(url), post: <T>(url: string, body: unknown) => request<T>(url, { method: "POST", body: JSON.stringify(body) }) };
`;
}

function getAuthContext(_pkg: Packages): string {
  return `import { createContext, useState, useEffect, type ReactNode } from "react";
import api from "@/services/api";
import { getToken, setToken, removeToken } from "@/utils/storage";
import type { User, AuthResponse } from "@/types";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

export const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = getToken();
    if (token) {
      api
        .get("/auth/me")
        .then((res) => setUser(res.data.data.user))
        .catch(() => removeToken())
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email: string, password: string) => {
    const res = await api.post<AuthResponse>("/auth/login", { email, password });
    const { user, token } = res.data.data!;
    setToken(token);
    setUser(user);
  };

  const register = async (name: string, email: string, password: string) => {
    const res = await api.post<AuthResponse>("/auth/register", { name, email, password });
    const { user, token } = res.data.data!;
    setToken(token);
    setUser(user);
  };

  const logout = () => {
    removeToken();
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{ user, loading, login, register, logout, isAuthenticated: !!user }}
    >
      {children}
    </AuthContext.Provider>
  );
}
`;
}

function getLayout(pkg: Packages): string {
  const outlet = pkg.reactRouter ? `<Outlet />` : `{children}`;
  const imports = pkg.reactRouter
    ? `import { Outlet } from "react-router-dom";\n`
    : "";

  return `${imports}import { Header } from "./Header";
import { Footer } from "./Footer";

export function Layout({ children }: { children?: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8">
        ${outlet}
      </main>
      <Footer />
    </div>
  );
}
`;
}

function getHeader(pkg: Packages, appName: string): string {
  const linkImport = pkg.reactRouter
    ? `import { Link, useNavigate } from "react-router-dom";\n`
    : "";
  const brand = pkg.reactRouter
    ? `<Link to="/" className="text-xl font-bold text-gray-900">${appName}</Link>`
    : `<a href="/" className="text-xl font-bold text-gray-900">${appName}</a>`;

  return `${linkImport}import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/Button";
${pkg.lucideReact ? 'import { LogOut, User } from "lucide-react";\n' : ""}

export function Header() {
  const { user, isAuthenticated, logout } = useAuth();
  ${pkg.reactRouter ? "const navigate = useNavigate();" : ""}

  const handleLogout = () => {
    logout();
    ${pkg.reactRouter ? 'navigate("/");' : 'window.location.href = "/";'}
  };

  return (
    <header className="border-b border-gray-200 bg-white">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
        ${brand}
        <nav className="flex items-center gap-4">
          {isAuthenticated ? (
            <>
              <span className="flex items-center gap-1 text-sm text-gray-600">
                ${pkg.lucideReact ? '<User className="h-4 w-4" />' : ""}
                {user?.name}
              </span>
              ${pkg.reactRouter ? '<Link to="/dashboard" className="text-sm text-gray-600 hover:text-gray-900">Dashboard</Link>' : ""}
              <Button variant="ghost" size="sm" onClick={handleLogout}>
                ${pkg.lucideReact ? '<LogOut className="h-4 w-4" />' : "Logout"}
              </Button>
            </>
          ) : (
            <>
              ${pkg.reactRouter ? '<Link to="/login" className="text-sm text-gray-600 hover:text-gray-900">Login</Link>' : ""}
              ${pkg.reactRouter ? '<Link to="/register"><Button size="sm">Sign up</Button></Link>' : ""}
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
`;
}

function getButton(_pkg: Packages): string {
  return `import type { ButtonHTMLAttributes, ReactNode } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost";
  size?: "sm" | "md" | "lg";
  children: ReactNode;
  loading?: boolean;
}

const variants = {
  primary: "bg-blue-600 text-white hover:bg-blue-700",
  secondary: "bg-gray-200 text-gray-900 hover:bg-gray-300",
  ghost: "bg-transparent text-gray-600 hover:bg-gray-100",
};

const sizes = {
  sm: "px-3 py-1.5 text-sm",
  md: "px-4 py-2 text-sm",
  lg: "px-6 py-3 text-base",
};

export function Button({
  variant = "primary",
  size = "md",
  children,
  loading,
  className = "",
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      className={\`inline-flex items-center justify-center rounded-lg font-medium transition-colors disabled:opacity-50 \${variants[variant]} \${sizes[size]} \${className}\`}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? "Loading..." : children}
    </button>
  );
}
`;
}

function getInput(_pkg: Packages): string {
  return `import { forwardRef, type InputHTMLAttributes } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className = "", id, ...props }, ref) => {
    const inputId = id ?? label?.toLowerCase().replace(/\\s+/g, "-");
    return (
      <div className="space-y-1">
        {label && (
          <label htmlFor={inputId} className="block text-sm font-medium text-gray-700">
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={\`w-full rounded-lg border px-3 py-2 text-sm outline-none transition-colors focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 \${error ? "border-red-500" : "border-gray-300"} \${className}\`}
          {...props}
        />
        {error && <p className="text-sm text-red-500">{error}</p>}
      </div>
    );
  },
);

Input.displayName = "Input";
`;
}

function getSpinner(_pkg: Packages): string {
  return `export function Spinner({ className = "" }: { className?: string }) {
  return (
    <div
      className={\`h-6 w-6 animate-spin rounded-full border-2 border-gray-300 border-t-blue-600 \${className}\`}
      role="status"
      aria-label="Loading"
    />
  );
}
`;
}

function getLoginForm(pkg: Packages): string {
  if (pkg.reactHookForm) {
    return `import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useState } from "react";

interface LoginFormData {
  email: string;
  password: string;
}

export function LoginForm() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginFormData>();

  const onSubmit = async (data: LoginFormData) => {
    try {
      setError("");
      await login(data.email, data.password);
      navigate("/dashboard");
    } catch {
      setError("Invalid email or password");
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {error && <p className="rounded-lg bg-red-50 p-3 text-sm text-red-600">{error}</p>}
      <Input
        label="Email"
        type="email"
        {...register("email", { required: "Email is required" })}
        error={errors.email?.message}
      />
      <Input
        label="Password"
        type="password"
        {...register("password", { required: "Password is required" })}
        error={errors.password?.message}
      />
      <Button type="submit" loading={isSubmitting} className="w-full">
        Sign in
      </Button>
    </form>
  );
}
`;
  }

  return `import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

export function LoginForm() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError("");
      await login(email, password);
      navigate("/dashboard");
    } catch {
      setError("Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <p className="rounded-lg bg-red-50 p-3 text-sm text-red-600">{error}</p>}
      <Input label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
      <Input label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
      <Button type="submit" loading={loading} className="w-full">Sign in</Button>
    </form>
  );
}
`;
}

function getRegisterForm(pkg: Packages): string {
  if (pkg.reactHookForm) {
    return `import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useState } from "react";

interface RegisterFormData {
  name: string;
  email: string;
  password: string;
}

export function RegisterForm() {
  const { register: registerUser } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<RegisterFormData>();

  const onSubmit = async (data: RegisterFormData) => {
    try {
      setError("");
      await registerUser(data.name, data.email, data.password);
      navigate("/dashboard");
    } catch {
      setError("Registration failed. Email may already be in use.");
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {error && <p className="rounded-lg bg-red-50 p-3 text-sm text-red-600">{error}</p>}
      <Input label="Name" {...register("name", { required: "Name is required" })} error={errors.name?.message} />
      <Input label="Email" type="email" {...register("email", { required: "Email is required" })} error={errors.email?.message} />
      <Input label="Password" type="password" {...register("password", { required: "Password is required", minLength: { value: 6, message: "Min 6 characters" } })} error={errors.password?.message} />
      <Button type="submit" loading={isSubmitting} className="w-full">Create account</Button>
    </form>
  );
}
`;
  }

  return `import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

export function RegisterForm() {
  const { register: registerUser } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError("");
      await registerUser(name, email, password);
      navigate("/dashboard");
    } catch {
      setError("Registration failed. Email may already be in use.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <p className="rounded-lg bg-red-50 p-3 text-sm text-red-600">{error}</p>}
      <Input label="Name" value={name} onChange={(e) => setName(e.target.value)} required />
      <Input label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
      <Input label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} />
      <Button type="submit" loading={loading} className="w-full">Create account</Button>
    </form>
  );
}
`;
}

function getHomePage(pkg: Packages, name: string): string {
  return `import { useAuth } from "@/hooks/useAuth";
${pkg.reactRouter ? 'import { Link } from "react-router-dom";\n' : ""}import { Button } from "@/components/ui/Button";

export function Home() {
  const { isAuthenticated } = useAuth();

  return (
    <div className="text-center">
      <h1 className="text-4xl font-bold tracking-tight text-gray-900">
        Welcome to ${name}
      </h1>
      <p className="mt-4 text-lg text-gray-600">
        A production-ready MERN stack application. Start building your features.
      </p>
      <div className="mt-8 flex justify-center gap-4">
        {isAuthenticated ? (
          ${pkg.reactRouter ? '<Link to="/dashboard"><Button>Go to Dashboard</Button></Link>' : "<Button>Go to Dashboard</Button>"}
        ) : (
          <>
            ${pkg.reactRouter ? '<Link to="/register"><Button>Get Started</Button></Link>' : "<Button>Get Started</Button>"}
            ${pkg.reactRouter ? '<Link to="/login"><Button variant="secondary">Sign In</Button></Link>' : ""}
          </>
        )}
      </div>
    </div>
  );
}
`;
}

function getLoginPage(): string {
  return `import { Link } from "react-router-dom";
import { LoginForm } from "@/components/auth/LoginForm";

export function Login() {
  return (
    <div className="mx-auto max-w-md">
      <h1 className="mb-6 text-2xl font-bold text-gray-900">Sign in</h1>
      <LoginForm />
      <p className="mt-4 text-center text-sm text-gray-600">
        Don&apos;t have an account?{" "}
        <Link to="/register" className="text-blue-600 hover:underline">Sign up</Link>
      </p>
    </div>
  );
}
`;
}

function getRegisterPage(): string {
  return `import { Link } from "react-router-dom";
import { RegisterForm } from "@/components/auth/RegisterForm";

export function Register() {
  return (
    <div className="mx-auto max-w-md">
      <h1 className="mb-6 text-2xl font-bold text-gray-900">Create account</h1>
      <RegisterForm />
      <p className="mt-4 text-center text-sm text-gray-600">
        Already have an account?{" "}
        <Link to="/login" className="text-blue-600 hover:underline">Sign in</Link>
      </p>
    </div>
  );
}
`;
}

function getDashboardPage(_pkg: Packages): string {
  return `import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Spinner } from "@/components/ui/Spinner";

export function Dashboard() {
  const { user, loading, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      navigate("/login");
    }
  }, [loading, isAuthenticated, navigate]);

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Spinner className="h-8 w-8" />
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
      <p className="mt-2 text-gray-600">Welcome back, {user?.name}!</p>
      <div className="mt-6 rounded-lg border border-gray-200 bg-white p-6">
        <dl className="space-y-3 text-sm">
          <div className="flex justify-between">
            <dt className="text-gray-500">Email</dt>
            <dd className="font-medium">{user?.email}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-gray-500">Role</dt>
            <dd className="font-medium capitalize">{user?.role}</dd>
          </div>
        </dl>
      </div>
    </div>
  );
}
`;
}

function getNotFoundPage(_pkg: Packages): string {
  return `import { Link } from "react-router-dom";
import { Button } from "@/components/ui/Button";

export function NotFound() {
  return (
    <div className="py-20 text-center">
      <h1 className="text-6xl font-bold text-gray-300">404</h1>
      <p className="mt-4 text-lg text-gray-600">Page not found</p>
      <Link to="/" className="mt-6 inline-block">
        <Button>Go Home</Button>
      </Link>
    </div>
  );
}
`;
}
