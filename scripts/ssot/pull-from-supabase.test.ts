import assert from "node:assert/strict";
import { buildPullEndpoint } from "./pull-from-supabase";
import type { SsotDatasetSpec, SupabaseConfig } from "./common";

function withPatchedEnv<T>(patch: Record<string, string | undefined>, run: () => T): T {
  const backup = new Map<string, string | undefined>();
  for (const [key, value] of Object.entries(patch)) {
    backup.set(key, process.env[key]);
    if (value === undefined) {
      delete process.env[key];
      continue;
    }
    process.env[key] = value;
  }

  try {
    return run();
  } finally {
    for (const [key, value] of backup.entries()) {
      if (value === undefined) {
        delete process.env[key];
      } else {
        process.env[key] = value;
      }
    }
  }
}

const baseConfig: SupabaseConfig = {
  baseUrl: "https://example.supabase.co",
  serviceRoleKey: "service-role-key",
};

const hannameSpec: SsotDatasetSpec = {
  dataset: "hanname_master",
  table: "ssot_hanname_master",
  remotePath: "hanname_master.jsonl",
  localPath: "hanname_master.jsonl",
  format: "jsonl",
};

const surnameSpec: SsotDatasetSpec = {
  dataset: "surname_map",
  table: "ssot_surname_map",
  remotePath: "surname_map.jsonl",
  localPath: "surname_map.jsonl",
  format: "jsonl",
};

function testHannameMasterPullFiltersToInmyongByDefault(): void {
  withPatchedEnv({ SSOT_PULL_INCLUDE_NOT_INMYONG: undefined }, () => {
    const endpoint = buildPullEndpoint(baseConfig, hannameSpec, "row_index,char,is_inmyong", 0, 1000);
    const url = new URL(endpoint);
    assert.equal(url.searchParams.get("is_inmyong"), "is.true");
  });
}

function testHannameMasterCanIncludeNotInmyongRowsViaEnv(): void {
  withPatchedEnv({ SSOT_PULL_INCLUDE_NOT_INMYONG: "1" }, () => {
    const endpoint = buildPullEndpoint(baseConfig, hannameSpec, "row_index,char,is_inmyong", 0, 1000);
    const url = new URL(endpoint);
    assert.equal(url.searchParams.get("is_inmyong"), null);
  });
}

function testOtherTablesNeverApplyIsInmyongFilter(): void {
  withPatchedEnv({ SSOT_PULL_INCLUDE_NOT_INMYONG: undefined }, () => {
    const endpoint = buildPullEndpoint(baseConfig, surnameSpec, "row_index,surname_reading", 0, 1000);
    const url = new URL(endpoint);
    assert.equal(url.searchParams.get("is_inmyong"), null);
  });
}

function run(): void {
  testHannameMasterPullFiltersToInmyongByDefault();
  testHannameMasterCanIncludeNotInmyongRowsViaEnv();
  testOtherTablesNeverApplyIsInmyongFilter();
  console.log("[test:ssot-pull] all tests passed");
}

run();
