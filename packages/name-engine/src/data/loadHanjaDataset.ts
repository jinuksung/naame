import { readFile } from "node:fs/promises";
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

const SINGLE_HANGUL_SYLLABLE_PATTERN = /^[가-힣]$/;

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

export async function loadHanjaDataset(sourcePath: string): Promise<HanjaDataset> {
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
    const meaningTags = uniqueNonEmpty(
      inmyongMeanings.length > 0 ? inmyongMeanings : dictionaryMeanings.slice(0, 3)
    );
    const meaningKw = meaningTags[0] ?? "";

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
