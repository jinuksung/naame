import { access } from "node:fs/promises";
import { resolve } from "node:path";
import { loadHanjaDataset } from "./data/loadHanjaDataset";
import { recommendNames } from "./engine/recommend";
import type { RecommendRequest, RecommendationItem } from "./types";

interface CliArgs {
  dataPath: string;
  surnameHangul: string;
  surnameHanja?: string;
  gender: "MALE" | "FEMALE" | "ANY";
  date: string;
  time?: string;
  limit: number;
  debug: boolean;
}

function parseArgMap(argv: string[]): Map<string, string> {
  const map = new Map<string, string>();
  for (let i = 0; i < argv.length; i += 1) {
    const token = argv[i];
    if (!token.startsWith("--")) {
      continue;
    }
    if (token.includes("=")) {
      const [key, value] = token.split("=", 2);
      map.set(key, value);
      continue;
    }
    const next = argv[i + 1];
    if (next && !next.startsWith("--")) {
      map.set(token, next);
      i += 1;
      continue;
    }
    map.set(token, "true");
  }
  return map;
}

function parseBoolean(value: string | undefined, fallback: boolean): boolean {
  if (value === undefined) {
    return fallback;
  }
  const normalized = value.trim().toLowerCase();
  if (normalized === "1" || normalized === "true" || normalized === "yes") {
    return true;
  }
  if (normalized === "0" || normalized === "false" || normalized === "no") {
    return false;
  }
  return fallback;
}

function parseNumber(value: string | undefined, fallback: number): number {
  if (!value) {
    return fallback;
  }
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) {
    return fallback;
  }
  return Math.max(1, Math.floor(parsed));
}

function parseGender(value: string | undefined): "MALE" | "FEMALE" | "ANY" {
  const normalized = (value ?? "MALE").trim().toUpperCase();
  if (normalized === "MALE" || normalized === "FEMALE" || normalized === "ANY") {
    return normalized;
  }
  return "MALE";
}

async function fileExists(filePath: string): Promise<boolean> {
  try {
    await access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function resolveDataPath(value: string): Promise<string> {
  const cwd = process.cwd();
  const candidates = [
    resolve(cwd, value),
    resolve(cwd, "..", value),
    resolve(cwd, "../..", value),
    resolve(cwd, "../../..", value)
  ];
  for (const candidate of candidates) {
    if (await fileExists(candidate)) {
      return candidate;
    }
  }
  throw new Error(`data file not found: ${value}`);
}

function parseArgs(argv: string[]): CliArgs {
  const argMap = parseArgMap(argv);
  const debug = parseBoolean(argMap.get("--debug"), false);
  const requestedLimit = parseNumber(argMap.get("--limit"), 10);

  return {
    dataPath: argMap.get("--data") ?? process.env.DATA_SOURCE_PATH ?? "hanname_master.jsonl",
    surnameHangul: argMap.get("--surnameHangul") ?? "김",
    surnameHanja: argMap.get("--surnameHanja") ?? "金",
    gender: parseGender(argMap.get("--gender")),
    date: argMap.get("--date") ?? "2025-08-05",
    time: argMap.get("--time"),
    limit: debug ? Math.max(requestedLimit, 30) : requestedLimit,
    debug
  };
}

function formatDebugTable(items: RecommendationItem[], limit: number): string {
  const head =
    "name | tier | engineScore01 | poolScore01 | tierBonus01 | finalScore01";
  const rows = items.slice(0, limit).map((item) => {
    const d = item.debug?.softPrior;
    if (!d) {
      return `${item.nameHangul} | None | - | - | - | -`;
    }
    return [
      item.nameHangul,
      d.tier,
      d.engineScore01.toFixed(4),
      d.poolScore01.toFixed(4),
      d.tierBonus01.toFixed(4),
      d.finalScore01.toFixed(4)
    ].join(" | ");
  });
  return [head, ...rows].join("\n");
}

async function main(): Promise<void> {
  const args = parseArgs(process.argv.slice(2));
  if (args.debug) {
    process.env.POOL_RERANK_DEBUG = "1";
  }

  const dataPath = await resolveDataPath(args.dataPath);
  const dataset = await loadHanjaDataset(dataPath);
  const request: RecommendRequest = {
    surnameHangul: args.surnameHangul,
    surnameHanja: args.surnameHanja,
    birth: {
      calendar: "SOLAR",
      date: args.date,
      time: args.time,
      timezone: "Asia/Seoul"
    },
    gender: args.gender,
    limit: args.limit
  };

  const result = recommendNames(dataset, request);
  console.info(
    `[cli] generated ${result.recommendations.length} recommendations for ${request.surnameHangul}`
  );

  if (args.debug) {
    console.info(`[cli][top30]\n${formatDebugTable(result.recommendations, 30)}`);
    console.info(`[cli][top10]\n${formatDebugTable(result.recommendations, 10)}`);
  }

  console.info(
    "[cli][example] npm run recommend:cli --workspace @namefit/engine -- --surnameHangul 성 --surnameHanja 成 --gender MALE --date 2025-08-05 --time 09:30 --limit 10 --debug=true"
  );
}

void main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error(`[cli] failed: ${message}`);
  process.exitCode = 1;
});
