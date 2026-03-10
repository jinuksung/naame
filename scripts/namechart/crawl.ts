import { mkdir, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { parseNamechartChartPage, type NamechartChartRow } from "./parse";

type GenderArg = "m" | "f" | "t" | "both";
type CrawlGender = "m" | "f" | "t";

interface CliOptions {
  gender: GenderArg;
  maxPages: number | null;
  delayMs: number;
  outDir: string;
}

interface CrawledChartRow extends NamechartChartRow {
  page: number;
  pageGender: "M" | "F" | "T";
}

interface ChartPayload {
  meta: {
    source: string;
    crawledAt: string;
    gender: "M" | "F" | "T";
    pageCount: number;
    rowCount: number;
    maxPagesApplied: number | null;
  };
  items: CrawledChartRow[];
}

const BASE_URL = "https://namechart.kr";
const DEFAULT_OUT_DIR = "out/namechart";
const DEFAULT_DELAY_MS = 250;
const USER_AGENT =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 14_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36";

function sleep(ms: number): Promise<void> {
  return new Promise((resolveSleep) => setTimeout(resolveSleep, ms));
}

function parseIntArg(value: string, name: string): number {
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed < 0) {
    throw new Error(`Invalid ${name}: ${value}`);
  }
  return parsed;
}

function parseArgs(argv: string[]): CliOptions {
  const options: CliOptions = {
    gender: "both",
    maxPages: null,
    delayMs: DEFAULT_DELAY_MS,
    outDir: DEFAULT_OUT_DIR
  };

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === "--gender") {
      const value = argv[++i];
      if (value !== "m" && value !== "f" && value !== "t" && value !== "both") {
        throw new Error(`--gender must be one of: m, f, t, both (received: ${value ?? ""})`);
      }
      options.gender = value;
      continue;
    }
    if (arg === "--max-pages") {
      const value = argv[++i];
      if (value == null) throw new Error("--max-pages requires a value");
      options.maxPages = parseIntArg(value, "--max-pages");
      continue;
    }
    if (arg === "--delay-ms") {
      const value = argv[++i];
      if (value == null) throw new Error("--delay-ms requires a value");
      options.delayMs = parseIntArg(value, "--delay-ms");
      continue;
    }
    if (arg === "--out-dir") {
      const value = argv[++i];
      if (!value?.trim()) throw new Error("--out-dir requires a value");
      options.outDir = value;
      continue;
    }
    if (arg === "--help" || arg === "-h") {
      printHelp();
      process.exit(0);
    }
    throw new Error(`Unknown argument: ${arg}`);
  }

  return options;
}

function printHelp(): void {
  console.log(`Usage: npx ts-node -P tsconfig.scripts.json scripts/namechart/crawl.ts [options]

Options:
  --gender m|f|t|both   Crawl target gender bucket (default: both)
  --max-pages N         Limit pages per gender (default: no limit)
  --delay-ms N          Delay between page requests (default: ${DEFAULT_DELAY_MS})
  --out-dir PATH        Output directory (default: ${DEFAULT_OUT_DIR})
  -h, --help            Show this help
`);
}

function getGenderLabel(gender: CrawlGender): "M" | "F" | "T" {
  if (gender === "m") return "M";
  if (gender === "f") return "F";
  return "T";
}

function normalizeNextPath(nextPath: string | null): string | null {
  if (!nextPath) return null;
  if (nextPath.startsWith("http://") || nextPath.startsWith("https://")) {
    const url = new URL(nextPath);
    return `${url.pathname}${url.search}`;
  }
  if (nextPath.startsWith("/")) return nextPath;
  return `/${nextPath.replace(/^\/+/, "")}`;
}

function describeError(error: unknown): string {
  if (!(error instanceof Error)) return String(error);
  const cause = (error as Error & { cause?: unknown }).cause;
  const causeMessage =
    cause instanceof Error ? cause.message : cause != null ? String(cause) : null;
  return causeMessage ? `${error.message} (cause: ${causeMessage})` : error.message;
}

async function fetchHtml(path: string): Promise<string> {
  const url = new URL(path, BASE_URL).toString();
  let lastError: unknown = null;

  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const response = await fetch(url, {
        headers: {
          "user-agent": USER_AGENT,
          "accept-language": "ko-KR,ko;q=0.9,en;q=0.8"
        }
      });
      if (!response.ok) {
        throw new Error(`Request failed (${response.status}) for ${url}`);
      }
      return await response.text();
    } catch (error) {
      lastError = error;
      if (attempt >= 3) break;
      console.warn(`[namechart] fetch retry ${attempt}/3 for ${url}: ${describeError(error)}`);
      await sleep(250 * attempt);
    }
  }

  throw new Error(`Failed to fetch ${url}: ${describeError(lastError)}`);
}

async function crawlChartForGender(gender: CrawlGender, options: CliOptions): Promise<ChartPayload> {
  const crawledAt = new Date().toISOString();
  const items: CrawledChartRow[] = [];
  const visited = new Set<string>();
  const seenPageSignatures = new Set<string>();
  let previousPageMinRank: number | null = null;

  let path: string | null = `/chart/all?gender=${gender}&page=1`;
  let pageCount = 0;

  while (path) {
    if (options.maxPages != null && pageCount >= options.maxPages) {
      break;
    }
    if (visited.has(path)) {
      throw new Error(`Pagination loop detected for gender=${gender} path=${path}`);
    }
    visited.add(path);

    pageCount += 1;
    if (pageCount === 1 || pageCount % 25 === 0) {
      console.log(`[namechart] fetching gender=${gender} page=${pageCount} path=${path}`);
    }
    const html = await fetchHtml(path);
    const parsed = parseNamechartChartPage(html);

    if (parsed.rows.length === 0) {
      if (pageCount > 1) {
        pageCount -= 1;
        console.log(`[namechart] reached terminal empty page for gender=${gender} path=${path}`);
        break;
      }
      throw new Error(`No rows parsed for gender=${gender} path=${path}`);
    }

    const sortedRowsForChecks = [...parsed.rows].sort((a, b) => {
      if (a.rank !== b.rank) return a.rank - b.rank;
      if (a.totalBirths !== b.totalBirths) return a.totalBirths - b.totalBirths;
      return a.name.localeCompare(b.name, "ko");
    });
    const minRow = sortedRowsForChecks[0];
    const pageSignature = sortedRowsForChecks
      .map((row) => `${row.rank}|${row.name}|${row.totalBirths}`)
      .join("||");

    if (seenPageSignatures.has(pageSignature)) {
      pageCount -= 1;
      console.log(`[namechart] detected repeated page signature for gender=${gender}; stopping`);
      break;
    }
    if (previousPageMinRank != null && minRow.rank < previousPageMinRank) {
      pageCount -= 1;
      console.log(
        `[namechart] detected pagination reset for gender=${gender} (${minRow.rank} < ${previousPageMinRank}); stopping`
      );
      break;
    }
    seenPageSignatures.add(pageSignature);
    previousPageMinRank = minRow.rank;

    const pageRows = parsed.rows.map((row) => ({
      ...row,
      page: pageCount,
      pageGender: getGenderLabel(gender)
    }));
    items.push(...pageRows);

    path = normalizeNextPath(parsed.nextPath);
    if (path && options.delayMs > 0) {
      await sleep(options.delayMs);
    }
  }

  items.sort((a, b) => a.rank - b.rank);

  const uniqueRankCount = new Set(items.map((item) => item.rank)).size;
  if (uniqueRankCount !== items.length) {
    console.warn(
      `[namechart] warning: duplicate ranks detected for gender=${gender} (rows=${items.length}, uniqueRanks=${uniqueRankCount})`
    );
  }

  return {
    meta: {
      source: `${BASE_URL}/chart/all`,
      crawledAt,
      gender: getGenderLabel(gender),
      pageCount,
      rowCount: items.length,
      maxPagesApplied: options.maxPages
    },
    items
  };
}

async function writeJson(path: string, value: unknown): Promise<void> {
  await writeFile(path, `${JSON.stringify(value, null, 2)}\n`, "utf8");
}

async function main(): Promise<void> {
  const options = parseArgs(process.argv.slice(2));
  const targetGenders: CrawlGender[] = options.gender === "both" ? ["m", "f"] : [options.gender];

  const outDir = resolve(options.outDir);
  await mkdir(outDir, { recursive: true });

  const results: Partial<Record<CrawlGender, ChartPayload>> = {};
  for (const gender of targetGenders) {
    results[gender] = await crawlChartForGender(gender, options);
  }

  if (results.m) {
    const path = resolve(outDir, "namechart_chart_m.json");
    await writeJson(path, results.m);
    console.log(`[namechart] wrote ${path} (${results.m.meta.rowCount} rows)`);
  }
  if (results.f) {
    const path = resolve(outDir, "namechart_chart_f.json");
    await writeJson(path, results.f);
    console.log(`[namechart] wrote ${path} (${results.f.meta.rowCount} rows)`);
  }
  if (results.t) {
    const path = resolve(outDir, "namechart_chart_t.json");
    await writeJson(path, results.t);
    console.log(`[namechart] wrote ${path} (${results.t.meta.rowCount} rows)`);
  }

  if (results.m && results.f) {
    const combined = {
      meta: {
        source: `${BASE_URL}/chart/all`,
        crawledAt: new Date().toISOString(),
        genders: ["M", "F"] as const,
        rowCount: results.m.items.length + results.f.items.length
      },
      male: results.m,
      female: results.f
    };
    const path = resolve(outDir, "namechart_chart_all.json");
    await writeJson(path, combined);
    console.log(`[namechart] wrote ${path} (${combined.meta.rowCount} rows)`);
  }
}

main().catch((error) => {
  console.error(`[namechart] ${describeError(error)}`);
  process.exit(1);
});
