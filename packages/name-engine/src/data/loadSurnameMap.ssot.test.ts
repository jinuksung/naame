import assert from "node:assert/strict";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { resolveSurnameElementByHanja, resolveSurnameHanjaSelection } from "./loadSurnameMap";
import {
  resetSupabaseSsotSnapshotStateForTests,
} from "./supabaseSsotSnapshot";

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
    "name_block_syllable_rules.jsonl": "ssot_name_block_syllable_rules",
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
        element_pronunciation: "METAL",
        element_resource: "METAL",
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
    ];
  }

  if (path === "hanja_tags.jsonl") {
    return [
      {
        row_index: 1,
        char: "仁",
        tags: [],
        tag_scores: {},
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

  if (path === "name_block_syllable_rules.jsonl") {
    return [
      {
        row_index: 1,
        enabled: true,
        s1_has_jong: true,
        s2_has_jong: false,
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
      name: "가나",
      tier: "A",
      score: 1,
      score_breakdown: {},
      features: { start: "가", end: "나" },
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
  {
    const tempDir = mkdtempSync(join(tmpdir(), "namefit-surname-ssot-cache-mkdir-"));
    const prevCwd = process.cwd();
    const backupEnv = new Map<string, string | undefined>();
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
      "NAME_BLOCK_SYLLABLE_RULES_PATH",
      "NAME_POOL_M_PATH",
      "NAME_POOL_F_PATH",
    ];

    try {
      for (const key of keys) {
        backupEnv.set(key, process.env[key]);
      }

      process.chdir(tempDir);
      writeFileSync(
        join(tempDir, "surname_map.jsonl"),
        JSON.stringify({
          surnameReading: "김",
          hanja: "金",
          isDefault: true,
          popularityRank: 1,
        }) + "\n",
        "utf8",
      );
      writeFileSync(join(tempDir, "blocked-cache-target"), "not-a-directory", "utf8");

      process.env.SUPABASE_SSOT_ENABLED = "1";
      process.env.SUPABASE_URL = "https://example.supabase.co";
      process.env.SUPABASE_SERVICE_ROLE_KEY = "service-role";
      process.env.SUPABASE_SSOT_CACHE_DIR = "blocked-cache-target";
      delete process.env.SURNAME_MAP_PATH;
      delete process.env.DATA_SOURCE_PATH;
      delete process.env.HANJA_TAGS_PATH;
      delete process.env.BLACKLIST_WORDS_PATH;
      delete process.env.BLACKLIST_INITIALS_PATH;
      delete process.env.NAME_BLOCK_SYLLABLE_RULES_PATH;
      delete process.env.NAME_POOL_M_PATH;
      delete process.env.NAME_POOL_F_PATH;

      resetSupabaseSsotSnapshotStateForTests();
      const resolved = await resolveSurnameHanjaSelection("김");
      assert.equal(resolved.selectedHanja, "金");
    } finally {
      process.chdir(prevCwd);
      for (const [key, value] of backupEnv) {
        if (value === undefined) {
          delete process.env[key];
        } else {
          process.env[key] = value;
        }
      }
      rmSync(tempDir, { recursive: true, force: true });
    }
  }

  {
    const tempDir = mkdtempSync(join(tmpdir(), "namefit-surname-ssot-"));
    const prevCwd = process.cwd();
    const originalFetch = globalThis.fetch;
    const requiredPaths = ["surname_map.jsonl"];
    const rowsByTable = buildRowsByTable(requiredPaths);
    const EXPECTED_RUNTIME_TABLE_FETCHES = 1;
    let fetchCalled = 0;

    globalThis.fetch = (async (input: unknown, _init?: unknown) => {
      fetchCalled += 1;
      const table = parseTableFromEndpoint(input);
      return createJsonResponse(rowsByTable.get(table) ?? []);
    }) as unknown as FetchLike;

    const backupEnv = new Map<string, string | undefined>();
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
      "NAME_BLOCK_SYLLABLE_RULES_PATH",
      "NAME_POOL_M_PATH",
      "NAME_POOL_F_PATH",
    ];

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
      delete process.env.NAME_BLOCK_SYLLABLE_RULES_PATH;
      delete process.env.NAME_POOL_M_PATH;
      delete process.env.NAME_POOL_F_PATH;

      resetSupabaseSsotSnapshotStateForTests();
      const resolved = await resolveSurnameHanjaSelection("김");
      assert.equal(resolved.selectedHanja, "金");
      assert.equal(fetchCalled, EXPECTED_RUNTIME_TABLE_FETCHES);
      const element = await resolveSurnameElementByHanja("金");
      assert.equal(element, "METAL");
    } finally {
      process.chdir(prevCwd);
      globalThis.fetch = originalFetch;
      for (const [key, value] of backupEnv) {
        if (value === undefined) {
          delete process.env[key];
        } else {
          process.env[key] = value;
        }
      }
      rmSync(tempDir, { recursive: true, force: true });
    }
  }

  console.log("[test:surname-ssot] all tests passed");
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
