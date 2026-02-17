import { access, mkdir, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";

interface SupabaseSsotTableRow {
  row_index?: unknown;
  [key: string]: unknown;
}

type SsotFormat = "jsonl" | "name_pool_json";

interface SsotDatasetSpec {
  dataset: string;
  table: string;
  path: string;
  format: SsotFormat;
}

interface JsonColumnKey {
  jsonKey: string;
  column: string;
}

export interface EnsureSupabaseSsotSnapshotOptions {
  cacheDir?: string;
  forceRefresh?: boolean;
  requiredPaths?: string[];
}

export type SupabaseSsotSource = "disabled" | "supabase" | "cache" | "fallback";

export interface SupabaseSsotSnapshotResult {
  enabled: boolean;
  source: SupabaseSsotSource;
  cacheDir: string | null;
  writtenFiles: string[];
  versionSignature: string | null;
}

const DEFAULT_SSOT_DATASET_SPECS: SsotDatasetSpec[] = [
  { dataset: "hanname_master", table: "ssot_hanname_master", path: "hanname_master.jsonl", format: "jsonl" },
  { dataset: "surname_map", table: "ssot_surname_map", path: "surname_map.jsonl", format: "jsonl" },
  { dataset: "hanja_tags", table: "ssot_hanja_tags", path: "hanja_tags.jsonl", format: "jsonl" },
  { dataset: "blacklist_words", table: "ssot_blacklist_words", path: "blacklist_words.jsonl", format: "jsonl" },
  {
    dataset: "blacklist_initials",
    table: "ssot_blacklist_initials",
    path: "blacklist_initials.jsonl",
    format: "jsonl",
  },
  { dataset: "name_pool_M", table: "ssot_name_pool_m", path: "name_pool_M.json", format: "name_pool_json" },
  { dataset: "name_pool_F", table: "ssot_name_pool_f", path: "name_pool_F.json", format: "name_pool_json" },
  {
    dataset: "hanname_master_conflicts",
    table: "ssot_hanname_master_conflicts",
    path: "hanname_master_conflicts.jsonl",
    format: "jsonl",
  },
  { dataset: "hanname_metrics", table: "ssot_hanname_metrics", path: "hanname_metrics.jsonl", format: "jsonl" },
];

const DEFAULT_RUNTIME_SSOT_FILE_PATHS = [
  "hanname_master.jsonl",
  "surname_map.jsonl",
  "hanja_tags.jsonl",
  "blacklist_words.jsonl",
  "name_pool_M.json",
  "name_pool_F.json",
] as const;

const JSONL_KEY_MAPS: Record<string, JsonColumnKey[]> = {
  hanname_master: [
    { jsonKey: "char", column: "char" },
    { jsonKey: "isInmyong", column: "is_inmyong" },
    { jsonKey: "meanings", column: "meanings" },
    { jsonKey: "detailUrl", column: "detail_url" },
    { jsonKey: "source", column: "source" },
    { jsonKey: "fetchedAt", column: "fetched_at" },
    { jsonKey: "readings", column: "readings" },
    { jsonKey: "readingInitials", column: "reading_initials" },
    { jsonKey: "radicalLabel", column: "radical_label" },
    { jsonKey: "radicalChar", column: "radical_char" },
    { jsonKey: "strokes", column: "strokes" },
    { jsonKey: "elementPronunciation", column: "element_pronunciation" },
    { jsonKey: "elementResource", column: "element_resource" },
    { jsonKey: "readingE", column: "reading_e" },
    { jsonKey: "readingC", column: "reading_c" },
  ],
  surname_map: [
    { jsonKey: "surnameReading", column: "surname_reading" },
    { jsonKey: "hanja", column: "hanja" },
    { jsonKey: "isDefault", column: "is_default" },
    { jsonKey: "popularityRank", column: "popularity_rank" },
  ],
  hanja_tags: [
    { jsonKey: "char", column: "char" },
    { jsonKey: "tags", column: "tags" },
    { jsonKey: "tagScores", column: "tag_scores" },
    { jsonKey: "evidence", column: "evidence" },
    { jsonKey: "riskFlags", column: "risk_flags" },
    { jsonKey: "createdAt", column: "created_at" },
  ],
  blacklist_words: [{ jsonKey: "pattern", column: "pattern" }],
  blacklist_initials: [{ jsonKey: "pattern", column: "pattern" }],
  hanname_master_conflicts: [
    { jsonKey: "char", column: "char" },
    { jsonKey: "existing", column: "existing" },
    { jsonKey: "incoming", column: "incoming" },
    { jsonKey: "detectedAt", column: "detected_at" },
  ],
  hanname_metrics: [
    { jsonKey: "char", column: "char" },
    { jsonKey: "page", column: "page" },
    { jsonKey: "sourceUrl", column: "source_url" },
    { jsonKey: "checkedAt", column: "checked_at" },
    { jsonKey: "usageCount", column: "usage_count" },
    { jsonKey: "readingLevel", column: "reading_level" },
    { jsonKey: "writingLevel", column: "writing_level" },
    { jsonKey: "warnings", column: "warnings" },
  ],
};

const NAME_POOL_COLUMNS = [
  "row_index",
  "generated_at",
  "input",
  "gender",
  "total_count",
  "name",
  "tier",
  "score",
  "score_breakdown",
  "features",
];

const ENV_PATH_MAP: Record<string, string> = {
  "hanname_master.jsonl": "DATA_SOURCE_PATH",
  "surname_map.jsonl": "SURNAME_MAP_PATH",
  "hanja_tags.jsonl": "HANJA_TAGS_PATH",
  "blacklist_words.jsonl": "BLACKLIST_WORDS_PATH",
  "blacklist_initials.jsonl": "BLACKLIST_INITIALS_PATH",
  "name_pool_M.json": "NAME_POOL_M_PATH",
  "name_pool_F.json": "NAME_POOL_F_PATH",
};

let snapshotPromise: Promise<SupabaseSsotSnapshotResult> | null = null;
let snapshotCacheKey: string | null = null;
const snapshotVersionByCacheKey = new Map<string, string>();
const snapshotVersionCheckedAtByCacheKey = new Map<string, number>();

function parseBoolean(value: string | undefined, fallback: boolean): boolean {
  if (value == null) {
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

function parsePositiveInteger(value: string | undefined, fallback: number): number {
  if (value == null) {
    return fallback;
  }
  const parsed = Number(value.trim());
  if (!Number.isFinite(parsed) || parsed < 0) {
    return fallback;
  }
  return Math.floor(parsed);
}

function defaultCacheDirRaw(env: NodeJS.ProcessEnv = process.env): string {
  const vercelEnabled = (env.VERCEL ?? "").trim().length > 0;
  const lambdaEnabled = (env.AWS_LAMBDA_FUNCTION_NAME ?? "").trim().length > 0;
  if (vercelEnabled || lambdaEnabled) {
    const tmpBase = (env.TMPDIR ?? "").trim() || "/tmp";
    return `${tmpBase.replace(/\/+$/, "")}/ssot`;
  }
  return ".cache/ssot";
}

function getVersionCheckIntervalMs(): number {
  return parsePositiveInteger(process.env.SUPABASE_SSOT_VERSION_CHECK_INTERVAL_MS, 3000);
}

function isVersionCheckEnabled(): boolean {
  return parseBoolean(process.env.SUPABASE_SSOT_VERSION_CHECK_ENABLED, true);
}

function uniquePaths(paths: string[]): string[] {
  return Array.from(new Set(paths.map((item) => item.trim()).filter((item) => item.length > 0)));
}

async function fileExists(path: string): Promise<boolean> {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
}

function resolveCacheDir(override?: string): string {
  const raw = override?.trim() || process.env.SUPABASE_SSOT_CACHE_DIR?.trim() || defaultCacheDirRaw();
  return resolve(process.cwd(), raw);
}

function buildAbsolutePath(cacheDir: string, relativePath: string): string {
  return resolve(cacheDir, relativePath);
}

function setEnvPathIfMissing(key: string, absolutePath: string): void {
  const existing = process.env[key]?.trim();
  if (existing) {
    return;
  }
  process.env[key] = absolutePath;
}

function applyEngineEnvPaths(cacheDir: string, requiredPaths: string[]): void {
  for (const path of requiredPaths) {
    const envKey = ENV_PATH_MAP[path];
    if (!envKey) {
      continue;
    }
    setEnvPathIfMissing(envKey, buildAbsolutePath(cacheDir, path));
  }
}

function resolveSupabaseConfig(): { baseUrl: string; serviceRoleKey: string } {
  const baseUrl = process.env.SUPABASE_URL?.trim() ?? "";
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim() ?? "";
  if (!baseUrl || !serviceRoleKey) {
    throw new Error("SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY is missing");
  }

  return {
    baseUrl: baseUrl.replace(/\/+$/, ""),
    serviceRoleKey,
  };
}

function isObject(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function parseRowIndex(value: unknown): number | null {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return null;
  }
  const normalized = Math.floor(value);
  if (normalized < 0) {
    return null;
  }
  return normalized;
}

function ensureJsonlKeyMap(spec: SsotDatasetSpec): JsonColumnKey[] {
  const map = JSONL_KEY_MAPS[spec.dataset];
  if (!map) {
    throw new Error(`[supabase-ssot] unsupported jsonl dataset: ${spec.dataset}`);
  }
  return map;
}

function selectColumnsForSpec(spec: SsotDatasetSpec): string {
  if (spec.format === "name_pool_json") {
    return [...NAME_POOL_COLUMNS, "updated_at"].join(",");
  }

  const columns = ensureJsonlKeyMap(spec).map((item) => item.column);
  return ["row_index", "updated_at", ...columns].join(",");
}

function toTableRows(payload: unknown): Array<Record<string, unknown>> {
  if (!Array.isArray(payload)) {
    return [];
  }

  const out: Array<Record<string, unknown>> = [];
  for (const raw of payload as SupabaseSsotTableRow[]) {
    if (!isObject(raw)) {
      continue;
    }

    const rowIndex = parseRowIndex(raw.row_index);
    if (rowIndex == null) {
      continue;
    }

    const row: Record<string, unknown> = { row_index: rowIndex };
    for (const [key, value] of Object.entries(raw)) {
      if (key === "row_index") {
        continue;
      }
      row[key] = value;
    }

    out.push(row);
  }

  return out.sort((a, b) => Number(a.row_index) - Number(b.row_index));
}

function buildJsonlContent(spec: SsotDatasetSpec, rows: Array<Record<string, unknown>>): string {
  const keyMap = ensureJsonlKeyMap(spec);
  return rows
    .map((row) => {
      const out: Record<string, unknown> = {};
      for (const { jsonKey, column } of keyMap) {
        const value = row[column];
        if (value !== undefined && value !== null) {
          out[jsonKey] = value;
        }
      }
      return JSON.stringify(out);
    })
    .join("\n");
}

function buildNamePoolContent(rows: Array<Record<string, unknown>>): string {
  let generatedAt: string | undefined;
  let input: string | undefined;
  let gender: string | undefined;
  let totalCount: number | undefined;
  const items: Record<string, unknown>[] = [];

  for (const row of rows) {
    if (generatedAt === undefined && typeof row.generated_at === "string") {
      generatedAt = row.generated_at;
    }
    if (input === undefined && typeof row.input === "string") {
      input = row.input;
    }
    if (gender === undefined && typeof row.gender === "string") {
      gender = row.gender;
    }
    if (totalCount === undefined && typeof row.total_count === "number") {
      totalCount = row.total_count;
    }

    if (typeof row.name !== "string" || row.name.length === 0) {
      continue;
    }

    const item: Record<string, unknown> = { name: row.name };
    if (row.tier != null) {
      item.tier = row.tier;
    }
    if (row.score != null) {
      item.score = row.score;
    }
    if (row.score_breakdown != null) {
      item.scoreBreakdown = row.score_breakdown;
    }
    if (row.features != null) {
      item.features = row.features;
    }
    items.push(item);
  }

  const out: Record<string, unknown> = {
    generatedAt: generatedAt ?? null,
    input: input ?? null,
    gender: gender ?? null,
    count: typeof totalCount === "number" ? totalCount : items.length,
    items,
  };

  return `${JSON.stringify(out, null, 2)}\n`;
}

function buildSpecsByPath(): Map<string, SsotDatasetSpec> {
  const map = new Map<string, SsotDatasetSpec>();
  for (const spec of DEFAULT_SSOT_DATASET_SPECS) {
    map.set(spec.path, spec);
  }
  return map;
}

function resolveRequiredSpecs(requiredPaths: string[]): SsotDatasetSpec[] {
  const byPath = buildSpecsByPath();
  const out: SsotDatasetSpec[] = [];
  for (const path of requiredPaths) {
    const spec = byPath.get(path);
    if (!spec) {
      throw new Error(`[supabase-ssot] unsupported required path: ${path}`);
    }
    out.push(spec);
  }
  return out;
}

async function fetchTableRows(
  config: { baseUrl: string; serviceRoleKey: string },
  spec: SsotDatasetSpec,
): Promise<Array<Record<string, unknown>>> {
  const pageSize = 1000;
  const select = encodeURIComponent(selectColumnsForSpec(spec));
  const allRows: Array<Record<string, unknown>> = [];
  let offset = 0;

  while (true) {
    const endpoint = `${config.baseUrl}/rest/v1/${spec.table}?select=${select}&order=row_index.asc&offset=${offset}&limit=${pageSize}`;
    const response = await fetch(endpoint, {
      method: "GET",
      headers: {
        apikey: config.serviceRoleKey,
        Authorization: `Bearer ${config.serviceRoleKey}`,
      },
    });

    if (!response.ok) {
      const body = await response.text();
      throw new Error(`[supabase-ssot] request failed table=${spec.table}: ${response.status} ${body}`);
    }

    const payload = (await response.json()) as unknown;
    const rows = toTableRows(payload);
    allRows.push(...rows);
    if (rows.length < pageSize) {
      break;
    }
    offset += pageSize;
  }

  return allRows;
}

function toVersionStamp(rows: Array<Record<string, unknown>>): string {
  if (rows.length === 0) {
    return "empty";
  }
  let maxUpdatedAt = "";
  let maxRowIndex = -1;
  for (const row of rows) {
    const updatedAt = typeof row.updated_at === "string" ? row.updated_at : "";
    if (updatedAt > maxUpdatedAt) {
      maxUpdatedAt = updatedAt;
    }
    const rowIndex = typeof row.row_index === "number" ? row.row_index : -1;
    if (rowIndex > maxRowIndex) {
      maxRowIndex = rowIndex;
    }
  }
  return `${rows.length}:${maxUpdatedAt}:${maxRowIndex}`;
}

function buildVersionSignature(parts: string[]): string {
  return parts.join("|");
}

async function fetchCurrentVersionSignature(requiredSpecs: SsotDatasetSpec[]): Promise<string> {
  const config = resolveSupabaseConfig();
  const parts: string[] = [];

  for (const spec of requiredSpecs) {
    const select = encodeURIComponent("updated_at,row_index");
    const endpoint = `${config.baseUrl}/rest/v1/${spec.table}?select=${select}&order=updated_at.desc.nullslast,row_index.desc&limit=1`;
    const response = await fetch(endpoint, {
      method: "GET",
      headers: {
        apikey: config.serviceRoleKey,
        Authorization: `Bearer ${config.serviceRoleKey}`,
      },
    });

    if (!response.ok) {
      const body = await response.text();
      throw new Error(`[supabase-ssot] version probe failed table=${spec.table}: ${response.status} ${body}`);
    }

    const payload = (await response.json()) as unknown;
    const rows = toTableRows(payload);
    parts.push(`${spec.table}:${toVersionStamp(rows)}`);
  }

  return buildVersionSignature(parts);
}

async function fetchSupabaseContentByPath(
  requiredSpecs: SsotDatasetSpec[],
): Promise<{ contentByPath: Map<string, string>; versionSignature: string }> {
  const config = resolveSupabaseConfig();
  const byPath = new Map<string, string>();
  const versionParts: string[] = [];

  for (const spec of requiredSpecs) {
    const rows = await fetchTableRows(config, spec);
    if (rows.length === 0) {
      throw new Error(`[supabase-ssot] missing table rows: ${spec.table}`);
    }

    versionParts.push(`${spec.table}:${toVersionStamp(rows)}`);
    const content = spec.format === "jsonl" ? buildJsonlContent(spec, rows) : buildNamePoolContent(rows);
    byPath.set(spec.path, content);
  }

  return {
    contentByPath: byPath,
    versionSignature: buildVersionSignature(versionParts),
  };
}

async function hasAllCachedFiles(cacheDir: string, requiredPaths: string[]): Promise<boolean> {
  for (const path of requiredPaths) {
    const exists = await fileExists(buildAbsolutePath(cacheDir, path));
    if (!exists) {
      return false;
    }
  }
  return true;
}

async function writeContentToCache(
  cacheDir: string,
  requiredPaths: string[],
  contentByPath: Map<string, string>,
): Promise<string[]> {
  const writtenFiles: string[] = [];

  for (const path of requiredPaths) {
    const content = contentByPath.get(path);
    if (content == null) {
      throw new Error(`[supabase-ssot] missing content for path: ${path}`);
    }

    const absolutePath = buildAbsolutePath(cacheDir, path);
    await mkdir(dirname(absolutePath), { recursive: true });
    await writeFile(absolutePath, content, "utf8");
    writtenFiles.push(absolutePath);
  }

  return writtenFiles;
}

export function getDefaultSupabaseSsotFilePaths(): string[] {
  return DEFAULT_SSOT_DATASET_SPECS.map((spec) => spec.path);
}

export function getDefaultRuntimeSupabaseSsotFilePaths(): string[] {
  return [...DEFAULT_RUNTIME_SSOT_FILE_PATHS];
}

export function isSupabaseSsotEnabled(env: NodeJS.ProcessEnv = process.env): boolean {
  if (parseBoolean(env.SUPABASE_SSOT_ENABLED, false)) {
    return true;
  }
  return (env.DATA_SOURCE ?? "").trim().toUpperCase() === "SUPABASE";
}

export function resetSupabaseSsotSnapshotStateForTests(): void {
  snapshotPromise = null;
  snapshotCacheKey = null;
  snapshotVersionByCacheKey.clear();
  snapshotVersionCheckedAtByCacheKey.clear();
}

async function shouldRefreshByVersionProbe(cacheKey: string, requiredPaths: string[]): Promise<boolean> {
  if (!isVersionCheckEnabled()) {
    return false;
  }

  const now = Date.now();
  const intervalMs = getVersionCheckIntervalMs();
  const lastCheckedAt = snapshotVersionCheckedAtByCacheKey.get(cacheKey) ?? 0;
  if (now - lastCheckedAt < intervalMs) {
    return false;
  }

  snapshotVersionCheckedAtByCacheKey.set(cacheKey, now);

  const knownVersion = snapshotVersionByCacheKey.get(cacheKey);
  if (!knownVersion) {
    return false;
  }

  try {
    const requiredSpecs = resolveRequiredSpecs(requiredPaths);
    const currentVersion = await fetchCurrentVersionSignature(requiredSpecs);
    if (currentVersion === knownVersion) {
      return false;
    }

    snapshotVersionByCacheKey.set(cacheKey, currentVersion);
    return true;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.warn(`[supabase-ssot] version probe skipped: ${message}`);
    return false;
  }
}

async function ensureSupabaseSsotSnapshotInternal(
  cacheDir: string,
  requiredPaths: string[],
): Promise<SupabaseSsotSnapshotResult> {
  if (!isSupabaseSsotEnabled()) {
    return {
      enabled: false,
      source: "disabled",
      cacheDir: null,
      writtenFiles: [],
      versionSignature: "disabled",
    };
  }

  const strict = parseBoolean(process.env.SUPABASE_SSOT_STRICT, false);
  await mkdir(cacheDir, { recursive: true });

  try {
    const requiredSpecs = resolveRequiredSpecs(requiredPaths);
    const { contentByPath, versionSignature } = await fetchSupabaseContentByPath(requiredSpecs);
    const writtenFiles = await writeContentToCache(cacheDir, requiredPaths, contentByPath);
    applyEngineEnvPaths(cacheDir, requiredPaths);

    return {
      enabled: true,
      source: "supabase",
      cacheDir,
      writtenFiles,
      versionSignature,
    };
  } catch (error) {
    const cacheReady = await hasAllCachedFiles(cacheDir, requiredPaths);
    if (cacheReady) {
      applyEngineEnvPaths(cacheDir, requiredPaths);
      return {
        enabled: true,
        source: "cache",
        cacheDir,
        writtenFiles: [],
        versionSignature: null,
      };
    }

    if (strict) {
      throw error;
    }

    const message = error instanceof Error ? error.message : String(error);
    console.warn(`[supabase-ssot] fallback to local files: ${message}`);
    return {
      enabled: true,
      source: "fallback",
      cacheDir,
      writtenFiles: [],
      versionSignature: null,
    };
  }
}

export async function ensureSupabaseSsotSnapshot(
  options: EnsureSupabaseSsotSnapshotOptions = {},
): Promise<SupabaseSsotSnapshotResult> {
  const cacheDir = resolveCacheDir(options.cacheDir);
  const requiredPaths = uniquePaths(options.requiredPaths ?? getDefaultSupabaseSsotFilePaths());
  const cacheKey = `${cacheDir}|${requiredPaths.join(",")}`;

  if (!options.forceRefresh && snapshotPromise && snapshotCacheKey === cacheKey) {
    const refreshRequired = await shouldRefreshByVersionProbe(cacheKey, requiredPaths);
    if (!refreshRequired) {
      return snapshotPromise;
    }
    snapshotPromise = null;
    snapshotCacheKey = null;
  }

  const promise = ensureSupabaseSsotSnapshotInternal(cacheDir, requiredPaths).catch((error) => {
    if (!options.forceRefresh) {
      snapshotPromise = null;
      snapshotCacheKey = null;
    }
    throw error;
  });

  if (!options.forceRefresh) {
    snapshotPromise = promise;
    snapshotCacheKey = cacheKey;
  }

  const result = await promise;
  if (result.versionSignature) {
    snapshotVersionByCacheKey.set(cacheKey, result.versionSignature);
  }
  if (options.forceRefresh) {
    snapshotVersionCheckedAtByCacheKey.set(cacheKey, Date.now());
  }
  return result;
}
