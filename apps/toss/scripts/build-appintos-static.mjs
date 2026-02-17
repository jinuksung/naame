import { cp, mkdir, rm, stat, copyFile } from "node:fs/promises";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";
import { pathToFileURL } from "node:url";

const rootDir = process.cwd();
const outputDir = path.join(rootDir, "dist-appintos");
const nextAppDir = path.join(rootDir, ".next", "server", "app");
const nextStaticDir = path.join(rootDir, ".next", "static");
const publicDir = path.join(rootDir, "public");
const DEV_SERVER_COMMAND_PATTERNS = [
  "/node_modules/.bin/granite dev",
  "/node_modules/.bin/next dev",
];

function normalizeProcessText(value) {
  return value.replace(/\\/g, "/").toLowerCase();
}

function resolveProcessScopePaths(projectRootDir) {
  const resolved = path.resolve(projectRootDir);
  return Array.from(
    new Set([
      normalizeProcessText(resolved),
      normalizeProcessText(path.resolve(resolved, "..")),
      normalizeProcessText(path.resolve(resolved, "..", "..")),
    ]),
  );
}

export function detectConflictingDevProcesses(processListText, projectRootDir = rootDir) {
  const scopePaths = resolveProcessScopePaths(projectRootDir);
  const lines = processListText.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);

  return lines.filter((line) => {
    const normalized = normalizeProcessText(line);
    const matchesDevCommand = DEV_SERVER_COMMAND_PATTERNS.some((pattern) =>
      normalized.includes(pattern),
    );
    if (!matchesDevCommand) {
      return false;
    }
    return scopePaths.some((scopePath) =>
      normalized.includes(`${scopePath}/node_modules/.bin/`),
    );
  });
}

function getProcessListText() {
  try {
    return execSync("ps -A -o pid=,command=", {
      cwd: rootDir,
      stdio: ["ignore", "pipe", "ignore"],
      encoding: "utf8",
      env: process.env,
    });
  } catch {
    return "";
  }
}

export function assertNoConflictingDevProcesses(
  projectRootDir = rootDir,
  processListProvider = getProcessListText,
) {
  const processListText = processListProvider();
  if (!processListText) {
    return;
  }

  const conflicts = detectConflictingDevProcesses(processListText, projectRootDir);
  if (conflicts.length === 0) {
    return;
  }

  throw new Error(
    [
      "Stop dev server before build:appintoss.",
      "Detected running Toss dev process(es):",
      ...conflicts.map((line) => `- ${line}`),
      "Run: kill $(ps aux | grep \"granite dev\\|next dev -p 3000\" | grep -v grep | awk '{print $2}')",
    ].join("\n"),
  );
}

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

function assertApiBaseUrlEnv() {
  const requiredApiBaseUrl = ensureApiBaseUrlEnv();
  if (requiredApiBaseUrl) {
    return;
  }
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

export async function resetNextBuildDir(projectRootDir = rootDir) {
  await rm(path.join(projectRootDir, ".next"), { recursive: true, force: true });
}

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
  assertNoConflictingDevProcesses(rootDir);
  assertApiBaseUrlEnv();
  await resetNextBuildDir(rootDir);

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

const isDirectRun = Boolean(
  process.argv[1] && pathToFileURL(process.argv[1]).href === import.meta.url,
);

if (isDirectRun) {
  void main();
}
