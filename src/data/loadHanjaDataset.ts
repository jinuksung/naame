import { readFile } from "node:fs/promises";
import { parse } from "csv-parse/sync";
import { HanjaDataset, HanjaRow } from "../types";

interface RawCsvRow {
  unicode?: string;
  hanja?: string;
  reading?: string;
  meaning_kw?: string;
  meaning_tags?: string;
}

function uniqueNonEmpty(values: string[]): string[] {
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

function parseMeaningTags(
  rawMeaningTags: string | undefined,
  meaningKw: string,
  hasMeaningTagsColumn: boolean
): string[] {
  const tagsSource = (rawMeaningTags ?? "").trim();
  if (tagsSource) {
    return uniqueNonEmpty(tagsSource.split("|"));
  }

  // meaning_tags가 없는 CSV도 동작하도록 meaning_kw를 단일 태그로 사용한다.
  if (!hasMeaningTagsColumn && meaningKw.trim()) {
    return uniqueNonEmpty([meaningKw]);
  }

  return [];
}

function pushToReadingIndex(byReading: Map<string, HanjaRow[]>, row: HanjaRow): void {
  const current = byReading.get(row.reading);
  if (current) {
    current.push(row);
    return;
  }
  byReading.set(row.reading, [row]);
}

export async function loadHanjaDataset(csvPath: string): Promise<HanjaDataset> {
  let csvText: string;
  try {
    csvText = await readFile(csvPath, "utf8");
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    throw new Error(`[loadHanjaDataset] CSV 파일을 읽지 못했습니다: ${csvPath} (${message})`);
  }

  let parsedRows: RawCsvRow[];
  try {
    parsedRows = parse(csvText, {
      columns: true,
      skip_empty_lines: true,
      trim: true,
      bom: true
    }) as RawCsvRow[];
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    throw new Error(`[loadHanjaDataset] CSV 파싱에 실패했습니다: ${message}`);
  }

  if (parsedRows.length === 0) {
    throw new Error("[loadHanjaDataset] CSV 데이터가 비어 있습니다.");
  }

  const hasMeaningTagsColumn = Object.prototype.hasOwnProperty.call(parsedRows[0], "meaning_tags");
  if (!hasMeaningTagsColumn) {
    console.warn(
      "[loadHanjaDataset] meaning_tags 컬럼이 없어 meaning_kw를 fallback 태그로 사용합니다."
    );
  }

  const rows: HanjaRow[] = [];
  const byReading = new Map<string, HanjaRow[]>();
  const byHanja = new Map<string, HanjaRow>();

  let skipped = 0;
  let duplicateHanja = 0;

  for (const raw of parsedRows) {
    const unicode = String(raw.unicode ?? "").trim();
    const hanja = String(raw.hanja ?? "").trim();
    const reading = String(raw.reading ?? "").trim();
    const meaningKw = String(raw.meaning_kw ?? "").trim();

    if (!unicode || !hanja || !reading) {
      skipped += 1;
      continue;
    }

    const meaningTags = parseMeaningTags(raw.meaning_tags, meaningKw, hasMeaningTagsColumn);
    const row: HanjaRow = {
      unicode,
      hanja,
      reading,
      meaningKw,
      meaningTags
    };

    rows.push(row);
    pushToReadingIndex(byReading, row);

    if (byHanja.has(hanja)) {
      duplicateHanja += 1;
    } else {
      byHanja.set(hanja, row);
    }
  }

  if (rows.length === 0) {
    throw new Error("[loadHanjaDataset] 유효한 레코드가 없습니다.");
  }

  console.info(
    `[loadHanjaDataset] loaded=${rows.length} skipped=${skipped} readings=${byReading.size} duplicateHanja=${duplicateHanja}`
  );

  return {
    rows,
    byReading,
    byHanja
  };
}
