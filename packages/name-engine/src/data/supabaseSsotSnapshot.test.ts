import assert from "node:assert/strict";
import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import {
  ensureSupabaseSsotSnapshot,
  getDefaultSupabaseSsotFilePaths,
  resetSupabaseSsotSnapshotStateForTests,
} from "./supabaseSsotSnapshot";

type FetchLike = typeof fetch;

interface MinimalResponse {
  ok: boolean;
  status: number;
  text(): Promise<string>;
  json(): Promise<unknown>;
}

interface SupabaseTableRow {
  row_index: number;
  [key: string]: unknown;
}

function createJsonResponse(payload: unknown): MinimalResponse {
  return {
    ok: true,
    status: 200,
    async text() {
      return JSON.stringify(payload);
    },
    async json() {
      return payload;
    },
  };
}

function withPatchedEnv<T>(patch: Record<string, string | undefined>, run: () => Promise<T>): Promise<T> {
  const backup = new Map<string, string | undefined>();
  for (const [key, value] of Object.entries(patch)) {
    backup.set(key, process.env[key]);
    if (value === undefined) {
      delete process.env[key];
      continue;
    }
    process.env[key] = value;
  }

  return run().finally(() => {
    for (const [key, value] of backup.entries()) {
      if (value === undefined) {
        delete process.env[key];
      } else {
        process.env[key] = value;
      }
    }
  });
}

function toTableName(path: string): string {
  const byPath: Record<string, string> = {
    "hanname_master.jsonl": "ssot_hanname_master",
    "surname_map.jsonl": "ssot_surname_map",
    "hanja_tags.jsonl": "ssot_hanja_tags",
    "blacklist_words.jsonl": "ssot_blacklist_words",
    "blacklist_initials.jsonl": "ssot_blacklist_initials",
    "name_pool_M.json": "ssot_name_pool_m",
    "name_pool_F.json": "ssot_name_pool_f",
    "hanname_master_conflicts.jsonl": "ssot_hanname_master_conflicts",
    "hanname_metrics.jsonl": "ssot_hanname_metrics",
  };
  const table = byPath[path];
  if (!table) {
    throw new Error(`unsupported path: ${path}`);
  }
  return table;
}

function buildRowsForPath(path: string): SupabaseTableRow[] {
  if (path === "hanname_master.jsonl") {
    return [
      {
        row_index: 1,
        char: "仁",
        is_inmyong: true,
        meanings: { inmyong: ["어질"] },
        readings: { inmyong: ["인"] },
        source: "fixture",
      },
    ];
  }

  if (path === "surname_map.jsonl") {
    return [
      {
        row_index: 1,
        surname_reading: "김",
        hanja: "金",
        is_default: true,
        popularity_rank: 1,
      },
    ];
  }

  if (path === "hanja_tags.jsonl") {
    return [
      {
        row_index: 1,
        char: "仁",
        tags: ["배려"],
        tag_scores: { 배려: 0.7 },
        evidence: { selected: [], candidates: [], blockedTokens: [] },
        risk_flags: [],
      },
    ];
  }

  if (path === "blacklist_words.jsonl") {
    return [
      {
        row_index: 1,
        pattern: "가지",
      },
    ];
  }

  if (path === "blacklist_initials.jsonl") {
    return [
      {
        row_index: 1,
        pattern: "ㅂㅅ",
      },
    ];
  }

  if (path === "hanname_master_conflicts.jsonl") {
    return [
      {
        row_index: 1,
        char: "仁",
        existing: { char: "仁", readings: { inmyong: ["인"] } },
        incoming: { char: "仁", readings: { inmyong: ["인"] } },
        detected_at: "2026-01-01T00:00:00.000Z",
      },
    ];
  }

  if (path === "hanname_metrics.jsonl") {
    return [
      {
        row_index: 1,
        char: "仁",
        page: 1,
        source_url: "https://example.test",
        checked_at: "2026-01-01T00:00:00.000Z",
        usage_count: { kor: 1, hanja: 1 },
        warnings: [],
      },
    ];
  }

  const gender = path.includes("_M.") ? "M" : "F";
  return [
    {
      row_index: 1,
      generated_at: "2026-01-01T00:00:00.000Z",
      input: `fixture:${path}`,
      gender,
      total_count: 1,
      name: `${path}-name`,
      tier: "A",
      score: 1,
      score_breakdown: {},
      features: { start: "가", end: "나" },
    },
  ];
}

function buildRowsByTable(paths: string[]): Map<string, SupabaseTableRow[]> {
  const map = new Map<string, SupabaseTableRow[]>();
  for (const path of paths) {
    map.set(toTableName(path), buildRowsForPath(path));
  }
  return map;
}

function parseTableFromEndpoint(input: unknown): string {
  const url = String(input);
  const marker = "/rest/v1/";
  const start = url.indexOf(marker);
  if (start < 0) {
    return "";
  }
  const tail = url.slice(start + marker.length);
  const end = tail.indexOf("?");
  return end >= 0 ? tail.slice(0, end) : tail;
}

function parseNumberParam(input: unknown, key: string): number | null {
  const url = String(input);
  const match = new RegExp(`[?&]${key}=([0-9]+)`).exec(url);
  if (!match) {
    return null;
  }
  const parsed = Number(match[1]);
  return Number.isFinite(parsed) ? parsed : null;
}

function isVersionProbeRequest(input: unknown): boolean {
  const url = String(input);
  return url.includes("select=updated_at%2Crow_index") && url.includes("limit=1");
}

async function testDisabledSkipsFetch(): Promise<void> {
  const tempDir = mkdtempSync(join(tmpdir(), "namefit-ssot-disabled-"));
  const originalFetch = globalThis.fetch;
  let fetchCalled = false;
  globalThis.fetch = (async (_input: unknown, _init?: unknown) => {
    fetchCalled = true;
    return createJsonResponse([]);
  }) as unknown as FetchLike;

  try {
    await withPatchedEnv(
      {
        SUPABASE_SSOT_ENABLED: undefined,
        DATA_SOURCE: undefined,
        SUPABASE_URL: "https://example.supabase.co",
        SUPABASE_SERVICE_ROLE_KEY: "service-role",
      },
      async () => {
        resetSupabaseSsotSnapshotStateForTests();
        const result = await ensureSupabaseSsotSnapshot({ cacheDir: tempDir });
        assert.equal(result.enabled, false);
        assert.equal(result.source, "disabled");
      },
    );
    assert.equal(fetchCalled, false);
  } finally {
    globalThis.fetch = originalFetch;
    rmSync(tempDir, { recursive: true, force: true });
  }
}

async function testFetchWritesSnapshotAndSetsEnvPaths(): Promise<void> {
  const tempDir = mkdtempSync(join(tmpdir(), "namefit-ssot-enabled-"));
  const originalFetch = globalThis.fetch;
  const requiredPaths = getDefaultSupabaseSsotFilePaths();
  const rowsByTable = buildRowsByTable(requiredPaths);
  let fetchCalled = 0;
  globalThis.fetch = (async (input: unknown, _init?: unknown) => {
    fetchCalled += 1;
    const table = parseTableFromEndpoint(input);
    return createJsonResponse(rowsByTable.get(table) ?? []);
  }) as unknown as FetchLike;

  try {
    await withPatchedEnv(
      {
        SUPABASE_SSOT_ENABLED: "1",
        SUPABASE_URL: "https://example.supabase.co",
        SUPABASE_SERVICE_ROLE_KEY: "service-role",
        DATA_SOURCE_PATH: undefined,
        SURNAME_MAP_PATH: undefined,
        HANJA_TAGS_PATH: undefined,
        BLACKLIST_WORDS_PATH: undefined,
        BLACKLIST_INITIALS_PATH: undefined,
        NAME_POOL_M_PATH: undefined,
        NAME_POOL_F_PATH: undefined,
      },
      async () => {
        resetSupabaseSsotSnapshotStateForTests();
        const result = await ensureSupabaseSsotSnapshot({ cacheDir: tempDir });
        assert.equal(result.enabled, true);
        assert.equal(result.source, "supabase");
        assert.equal(fetchCalled, requiredPaths.length);

        const hannameText = readFileSync(resolve(tempDir, "hanname_master.jsonl"), "utf8");
        assert.ok(hannameText.includes('"char":"仁"'));

        const namePoolMText = readFileSync(resolve(tempDir, "name_pool_M.json"), "utf8");
        const namePoolM = JSON.parse(namePoolMText) as { items?: Array<{ name?: string }> };
        assert.equal(namePoolM.items?.[0]?.name, "name_pool_M.json-name");

        assert.equal(process.env.DATA_SOURCE_PATH, resolve(tempDir, "hanname_master.jsonl"));
        assert.equal(process.env.SURNAME_MAP_PATH, resolve(tempDir, "surname_map.jsonl"));
        assert.equal(process.env.HANJA_TAGS_PATH, resolve(tempDir, "hanja_tags.jsonl"));
        assert.equal(process.env.BLACKLIST_WORDS_PATH, resolve(tempDir, "blacklist_words.jsonl"));
        assert.equal(process.env.BLACKLIST_INITIALS_PATH, resolve(tempDir, "blacklist_initials.jsonl"));
        assert.equal(process.env.NAME_POOL_M_PATH, resolve(tempDir, "name_pool_M.json"));
        assert.equal(process.env.NAME_POOL_F_PATH, resolve(tempDir, "name_pool_F.json"));
      },
    );
  } finally {
    globalThis.fetch = originalFetch;
    rmSync(tempDir, { recursive: true, force: true });
  }
}

async function testFallsBackToCacheWhenFetchFails(): Promise<void> {
  const tempDir = mkdtempSync(join(tmpdir(), "namefit-ssot-fallback-"));
  const originalFetch = globalThis.fetch;
  const requiredPaths = getDefaultSupabaseSsotFilePaths();
  const rowsByTable = buildRowsByTable(requiredPaths);
  let phase = "seed";

  globalThis.fetch = (async (input: unknown, _init?: unknown) => {
    if (phase === "seed") {
      const table = parseTableFromEndpoint(input);
      return createJsonResponse(rowsByTable.get(table) ?? []);
    }
    throw new Error("network down");
  }) as unknown as FetchLike;

  try {
    await withPatchedEnv(
      {
        SUPABASE_SSOT_ENABLED: "1",
        SUPABASE_URL: "https://example.supabase.co",
        SUPABASE_SERVICE_ROLE_KEY: "service-role",
      },
      async () => {
        resetSupabaseSsotSnapshotStateForTests();
        const seeded = await ensureSupabaseSsotSnapshot({ cacheDir: tempDir });
        assert.equal(seeded.source, "supabase");

        phase = "fallback";
        resetSupabaseSsotSnapshotStateForTests();
        const fallback = await ensureSupabaseSsotSnapshot({
          cacheDir: tempDir,
          forceRefresh: true,
        });
        assert.equal(fallback.source, "cache");
      },
    );
  } finally {
    globalThis.fetch = originalFetch;
    rmSync(tempDir, { recursive: true, force: true });
  }
}

async function testFetchPaginatesLargeTables(): Promise<void> {
  const tempDir = mkdtempSync(join(tmpdir(), "namefit-ssot-paging-"));
  const originalFetch = globalThis.fetch;
  const requiredPaths = getDefaultSupabaseSsotFilePaths();
  const rowsByTable = buildRowsByTable(requiredPaths);
  const largeTable = "ssot_hanname_master";
  const largeRows: SupabaseTableRow[] = [];
  for (let i = 1; i <= 1205; i += 1) {
    largeRows.push({
      row_index: i,
      char: `테${i}`,
      is_inmyong: true,
      meanings: { inmyong: ["테스트"] },
      readings: { inmyong: ["테"] },
      source: "fixture",
    });
  }
  rowsByTable.set(largeTable, largeRows);

  let fetchCalled = 0;
  globalThis.fetch = (async (input: unknown, _init?: unknown) => {
    fetchCalled += 1;
    const table = parseTableFromEndpoint(input);
    const allRows = rowsByTable.get(table) ?? [];
    const offset = parseNumberParam(input, "offset") ?? 0;
    const limit = parseNumberParam(input, "limit") ?? 1000;
    return createJsonResponse(allRows.slice(offset, offset + limit));
  }) as unknown as FetchLike;

  try {
    await withPatchedEnv(
      {
        SUPABASE_SSOT_ENABLED: "1",
        SUPABASE_URL: "https://example.supabase.co",
        SUPABASE_SERVICE_ROLE_KEY: "service-role",
        DATA_SOURCE_PATH: undefined,
      },
      async () => {
        resetSupabaseSsotSnapshotStateForTests();
        const result = await ensureSupabaseSsotSnapshot({ cacheDir: tempDir });
        assert.equal(result.source, "supabase");

        const hannameText = readFileSync(resolve(tempDir, "hanname_master.jsonl"), "utf8");
        assert.ok(hannameText.includes('"char":"테1205"'));
        assert.ok(fetchCalled > requiredPaths.length);
      },
    );
  } finally {
    globalThis.fetch = originalFetch;
    rmSync(tempDir, { recursive: true, force: true });
  }
}

async function testRefreshesSnapshotWhenVersionProbeChanges(): Promise<void> {
  const tempDir = mkdtempSync(join(tmpdir(), "namefit-ssot-version-refresh-"));
  const originalFetch = globalThis.fetch;
  const requiredPaths = getDefaultSupabaseSsotFilePaths();
  const v1RowsByTable = buildRowsByTable(requiredPaths);
  const v2RowsByTable = buildRowsByTable(requiredPaths);
  v2RowsByTable.set("ssot_blacklist_words", [
    {
      row_index: 1,
      pattern: "새금칙어",
    },
  ]);

  let phase: "initial" | "after-change" = "initial";
  let fullFetchCount = 0;
  let probeFetchCount = 0;

  globalThis.fetch = (async (input: unknown, _init?: unknown) => {
    const table = parseTableFromEndpoint(input);
    if (isVersionProbeRequest(input)) {
      probeFetchCount += 1;
      const updatedAt = phase === "initial" ? "2026-02-01T00:00:00.000Z" : "2026-02-01T00:01:00.000Z";
      return createJsonResponse([
        {
          row_index: 1,
          updated_at: `${updatedAt}:${table}`,
        },
      ]);
    }

    fullFetchCount += 1;
    const rowsByTable = phase === "initial" ? v1RowsByTable : v2RowsByTable;
    return createJsonResponse(rowsByTable.get(table) ?? []);
  }) as unknown as FetchLike;

  try {
    await withPatchedEnv(
      {
        SUPABASE_SSOT_ENABLED: "1",
        SUPABASE_URL: "https://example.supabase.co",
        SUPABASE_SERVICE_ROLE_KEY: "service-role",
        SUPABASE_SSOT_VERSION_CHECK_INTERVAL_MS: "0",
      },
      async () => {
        resetSupabaseSsotSnapshotStateForTests();

        const first = await ensureSupabaseSsotSnapshot({ cacheDir: tempDir });
        assert.equal(first.source, "supabase");
        assert.equal(fullFetchCount, requiredPaths.length);

        phase = "after-change";
        const second = await ensureSupabaseSsotSnapshot({ cacheDir: tempDir });
        assert.equal(second.source, "supabase");
        assert.equal(fullFetchCount, requiredPaths.length * 2);
        assert.equal(probeFetchCount, requiredPaths.length);

        const blacklistText = readFileSync(resolve(tempDir, "blacklist_words.jsonl"), "utf8");
        assert.ok(blacklistText.includes("새금칙어"));
      },
    );
  } finally {
    globalThis.fetch = originalFetch;
    rmSync(tempDir, { recursive: true, force: true });
  }
}

async function testUsesTmpCacheDirByDefaultOnVercel(): Promise<void> {
  const tempRoot = mkdtempSync(join(tmpdir(), "namefit-ssot-vercel-"));
  const expectedCacheDir = resolve(tempRoot, "ssot");
  const originalFetch = globalThis.fetch;
  const requiredPaths = getDefaultSupabaseSsotFilePaths();
  const rowsByTable = buildRowsByTable(requiredPaths);

  globalThis.fetch = (async (input: unknown, _init?: unknown) => {
    const table = parseTableFromEndpoint(input);
    return createJsonResponse(rowsByTable.get(table) ?? []);
  }) as unknown as FetchLike;

  try {
    await withPatchedEnv(
      {
        VERCEL: "1",
        TMPDIR: tempRoot,
        SUPABASE_SSOT_ENABLED: "1",
        SUPABASE_SSOT_CACHE_DIR: undefined,
        SUPABASE_URL: "https://example.supabase.co",
        SUPABASE_SERVICE_ROLE_KEY: "service-role",
        DATA_SOURCE_PATH: undefined,
        SURNAME_MAP_PATH: undefined,
        HANJA_TAGS_PATH: undefined,
        BLACKLIST_WORDS_PATH: undefined,
        BLACKLIST_INITIALS_PATH: undefined,
        NAME_POOL_M_PATH: undefined,
        NAME_POOL_F_PATH: undefined,
      },
      async () => {
        resetSupabaseSsotSnapshotStateForTests();
        const result = await ensureSupabaseSsotSnapshot();
        assert.equal(result.source, "supabase");
        assert.equal(result.cacheDir, expectedCacheDir);
        assert.equal(process.env.DATA_SOURCE_PATH, resolve(expectedCacheDir, "hanname_master.jsonl"));
      },
    );
  } finally {
    globalThis.fetch = originalFetch;
    rmSync(tempRoot, { recursive: true, force: true });
  }
}

async function run(): Promise<void> {
  await testDisabledSkipsFetch();
  await testFetchWritesSnapshotAndSetsEnvPaths();
  await testFetchPaginatesLargeTables();
  await testFallsBackToCacheWhenFetchFails();
  await testRefreshesSnapshotWhenVersionProbeChanges();
  await testUsesTmpCacheDirByDefaultOnVercel();
  console.log("[test:ssot] all tests passed");
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
