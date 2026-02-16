import assert from "node:assert/strict";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { getDefaultSupabaseSsotFilePaths, resetSupabaseSsotSnapshotStateForTests } from "../data/supabaseSsotSnapshot";
import { recommendFreeNames } from "./freeRecommend";

type FetchLike = typeof fetch;

interface MinimalResponse {
  ok: boolean;
  status: number;
  text(): Promise<string>;
  json(): Promise<unknown>;
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

function buildRowsForPath(path: string): Array<Record<string, unknown>> {
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

  if (path === "hanname_master.jsonl") {
    return [
      {
        row_index: 1,
        char: "仁",
        is_inmyong: true,
        meanings: { inmyong: ["어질"] },
        readings: { inmyong: ["인"] },
        element_pronunciation: "WATER",
      },
      {
        row_index: 2,
        char: "智",
        is_inmyong: true,
        meanings: { inmyong: ["지혜"] },
        readings: { inmyong: ["지"] },
        element_pronunciation: "WOOD",
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
        risk_flags: [],
      },
      {
        row_index: 2,
        char: "智",
        tags: ["지혜"],
        tag_scores: { 지혜: 0.8 },
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
        existing: { char: "仁" },
        incoming: { char: "仁" },
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
      name: "인지",
      tier: "A",
      score: 1,
      score_breakdown: {},
      features: { start: "인", end: "지" },
    },
  ];
}

function buildRowsByTable(paths: string[]): Map<string, Array<Record<string, unknown>>> {
  const map = new Map<string, Array<Record<string, unknown>>>();
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

async function run(): Promise<void> {
  const tempDir = mkdtempSync(join(tmpdir(), "namefit-free-ssot-"));
  const prevCwd = process.cwd();
  const originalFetch = globalThis.fetch;
  const requiredPaths = getDefaultSupabaseSsotFilePaths();
  const rowsByTable = buildRowsByTable(requiredPaths);
  const EXPECTED_RUNTIME_TABLE_FETCHES = 6;
  let fetchCalled = 0;

  globalThis.fetch = (async (input: unknown, _init?: unknown) => {
    fetchCalled += 1;
    const table = parseTableFromEndpoint(input);
    return createJsonResponse(rowsByTable.get(table) ?? []);
  }) as unknown as FetchLike;

  const keys = [
    "SUPABASE_SSOT_ENABLED",
    "SUPABASE_URL",
    "SUPABASE_SERVICE_ROLE_KEY",
    "SUPABASE_SSOT_CACHE_DIR",
    "SURNAME_MAP_PATH",
    "DATA_SOURCE_PATH",
    "HANJA_TAGS_PATH",
    "BLACKLIST_WORDS_PATH",
    "BLACKLIST_INITIALS_PATH",
    "NAME_POOL_M_PATH",
    "NAME_POOL_F_PATH",
    "NAME_PRIOR_PATH",
  ];
  const backupEnv = new Map<string, string | undefined>();

  try {
    for (const key of keys) {
      backupEnv.set(key, process.env[key]);
    }

    process.chdir(tempDir);
    process.env.SUPABASE_SSOT_ENABLED = "1";
    process.env.SUPABASE_URL = "https://example.supabase.co";
    process.env.SUPABASE_SERVICE_ROLE_KEY = "service-role";
    process.env.SUPABASE_SSOT_CACHE_DIR = ".cache/ssot";
    delete process.env.SURNAME_MAP_PATH;
    delete process.env.DATA_SOURCE_PATH;
    delete process.env.HANJA_TAGS_PATH;
    delete process.env.BLACKLIST_WORDS_PATH;
    delete process.env.BLACKLIST_INITIALS_PATH;
    delete process.env.NAME_POOL_M_PATH;
    delete process.env.NAME_POOL_F_PATH;
    delete process.env.NAME_PRIOR_PATH;

    resetSupabaseSsotSnapshotStateForTests();
    const result = await recommendFreeNames({
      surnameHangul: "김",
      gender: "MALE",
    });

    assert.equal(result.ok, true);
    assert.equal(fetchCalled, EXPECTED_RUNTIME_TABLE_FETCHES);
  } finally {
    process.chdir(prevCwd);
    globalThis.fetch = originalFetch;
    for (const [key, value] of backupEnv.entries()) {
      if (value === undefined) {
        delete process.env[key];
      } else {
        process.env[key] = value;
      }
    }
    rmSync(tempDir, { recursive: true, force: true });
  }

  console.log("[test:free-recommend-ssot] all tests passed");
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
