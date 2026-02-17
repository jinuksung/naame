import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { pathToFileURL } from "node:url";

const rootDir = process.cwd();
const API_KEY_ENV_CANDIDATES = ["APPS_IN_TOSS_API_KEY", "AIT_API_KEY"];
const ENV_FILE_CANDIDATES = [
  ".env.production.local",
  ".env.local",
  ".env.production",
  ".env",
];

function stripWrappingQuotes(value) {
  if (
    (value.startsWith('"') && value.endsWith('"')) ||
    (value.startsWith("'") && value.endsWith("'"))
  ) {
    return value.slice(1, -1);
  }
  return value;
}

function parseNamedValueFromEnvText(envFileText, key) {
  for (const rawLine of envFileText.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) {
      continue;
    }
    const separatorIndex = line.indexOf("=");
    if (separatorIndex <= 0) {
      continue;
    }
    const name = line.slice(0, separatorIndex).trim();
    if (name !== key) {
      continue;
    }
    return stripWrappingQuotes(line.slice(separatorIndex + 1).trim());
  }
  return "";
}

function parseLegacyBareTokenLine(envFileText) {
  const lines = envFileText
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith("#"));
  for (let i = lines.length - 1; i >= 0; i -= 1) {
    const line = lines[i];
    if (!line.includes("=")) {
      return stripWrappingQuotes(line);
    }
  }
  return "";
}

export function resolveAitApiKey({
  env = process.env,
  envFileText = "",
} = {}) {
  for (const key of API_KEY_ENV_CANDIDATES) {
    const value = env[key]?.trim();
    if (value) {
      return value;
    }
  }

  if (envFileText) {
    for (const key of API_KEY_ENV_CANDIDATES) {
      const namedValue = parseNamedValueFromEnvText(envFileText, key);
      if (namedValue) {
        return namedValue;
      }
    }
    return parseLegacyBareTokenLine(envFileText);
  }

  for (const fileName of ENV_FILE_CANDIDATES) {
    const filePath = path.join(rootDir, fileName);
    if (!existsSync(filePath)) {
      continue;
    }
    const text = readFileSync(filePath, "utf8");
    const resolved = resolveAitApiKey({ env: {}, envFileText: text });
    if (resolved) {
      return resolved;
    }
  }

  return "";
}

function runDeploy(apiKey) {
  const result = spawnSync("npx", ["ait", "deploy", "--api-key", apiKey], {
    cwd: rootDir,
    stdio: "inherit",
    env: process.env,
  });

  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

function main() {
  const apiKey = resolveAitApiKey();
  if (!apiKey) {
    throw new Error(
      "Apps in Toss API key is missing. Set APPS_IN_TOSS_API_KEY (recommended) or AIT_API_KEY in env or env files.",
    );
  }
  runDeploy(apiKey);
}

const isDirectRun = Boolean(
  process.argv[1] && pathToFileURL(process.argv[1]).href === import.meta.url,
);

if (isDirectRun) {
  main();
}

