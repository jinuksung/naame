import { access, readFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { HanjaDataset, HanjaRow } from "../types";

interface RawHannameMasterRow {
  char?: unknown;
  isInmyong?: unknown;
  meanings?: {
    inmyong?: unknown;
    dictionary?: unknown;
  };
  readings?: {
    inmyong?: unknown;
  };
  elementPronunciation?: unknown;
  elementResource?: unknown;
}

interface RawHanjaTagRow {
  char?: unknown;
  tags?: unknown;
  tagScores?: unknown;
  riskFlags?: unknown;
}

interface HanjaTagMetadata {
  tags: string[];
  tagPriorityScore: number;
  riskFlags: string[];
}

interface LoadHanjaDatasetOptions {
  hanjaTagsPath?: string;
}

const SINGLE_HANGUL_SYLLABLE_PATTERN = /^[가-힣]$/;
const DEFAULT_HANJA_TAGS_FILENAME = "hanja_tags.jsonl";

function uniqueNonEmpty(values: readonly string[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];

  for (const raw of values) {
    const item = raw.trim();
    if (!item || seen.has(item)) {
      continue;
    }
    seen.add(item);
    out.push(item);
  }

  return out;
}

function toStringArray(value: unknown): string[] {
  if (Array.isArray(value)) {
    return uniqueNonEmpty(
      value.map((item) => (typeof item === "string" ? item : String(item ?? "")).trim())
    );
  }

  if (typeof value === "string") {
    const trimmed = value.trim();
    return trimmed ? [trimmed] : [];
  }

  return [];
}

function uniquePaths(paths: string[]): string[] {
  return Array.from(new Set(paths));
}

async function fileExists(path: string): Promise<boolean> {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
}

function buildSearchDirs(basePath: string): string[] {
  return uniquePaths([
    basePath,
    resolve(basePath, ".."),
    resolve(basePath, "../.."),
    resolve(basePath, "../../.."),
    process.cwd(),
    resolve(process.cwd(), ".."),
    resolve(process.cwd(), "../.."),
    resolve(process.cwd(), "../../.."),
  ]);
}

function toPositiveScore(value: unknown): number {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return 0;
  }
  return value > 0 ? value : 0;
}

function toTagPriorityScore(value: unknown): number {
  if (!value || typeof value !== "object") {
    return 0;
  }

  let max = 0;
  for (const item of Object.values(value as Record<string, unknown>)) {
    const score = toPositiveScore(item);
    if (score > max) {
      max = score;
    }
  }
  return max;
}

function mergeTagMetadata(
  previous: HanjaTagMetadata | undefined,
  incoming: HanjaTagMetadata,
): HanjaTagMetadata {
  if (!previous) {
    return incoming;
  }

  return {
    tags: uniqueNonEmpty([...previous.tags, ...incoming.tags]),
    riskFlags: uniqueNonEmpty([...previous.riskFlags, ...incoming.riskFlags]),
    tagPriorityScore: Math.max(previous.tagPriorityScore, incoming.tagPriorityScore),
  };
}

async function resolveHanjaTagsPath(
  sourcePath: string,
  options: LoadHanjaDatasetOptions,
): Promise<string | null> {
  const fromOption = options.hanjaTagsPath?.trim();
  if (fromOption) {
    const absolute = resolve(process.cwd(), fromOption);
    if (await fileExists(absolute)) {
      return absolute;
    }
    throw new Error(`[loadHanjaDataset] hanjaTagsPath 파일을 찾지 못했습니다: ${absolute}`);
  }

  const fromEnv = process.env.HANJA_TAGS_PATH?.trim();
  if (fromEnv) {
    const absolute = resolve(process.cwd(), fromEnv);
    if (await fileExists(absolute)) {
      return absolute;
    }
    throw new Error(`[loadHanjaDataset] HANJA_TAGS_PATH 파일을 찾지 못했습니다: ${absolute}`);
  }

  const sourceDir = dirname(sourcePath);
  for (const dir of buildSearchDirs(sourceDir)) {
    const candidate = resolve(dir, DEFAULT_HANJA_TAGS_FILENAME);
    if (await fileExists(candidate)) {
      return candidate;
    }
  }

  return null;
}

async function loadHanjaTagMetadataMap(
  sourcePath: string,
  options: LoadHanjaDatasetOptions,
): Promise<Map<string, HanjaTagMetadata>> {
  const tagPath = await resolveHanjaTagsPath(sourcePath, options);
  if (!tagPath) {
    console.info("[loadHanjaDataset] hanja_tags.jsonl not found; continue without curated tags");
    return new Map();
  }

  const text = await readFile(tagPath, "utf8");
  const map = new Map<string, HanjaTagMetadata>();
  let parseFailed = 0;
  let skipped = 0;

  for (const rawLine of text.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line) {
      continue;
    }

    let raw: RawHanjaTagRow;
    try {
      raw = JSON.parse(line) as RawHanjaTagRow;
    } catch {
      parseFailed += 1;
      continue;
    }

    const hanja = normalizeSingleHanja(raw.char);
    if (!hanja) {
      skipped += 1;
      continue;
    }

    const metadata: HanjaTagMetadata = {
      tags: toStringArray(raw.tags),
      riskFlags: toStringArray(raw.riskFlags),
      tagPriorityScore: toTagPriorityScore(raw.tagScores),
    };

    map.set(hanja, mergeTagMetadata(map.get(hanja), metadata));
  }

  if (parseFailed > 0) {
    console.warn(`[loadHanjaDataset] hanja_tags 파싱 실패 라인 수: ${parseFailed}`);
  }

  console.info(
    `[loadHanjaDataset] hanja_tags loaded=${map.size} skipped=${skipped} parseFailed=${parseFailed} path=${tagPath}`,
  );

  return map;
}

function normalizeSingleHanja(value: unknown): string {
  const text = String(value ?? "").trim();
  if (!text) {
    return "";
  }

  const codePoints = Array.from(text);
  if (codePoints.length !== 1) {
    return "";
  }
  return codePoints[0];
}

function toUnicodeCodepoint(hanja: string): string {
  const codepoint = hanja.codePointAt(0);
  if (codepoint === undefined) {
    return "";
  }
  return `U+${codepoint.toString(16).toUpperCase()}`;
}

function normalizeReading(rawReading: string): string | null {
  const trimmed = rawReading.trim();
  if (!trimmed) {
    return null;
  }
  if (SINGLE_HANGUL_SYLLABLE_PATTERN.test(trimmed)) {
    return trimmed;
  }

  const syllables = Array.from(trimmed).filter((ch) => SINGLE_HANGUL_SYLLABLE_PATTERN.test(ch));
  if (syllables.length === 0) {
    return null;
  }
  return syllables[syllables.length - 1];
}

function toFiveElement(value: unknown): HanjaRow["elementPronunciation"] {
  const text = String(value ?? "").trim().toUpperCase();
  if (!text) {
    return undefined;
  }

  if (text.includes("목") || text === "WOOD") {
    return "WOOD";
  }
  if (text.includes("화") || text === "FIRE") {
    return "FIRE";
  }
  if (text.includes("토") || text === "EARTH") {
    return "EARTH";
  }
  if (text.includes("금") || text === "METAL") {
    return "METAL";
  }
  if (text.includes("수") || text === "WATER") {
    return "WATER";
  }
  return undefined;
}

function pushToReadingIndex(byReading: Map<string, HanjaRow[]>, row: HanjaRow): void {
  const current = byReading.get(row.reading);
  if (current) {
    current.push(row);
    return;
  }
  byReading.set(row.reading, [row]);
}

export async function loadHanjaDataset(
  sourcePath: string,
  options: LoadHanjaDatasetOptions = {},
): Promise<HanjaDataset> {
  let jsonlText: string;
  try {
    jsonlText = await readFile(sourcePath, "utf8");
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    throw new Error(`[loadHanjaDataset] JSONL 파일을 읽지 못했습니다: ${sourcePath} (${message})`);
  }

  const lines = jsonlText.split(/\r?\n/);
  const rows: HanjaRow[] = [];
  const byReading = new Map<string, HanjaRow[]>();
  const byHanja = new Map<string, HanjaRow>();
  const dedupeRows = new Set<string>();
  const tagMetadataByHanja = await loadHanjaTagMetadataMap(sourcePath, options);

  let parseFailed = 0;
  let skipped = 0;
  let normalizedReadingCount = 0;
  let duplicateRows = 0;

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line) {
      continue;
    }

    let raw: RawHannameMasterRow;
    try {
      raw = JSON.parse(line) as RawHannameMasterRow;
    } catch {
      parseFailed += 1;
      continue;
    }

    if (raw.isInmyong !== true) {
      skipped += 1;
      continue;
    }

    const hanja = normalizeSingleHanja(raw.char);
    if (!hanja) {
      skipped += 1;
      continue;
    }

    const inmyongReadings = toStringArray(raw.readings?.inmyong);
    if (inmyongReadings.length === 0) {
      skipped += 1;
      continue;
    }

    const inmyongMeanings = toStringArray(raw.meanings?.inmyong);
    const dictionaryMeanings = toStringArray(raw.meanings?.dictionary);
    const baseMeaningTags = uniqueNonEmpty(
      inmyongMeanings.length > 0 ? inmyongMeanings : dictionaryMeanings.slice(0, 3)
    );
    const tagMetadata = tagMetadataByHanja.get(hanja);
    const curatedTags = tagMetadata?.tags ?? [];
    const meaningTags = uniqueNonEmpty([...curatedTags, ...baseMeaningTags]);
    const meaningKw = baseMeaningTags[0] ?? curatedTags[0] ?? "";

    for (const rawReading of inmyongReadings) {
      const reading = normalizeReading(rawReading);
      if (!reading) {
        skipped += 1;
        continue;
      }
      if (reading !== rawReading.trim()) {
        normalizedReadingCount += 1;
      }

      const dedupeKey = `${hanja}|${reading}`;
      if (dedupeRows.has(dedupeKey)) {
        duplicateRows += 1;
        continue;
      }
      dedupeRows.add(dedupeKey);

      const row: HanjaRow = {
        unicode: toUnicodeCodepoint(hanja),
        hanja,
        reading,
        meaningKw,
        meaningTags,
        curatedTags,
        tagPriorityScore: tagMetadata?.tagPriorityScore ?? 0,
        riskFlags: tagMetadata?.riskFlags ?? [],
        elementPronunciation: toFiveElement(raw.elementPronunciation),
        elementResource: toFiveElement(raw.elementResource)
      };

      rows.push(row);
      pushToReadingIndex(byReading, row);

      if (!byHanja.has(hanja)) {
        byHanja.set(hanja, row);
      }
    }
  }

  if (parseFailed > 0) {
    console.warn(`[loadHanjaDataset] JSONL 파싱 실패 라인 수: ${parseFailed}`);
  }

  if (rows.length === 0) {
    throw new Error("[loadHanjaDataset] 유효한 레코드가 없습니다.");
  }

  console.info(
    `[loadHanjaDataset] loaded=${rows.length} uniqueHanja=${byHanja.size} readings=${byReading.size} skipped=${skipped} normalizedReadings=${normalizedReadingCount} duplicateRows=${duplicateRows}`
  );

  return {
    rows,
    byReading,
    byHanja
  };
}
