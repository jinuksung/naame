import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";

export type SsotFormat = "jsonl" | "name_pool_json";

export interface SsotDatasetSpec {
  dataset: string;
  table: string;
  remotePath: string;
  localPath: string;
  format: SsotFormat;
  allowEmpty?: boolean;
}

export const SSOT_DATASET_SPECS: SsotDatasetSpec[] = [
  {
    dataset: "hanname_master",
    table: "ssot_hanname_master",
    remotePath: "hanname_master.jsonl",
    localPath: "hanname_master.jsonl",
    format: "jsonl",
  },
  {
    dataset: "surname_map",
    table: "ssot_surname_map",
    remotePath: "surname_map.jsonl",
    localPath: "surname_map.jsonl",
    format: "jsonl",
  },
  {
    dataset: "hanja_tags",
    table: "ssot_hanja_tags",
    remotePath: "hanja_tags.jsonl",
    localPath: "hanja_tags.jsonl",
    format: "jsonl",
  },
  {
    dataset: "blacklist_words",
    table: "ssot_blacklist_words",
    remotePath: "blacklist_words.jsonl",
    localPath: "blacklist_words.jsonl",
    format: "jsonl",
  },
  {
    dataset: "blacklist_initials",
    table: "ssot_blacklist_initials",
    remotePath: "blacklist_initials.jsonl",
    localPath: "blacklist_initials.jsonl",
    format: "jsonl",
  },
  {
    dataset: "name_block_syllable_rules",
    table: "ssot_name_block_syllable_rules",
    remotePath: "name_block_syllable_rules.jsonl",
    localPath: "name_block_syllable_rules.jsonl",
    format: "jsonl",
    allowEmpty: true,
  },
  {
    dataset: "name_pool_syllable_position_rules",
    table: "ssot_name_pool_syllable_position_rules",
    remotePath: "name_pool_syllable_position_rules.jsonl",
    localPath: "name_pool_syllable_position_rules.jsonl",
    format: "jsonl",
    allowEmpty: true,
  },
  {
    dataset: "name_pool_M",
    table: "ssot_name_pool_m",
    remotePath: "name_pool_M.json",
    localPath: "out/name_pool_M.json",
    format: "name_pool_json",
  },
  {
    dataset: "name_pool_F",
    table: "ssot_name_pool_f",
    remotePath: "name_pool_F.json",
    localPath: "out/name_pool_F.json",
    format: "name_pool_json",
  },
  {
    dataset: "hanname_master_conflicts",
    table: "ssot_hanname_master_conflicts",
    remotePath: "hanname_master_conflicts.jsonl",
    localPath: "hanname_master_conflicts.jsonl",
    format: "jsonl",
  },
  {
    dataset: "hanname_metrics",
    table: "ssot_hanname_metrics",
    remotePath: "hanname_metrics.jsonl",
    localPath: "hanname_metrics.jsonl",
    format: "jsonl",
  },
];

export interface SupabaseConfig {
  baseUrl: string;
  serviceRoleKey: string;
}

export interface SsotTableRow {
  row_index: number;
  [key: string]: unknown;
}

interface JsonColumnKey {
  jsonKey: string;
  column: string;
}

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
    { jsonKey: "elementPronunciation", column: "element_pronunciation" },
    { jsonKey: "elementResource", column: "element_resource" },
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
  name_block_syllable_rules: [
    { jsonKey: "enabled", column: "enabled" },
    { jsonKey: "s1_jung", column: "s1_jung" },
    { jsonKey: "s1_jong", column: "s1_jong" },
    { jsonKey: "s1_has_jong", column: "s1_has_jong" },
    { jsonKey: "s2_jung", column: "s2_jung" },
    { jsonKey: "s2_jong", column: "s2_jong" },
    { jsonKey: "s2_has_jong", column: "s2_has_jong" },
    { jsonKey: "note", column: "note" },
  ],
  name_pool_syllable_position_rules: [
    { jsonKey: "enabled", column: "enabled" },
    { jsonKey: "syllable", column: "syllable" },
    { jsonKey: "gender", column: "gender" },
    { jsonKey: "blockedPosition", column: "blocked_position" },
    { jsonKey: "tierScope", column: "tier_scope" },
    { jsonKey: "note", column: "note" },
  ],
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
    throw new Error(`[ssot] unsupported jsonl dataset: ${spec.dataset}`);
  }
  return map;
}

export function selectColumnsForSpec(spec: SsotDatasetSpec): string {
  if (spec.format === "name_pool_json") {
    return NAME_POOL_COLUMNS.join(",");
  }

  const columns = ensureJsonlKeyMap(spec).map((item) => item.column);
  return ["row_index", ...columns].join(",");
}

function normalizeJsonlRows(raw: string, spec: SsotDatasetSpec): SsotTableRow[] {
  const keyMap = ensureJsonlKeyMap(spec);
  const rows: SsotTableRow[] = [];
  let rowIndex = 1;

  for (const rawLine of raw.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line) {
      continue;
    }

    let parsed: unknown;
    try {
      parsed = JSON.parse(line);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      throw new Error(`[ssot] ${spec.dataset} JSONL parse failed at row ${rowIndex}: ${message}`);
    }

    if (!isObject(parsed)) {
      throw new Error(`[ssot] ${spec.dataset} expected object at row ${rowIndex}`);
    }

    const row: SsotTableRow = {
      row_index: rowIndex,
    };

    for (const { jsonKey, column } of keyMap) {
      const value = parsed[jsonKey];
      row[column] = value === undefined ? null : value;
    }

    rows.push(row);
    rowIndex += 1;
  }

  return rows;
}

function encodeNamePoolRows(raw: string, dataset: string): SsotTableRow[] {
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    throw new Error(`[ssot] ${dataset} JSON parse failed: ${message}`);
  }

  if (!isObject(parsed)) {
    throw new Error(`[ssot] ${dataset} expected JSON object`);
  }

  const inputObject = parsed as Record<string, unknown>;
  const rawItems = Array.isArray(inputObject.items) ? inputObject.items : [];

  const generatedAt = inputObject.generatedAt;
  const input = inputObject.input;
  const gender = inputObject.gender;
  const totalCount = inputObject.count;

  const rows: SsotTableRow[] = [];
  for (let index = 0; index < rawItems.length; index += 1) {
    const item = isObject(rawItems[index]) ? rawItems[index] : {};
    rows.push({
      row_index: index + 1,
      generated_at: generatedAt === undefined ? null : generatedAt,
      input: input === undefined ? null : input,
      gender: gender === undefined ? null : gender,
      total_count: totalCount === undefined ? null : totalCount,
      name: item.name ?? null,
      tier: item.tier ?? null,
      score: item.score ?? null,
      score_breakdown: item.scoreBreakdown ?? null,
      features: item.features ?? null,
    });
  }

  if (rows.length > 0) {
    return rows;
  }

  return [
    {
      row_index: 0,
      generated_at: generatedAt === undefined ? null : generatedAt,
      input: input === undefined ? null : input,
      gender: gender === undefined ? null : gender,
      total_count: totalCount === undefined ? null : totalCount,
      name: null,
      tier: null,
      score: null,
      score_breakdown: null,
      features: null,
    },
  ];
}

function encodeRowsForSpec(raw: string, spec: SsotDatasetSpec): SsotTableRow[] {
  if (spec.format === "jsonl") {
    return normalizeJsonlRows(raw, spec);
  }
  return encodeNamePoolRows(raw, spec.dataset);
}

function sortRows(rows: SsotTableRow[]): SsotTableRow[] {
  return [...rows].sort((a, b) => a.row_index - b.row_index);
}

function decodeNamePoolRows(rows: SsotTableRow[]): string {
  const sorted = sortRows(rows);

  const items: Record<string, unknown>[] = [];
  let generatedAt: string | undefined;
  let input: string | undefined;
  let gender: string | undefined;
  let totalCount: number | undefined;

  for (const row of sorted) {
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

    const item: Record<string, unknown> = {
      name: row.name,
    };
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

function decodeJsonlRows(rows: SsotTableRow[], spec: SsotDatasetSpec): string {
  const keyMap = ensureJsonlKeyMap(spec);
  const sorted = sortRows(rows);

  return sorted
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

function decodeRowsForSpec(rows: SsotTableRow[], spec: SsotDatasetSpec): string {
  if (spec.format === "jsonl") {
    return decodeJsonlRows(rows, spec);
  }
  return decodeNamePoolRows(rows);
}

export function resolveSupabaseConfig(): SupabaseConfig {
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

export async function readManifestRowsByTable(cwd: string = process.cwd()): Promise<Map<string, SsotTableRow[]>> {
  const rowsByTable = new Map<string, SsotTableRow[]>();

  for (const spec of SSOT_DATASET_SPECS) {
    const absolutePath = resolve(cwd, spec.localPath);
    const raw = await readFile(absolutePath, "utf8");
    rowsByTable.set(spec.table, encodeRowsForSpec(raw, spec));
  }

  return rowsByTable;
}

export async function writeRowsByTableToLocal(
  rowsByTable: Map<string, SsotTableRow[]>,
  cwd: string = process.cwd(),
): Promise<string[]> {
  const written: string[] = [];

  for (const spec of SSOT_DATASET_SPECS) {
    const rows = rowsByTable.get(spec.table) ?? [];
    const content = decodeRowsForSpec(rows, spec);
    const absolutePath = resolve(cwd, spec.localPath);
    await mkdir(dirname(absolutePath), { recursive: true });
    await writeFile(absolutePath, content, "utf8");
    written.push(absolutePath);
  }

  return written;
}

export function totalPayloadCharsByTable(rowsByTable: Map<string, SsotTableRow[]>): number {
  let sum = 0;
  for (const rows of rowsByTable.values()) {
    for (const row of rows) {
      const { row_index: _ignored, ...payload } = row;
      sum += JSON.stringify(payload).length;
    }
  }
  return sum;
}

export function normalizeRawTableRows(payload: unknown): SsotTableRow[] {
  if (!Array.isArray(payload)) {
    return [];
  }

  const out: SsotTableRow[] = [];
  for (const raw of payload) {
    if (!isObject(raw)) {
      continue;
    }

    const rowIndex = parseRowIndex(raw.row_index);
    if (rowIndex == null) {
      continue;
    }

    const row: SsotTableRow = {
      row_index: rowIndex,
    };

    for (const [key, value] of Object.entries(raw)) {
      if (key === "row_index") {
        continue;
      }
      row[key] = value;
    }

    out.push(row);
  }

  return sortRows(out);
}
