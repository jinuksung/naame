import { cp, mkdir, rm, stat, copyFile } from "node:fs/promises";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";

const rootDir = process.cwd();
const outputDir = path.join(rootDir, "dist-appintos");
const nextAppDir = path.join(rootDir, ".next", "server", "app");
const nextStaticDir = path.join(rootDir, ".next", "static");
const publicDir = path.join(rootDir, "public");

function stripWrappingQuotes(value) {
  if (
    (value.startsWith('"') && value.endsWith('"')) ||
    (value.startsWith("'") && value.endsWith("'"))
  ) {
    return value.slice(1, -1);
  }
  return value;
}

function readEnvVarFromFile(filePath, key) {
  if (!existsSync(filePath)) {
    return "";
  }

  const raw = readFileSync(filePath, "utf8");
  for (const line of raw.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) {
      continue;
    }
    const separator = trimmed.indexOf("=");
    if (separator <= 0) {
      continue;
    }
    const name = trimmed.slice(0, separator).trim();
    if (name !== key) {
      continue;
    }
    const value = trimmed.slice(separator + 1).trim();
    return stripWrappingQuotes(value);
  }
  return "";
}

function ensureApiBaseUrlEnv() {
  const key = "NEXT_PUBLIC_NAMEFIT_API_BASE_URL";
  const existing = process.env[key]?.trim();
  if (existing) {
    return existing;
  }

  const envCandidates = [
    ".env.production.local",
    ".env.local",
    ".env.production",
    ".env",
  ];

  for (const relativePath of envCandidates) {
    const fromFile = readEnvVarFromFile(path.join(rootDir, relativePath), key);
    if (fromFile) {
      process.env[key] = fromFile;
      return fromFile;
    }
  }

  return "";
}

const requiredApiBaseUrl = ensureApiBaseUrlEnv();
if (!requiredApiBaseUrl) {
  throw new Error(
    "NEXT_PUBLIC_NAMEFIT_API_BASE_URL is required for appintos static build. " +
      "Set it to your production API host before running build:appintos.",
  );
}

const routeSourceMap = [
  { source: "index.html", route: "/" },
  { source: "loading.html", route: "/loading" },
  { source: "result.html", route: "/result" },
  { source: path.join("feature", "recommend.html"), route: "/feature/recommend" },
  { source: path.join("feature", "result.html"), route: "/feature/result" },
];

function ensureRouteTargets(routePath) {
  if (routePath === "/") {
    return [path.join(outputDir, "index.html")];
  }
  const normalized = routePath.replace(/^\/+/, "");
  return [
    path.join(outputDir, normalized, "index.html"),
    path.join(outputDir, `${normalized}.html`),
  ];
}

async function copyRouteHtml(sourceRelativePath, routePath) {
  const sourcePath = path.join(nextAppDir, sourceRelativePath);
  const targets = ensureRouteTargets(routePath);
  for (const targetPath of targets) {
    await mkdir(path.dirname(targetPath), { recursive: true });
    await copyFile(sourcePath, targetPath);
  }
}

async function pathExists(filePath) {
  try {
    await stat(filePath);
    return true;
  } catch {
    return false;
  }
}

async function main() {
  execSync("next build", {
    cwd: rootDir,
    stdio: "inherit",
    env: process.env,
  });

  await rm(outputDir, { recursive: true, force: true });
  await mkdir(outputDir, { recursive: true });

  for (const entry of routeSourceMap) {
    await copyRouteHtml(entry.source, entry.route);
  }

  const notFoundPath = path.join(nextAppDir, "_not-found.html");
  if (await pathExists(notFoundPath)) {
    await copyFile(notFoundPath, path.join(outputDir, "404.html"));
  }

  await mkdir(path.join(outputDir, "_next"), { recursive: true });
  await cp(nextStaticDir, path.join(outputDir, "_next", "static"), {
    recursive: true,
  });

  if (await pathExists(publicDir)) {
    await cp(publicDir, outputDir, { recursive: true });
  }
}

void main();
