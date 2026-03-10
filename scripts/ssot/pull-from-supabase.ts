import {
  normalizeRawTableRows,
  resolveSupabaseConfig,
  selectColumnsForSpec,
  SSOT_DATASET_SPECS,
  SsotDatasetSpec,
  SupabaseConfig,
  SsotTableRow,
  writeRowsByTableToLocal,
} from "./common";

const SSOT_PULL_INCLUDE_NOT_INMYONG = "SSOT_PULL_INCLUDE_NOT_INMYONG";
const HANNAME_TABLE = "ssot_hanname_master";
const SURNAME_TABLE = "ssot_surname_map";
const HANNAME_ELEMENT_CHUNK_SIZE = 120;

interface ElementPair {
  elementPronunciation: string | null;
  elementResource: string | null;
}

interface SurnameElementEnrichResult {
  updated: number;
  remainingMissingChars: string[];
}

function parseBoolean(value: string | undefined): boolean {
  if (!value) {
    return false;
  }
  const normalized = value.trim().toLowerCase();
  return normalized === "1" || normalized === "true" || normalized === "yes";
}

function shouldFilterToInmyong(spec: SsotDatasetSpec): boolean {
  if (spec.dataset !== "hanname_master") {
    return false;
  }
  return !parseBoolean(process.env[SSOT_PULL_INCLUDE_NOT_INMYONG]);
}

function normalizeText(value: unknown): string | null {
  if (typeof value !== "string") {
    return null;
  }
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function isMissingElement(value: unknown): boolean {
  return normalizeText(value) == null;
}

function elementCompleteness(pair: ElementPair): number {
  return (pair.elementPronunciation ? 1 : 0) + (pair.elementResource ? 1 : 0);
}

function chooseBetterElementPair(
  current: (ElementPair & { isInmyong: boolean }) | null,
  next: (ElementPair & { isInmyong: boolean }),
): (ElementPair & { isInmyong: boolean }) {
  if (!current) {
    return next;
  }
  const currentScore = elementCompleteness(current) * 10 + (current.isInmyong ? 1 : 0);
  const nextScore = elementCompleteness(next) * 10 + (next.isInmyong ? 1 : 0);
  return nextScore > currentScore ? next : current;
}

function buildHannameElementMap(rows: SsotTableRow[]): Map<string, ElementPair> {
  const candidates = new Map<string, ElementPair & { isInmyong: boolean }>();

  for (const row of rows) {
    const char = normalizeText(row.char);
    if (!char) {
      continue;
    }

    const pair = {
      elementPronunciation: normalizeText(row.element_pronunciation),
      elementResource: normalizeText(row.element_resource),
      isInmyong: row.is_inmyong === true,
    };

    if (elementCompleteness(pair) === 0) {
      continue;
    }

    const current = candidates.get(char) ?? null;
    candidates.set(char, chooseBetterElementPair(current, pair));
  }

  const out = new Map<string, ElementPair>();
  for (const [char, pair] of candidates.entries()) {
    out.set(char, {
      elementPronunciation: pair.elementPronunciation,
      elementResource: pair.elementResource,
    });
  }
  return out;
}

function collectMissingSurnameChars(rows: SsotTableRow[]): string[] {
  const out = new Set<string>();
  for (const row of rows) {
    const hanja = normalizeText(row.hanja);
    if (!hanja) {
      continue;
    }
    if (!isMissingElement(row.element_pronunciation) && !isMissingElement(row.element_resource)) {
      continue;
    }
    for (const char of Array.from(hanja)) {
      const normalized = normalizeText(char);
      if (normalized) {
        out.add(normalized);
      }
    }
  }
  return [...out];
}

function resolveSurnameElementPair(hanja: string, elementByChar: Map<string, ElementPair>): ElementPair | null {
  const direct = elementByChar.get(hanja);
  if (direct) {
    return direct;
  }

  const chars = Array.from(hanja);
  if (chars.length <= 1) {
    return null;
  }

  let elementPronunciation: string | null = null;
  let elementResource: string | null = null;

  for (const char of chars) {
    const pair = elementByChar.get(char);
    if (!pair) {
      continue;
    }
    if (!elementPronunciation && pair.elementPronunciation) {
      elementPronunciation = pair.elementPronunciation;
    }
    if (!elementResource && pair.elementResource) {
      elementResource = pair.elementResource;
    }
  }

  if (!elementPronunciation && !elementResource) {
    return null;
  }

  return {
    elementPronunciation,
    elementResource,
  };
}

function applyElementMapToSurnameRows(rows: SsotTableRow[], elementByChar: Map<string, ElementPair>): number {
  let updated = 0;
  for (const row of rows) {
    const hanja = normalizeText(row.hanja);
    if (!hanja) {
      continue;
    }
    const pair = resolveSurnameElementPair(hanja, elementByChar);
    if (!pair) {
      continue;
    }

    if (isMissingElement(row.element_pronunciation) && pair.elementPronunciation) {
      row.element_pronunciation = pair.elementPronunciation;
      updated += 1;
    }
    if (isMissingElement(row.element_resource) && pair.elementResource) {
      row.element_resource = pair.elementResource;
      updated += 1;
    }
  }
  return updated;
}

export function enrichSurnameRowsFromHannameRows(
  surnameRows: SsotTableRow[],
  hannameRows: SsotTableRow[],
): SurnameElementEnrichResult {
  const updated = applyElementMapToSurnameRows(surnameRows, buildHannameElementMap(hannameRows));
  return {
    updated,
    remainingMissingChars: collectMissingSurnameChars(surnameRows),
  };
}

function chunk<T>(items: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < items.length; i += size) {
    out.push(items.slice(i, i + size));
  }
  return out;
}

async function fetchHannameElementRowsByChars(
  config: SupabaseConfig,
  chars: string[],
): Promise<SsotTableRow[]> {
  const normalizedChars = Array.from(
    new Set(chars.map((item) => item.trim()).filter((item) => item.length > 0)),
  );
  if (normalizedChars.length === 0) {
    return [];
  }

  const rows: SsotTableRow[] = [];
  const charChunks = chunk(normalizedChars, HANNAME_ELEMENT_CHUNK_SIZE);

  for (const charChunk of charChunks) {
    const encodedChars = charChunk.map((item) => `"${item.replace(/"/g, "\\\"")}"`).join(",");
    const params = new URLSearchParams({
      select: "row_index,char,is_inmyong,element_pronunciation,element_resource",
      order: "row_index.asc",
      limit: "1000",
      char: `in.(${encodedChars})`,
    });
    const endpoint = `${config.baseUrl}/rest/v1/${HANNAME_TABLE}?${params.toString()}`;
    const response = await fetch(endpoint, {
      method: "GET",
      headers: {
        apikey: config.serviceRoleKey,
        Authorization: `Bearer ${config.serviceRoleKey}`,
      },
    });

    if (!response.ok) {
      const body = await response.text();
      throw new Error(`[ssot:pull] failed element supplement table=${HANNAME_TABLE}: ${response.status} ${body}`);
    }

    const payload = (await response.json()) as unknown;
    rows.push(...normalizeRawTableRows(payload));
  }

  return rows;
}

export function buildPullEndpoint(
  config: SupabaseConfig,
  spec: SsotDatasetSpec,
  select: string,
  offset: number,
  pageSize: number,
): string {
  const params = new URLSearchParams({
    select,
    order: "row_index.asc",
    offset: String(offset),
    limit: String(pageSize),
  });
  if (shouldFilterToInmyong(spec)) {
    params.set("is_inmyong", "is.true");
  }
  return `${config.baseUrl}/rest/v1/${spec.table}?${params.toString()}`;
}

export async function pullRows(): Promise<void> {
  const config = resolveSupabaseConfig();
  const rowsByTable = new Map<string, SsotTableRow[]>();
  let totalRows = 0;
  if (!parseBoolean(process.env[SSOT_PULL_INCLUDE_NOT_INMYONG])) {
    console.log(
      `[ssot:pull] hanname_master filter enabled (is_inmyong=true). Set ${SSOT_PULL_INCLUDE_NOT_INMYONG}=1 to include false rows.`,
    );
  }

  for (const spec of SSOT_DATASET_SPECS) {
    const select = selectColumnsForSpec(spec);
    const pageSize = 1000;
    const rows: SsotTableRow[] = [];
    let offset = 0;

    while (true) {
      const endpoint = buildPullEndpoint(config, spec, select, offset, pageSize);
      const response = await fetch(endpoint, {
        method: "GET",
        headers: {
          apikey: config.serviceRoleKey,
          Authorization: `Bearer ${config.serviceRoleKey}`,
        },
      });

      if (!response.ok) {
        const body = await response.text();
        throw new Error(`[ssot:pull] failed table=${spec.table}: ${response.status} ${body}`);
      }

      const payload = (await response.json()) as unknown;
      const pageRows = normalizeRawTableRows(payload);
      rows.push(...pageRows);
      if (pageRows.length < pageSize) {
        break;
      }
      offset += pageSize;
    }

    if (rows.length === 0 && !spec.allowEmpty) {
      throw new Error(`[ssot:pull] missing rows in table=${spec.table}`);
    }
    rowsByTable.set(spec.table, rows);
    totalRows += rows.length;
  }

  const hannameRows = rowsByTable.get(HANNAME_TABLE);
  const surnameRows = rowsByTable.get(SURNAME_TABLE);
  if (hannameRows && surnameRows) {
    const initial = enrichSurnameRowsFromHannameRows(surnameRows, hannameRows);
    let totalUpdated = initial.updated;
    let remainingMissingChars = initial.remainingMissingChars;

    const hannameSpec = SSOT_DATASET_SPECS.find((spec) => spec.dataset === "hanname_master");
    if (hannameSpec && shouldFilterToInmyong(hannameSpec) && remainingMissingChars.length > 0) {
      const supplementalRows = await fetchHannameElementRowsByChars(config, remainingMissingChars);
      if (supplementalRows.length > 0) {
        const supplement = enrichSurnameRowsFromHannameRows(surnameRows, supplementalRows);
        totalUpdated += supplement.updated;
        remainingMissingChars = supplement.remainingMissingChars;
      }
    }

    if (totalUpdated > 0 || remainingMissingChars.length > 0) {
      console.log(
        `[ssot:pull] surname element enrichment updated=${totalUpdated} missing=${remainingMissingChars.length}`,
      );
    }
  }

  const written = await writeRowsByTableToLocal(rowsByTable);
  console.log(`[ssot:pull] tables=${SSOT_DATASET_SPECS.length} rows=${totalRows}`);
  for (const filePath of written) {
    console.log(`[ssot:pull] wrote ${filePath}`);
  }
}

if (require.main === module) {
  pullRows().catch((error) => {
    console.error(error);
    process.exit(1);
  });
}
