import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

export type PriorGenderKey = "M" | "F" | "ALL";

export interface TopNameItem {
  name: string;
  gender: "M" | "F";
}

export interface TopNameSourceData {
  items?: TopNameItem[];
  byGender?: {
    M?: string[];
    F?: string[];
  };
}

export interface PriorIndex {
  syllableSetByGender: Record<PriorGenderKey, Set<string>>;
  syllableFreqByGender: Record<PriorGenderKey, Map<string, number>>;
  bigramSetByGender: Record<PriorGenderKey, Set<string>>;
  bigramFreqByGender: Record<PriorGenderKey, Map<string, number>>;
  totalCountsByGender: Record<PriorGenderKey, number>;
}

const TWO_SYLLABLE_HANGUL_PATTERN = /^[가-힣]{2}$/;
const DEFAULT_PRIOR_FILE_CANDIDATES = [
  "birth_registered_names_gender.jsonl",
  "birth_registered_names_gender.json",
  "top_names.json"
] as const;

let cachedPriorPath: string | null = null;
let cachedPriorIndex: PriorIndex | null = null;

function createEmptyPriorIndex(): PriorIndex {
  return {
    syllableSetByGender: {
      M: new Set<string>(),
      F: new Set<string>(),
      ALL: new Set<string>()
    },
    syllableFreqByGender: {
      M: new Map<string, number>(),
      F: new Map<string, number>(),
      ALL: new Map<string, number>()
    },
    bigramSetByGender: {
      M: new Set<string>(),
      F: new Set<string>(),
      ALL: new Set<string>()
    },
    bigramFreqByGender: {
      M: new Map<string, number>(),
      F: new Map<string, number>(),
      ALL: new Map<string, number>()
    },
    totalCountsByGender: {
      M: 0,
      F: 0,
      ALL: 0
    }
  };
}

function buildSearchDirs(cwd: string): string[] {
  return Array.from(
    new Set([cwd, resolve(cwd, ".."), resolve(cwd, "../.."), resolve(cwd, "../../..")])
  );
}

function toValidTwoSyllableName(value: unknown): string | null {
  if (typeof value !== "string") {
    return null;
  }
  const name = value.trim();
  if (!TWO_SYLLABLE_HANGUL_PATTERN.test(name)) {
    return null;
  }
  return name;
}

function mergeByGenderList(base: string[], supplement: string[]): string[] {
  const out = [...base];
  for (const name of supplement) {
    out.push(name);
  }
  return out;
}

function parseJsonObjectAsSourceData(parsed: unknown): TopNameSourceData {
  if (Array.isArray(parsed)) {
    const items = parsed.filter((row): row is TopNameItem => {
      if (!row || typeof row !== "object") {
        return false;
      }
      const item = row as Partial<TopNameItem>;
      return (
        (item.gender === "M" || item.gender === "F") &&
        typeof item.name === "string" &&
        item.name.length > 0
      );
    });
    return { items };
  }

  if (!parsed || typeof parsed !== "object") {
    return {};
  }

  const data = parsed as TopNameSourceData;
  const byGender = {
    M: Array.isArray(data.byGender?.M) ? data.byGender?.M : [],
    F: Array.isArray(data.byGender?.F) ? data.byGender?.F : []
  };
  const items = Array.isArray(data.items)
    ? data.items.filter((item): item is TopNameItem => {
        if (!item || typeof item !== "object") {
          return false;
        }
        return (
          typeof item.name === "string" &&
          (item.gender === "M" || item.gender === "F")
        );
      })
    : [];

  return {
    byGender: {
      M: byGender.M,
      F: byGender.F
    },
    items
  };
}

function parseJsonlAsSourceData(raw: string): TopNameSourceData {
  const byGenderM: string[] = [];
  const byGenderF: string[] = [];
  const items: TopNameItem[] = [];

  for (const line of raw.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed) {
      continue;
    }

    try {
      const parsed = JSON.parse(trimmed) as unknown;
      if (parsed && typeof parsed === "object") {
        const asObject = parseJsonObjectAsSourceData(parsed);
        if (Array.isArray(asObject.byGender?.M)) {
          byGenderM.push(...asObject.byGender.M);
        }
        if (Array.isArray(asObject.byGender?.F)) {
          byGenderF.push(...asObject.byGender.F);
        }
        if (Array.isArray(asObject.items)) {
          items.push(...asObject.items);
          continue;
        }

        const item = parsed as Partial<TopNameItem>;
        if (
          typeof item.name === "string" &&
          (item.gender === "M" || item.gender === "F")
        ) {
          items.push({ name: item.name, gender: item.gender });
        }
      }
    } catch {
      // ignore malformed lines
    }
  }

  return {
    byGender: {
      M: byGenderM,
      F: byGenderF
    },
    items
  };
}

function parseSourceDataFromRaw(raw: string): TopNameSourceData {
  const trimmed = raw.trim();
  if (!trimmed) {
    return {};
  }

  if (trimmed.startsWith("{") || trimmed.startsWith("[")) {
    return parseJsonObjectAsSourceData(JSON.parse(trimmed));
  }

  return parseJsonlAsSourceData(raw);
}

function addSyllableFrequency(target: Map<string, number>, s1: string, s2: string): void {
  target.set(s1, (target.get(s1) ?? 0) + 1);
  target.set(s2, (target.get(s2) ?? 0) + 1);
}

function addBigramFrequency(target: Map<string, number>, name: string): void {
  target.set(name, (target.get(name) ?? 0) + 1);
}

function buildNamesByGender(data: TopNameSourceData): { M: string[]; F: string[] } {
  const byGenderMRaw = Array.isArray(data.byGender?.M) ? data.byGender.M : [];
  const byGenderFRaw = Array.isArray(data.byGender?.F) ? data.byGender.F : [];

  const byGenderM = byGenderMRaw
    .map((name) => toValidTwoSyllableName(name))
    .filter((name): name is string => Boolean(name));
  const byGenderF = byGenderFRaw
    .map((name) => toValidTwoSyllableName(name))
    .filter((name): name is string => Boolean(name));

  const byGenderMSet = new Set(byGenderM);
  const byGenderFSet = new Set(byGenderF);
  const hasByGenderM = byGenderMRaw.length > 0;
  const hasByGenderF = byGenderFRaw.length > 0;

  const supplementM: string[] = [];
  const supplementF: string[] = [];
  for (const item of data.items ?? []) {
    const name = toValidTwoSyllableName(item?.name);
    if (!name) {
      continue;
    }
    if (item.gender === "M") {
      if (hasByGenderM && byGenderMSet.has(name)) {
        continue;
      }
      supplementM.push(name);
      continue;
    }
    if (item.gender === "F") {
      if (hasByGenderF && byGenderFSet.has(name)) {
        continue;
      }
      supplementF.push(name);
    }
  }

  return {
    M: mergeByGenderList(byGenderM, supplementM),
    F: mergeByGenderList(byGenderF, supplementF)
  };
}

function fillIndexForGender(index: PriorIndex, gender: "M" | "F", names: string[]): void {
  for (const name of names) {
    const s1 = name[0];
    const s2 = name[1];

    index.syllableSetByGender[gender].add(s1);
    index.syllableSetByGender[gender].add(s2);
    addSyllableFrequency(index.syllableFreqByGender[gender], s1, s2);

    index.bigramSetByGender[gender].add(name);
    addBigramFrequency(index.bigramFreqByGender[gender], name);
    index.totalCountsByGender[gender] += 1;
  }
}

function fillAllIndex(index: PriorIndex): void {
  const genders: Array<"M" | "F"> = ["M", "F"];
  for (const gender of genders) {
    for (const name of index.bigramFreqByGender[gender].keys()) {
      index.bigramSetByGender.ALL.add(name);
    }
    for (const syllable of index.syllableSetByGender[gender].values()) {
      index.syllableSetByGender.ALL.add(syllable);
    }
    for (const [syllable, count] of index.syllableFreqByGender[gender]) {
      index.syllableFreqByGender.ALL.set(
        syllable,
        (index.syllableFreqByGender.ALL.get(syllable) ?? 0) + count
      );
    }
    for (const [name, count] of index.bigramFreqByGender[gender]) {
      index.bigramFreqByGender.ALL.set(
        name,
        (index.bigramFreqByGender.ALL.get(name) ?? 0) + count
      );
    }
    index.totalCountsByGender.ALL += index.totalCountsByGender[gender];
  }
}

export function buildNamePriorIndex(data: TopNameSourceData): PriorIndex {
  const index = createEmptyPriorIndex();
  const namesByGender = buildNamesByGender(data);

  fillIndexForGender(index, "M", namesByGender.M);
  fillIndexForGender(index, "F", namesByGender.F);
  fillAllIndex(index);

  return index;
}

export function resolveNamePriorPath(cwd: string = process.cwd()): string | null {
  const fromEnv = process.env.NAME_PRIOR_PATH?.trim();
  if (fromEnv) {
    return resolve(cwd, fromEnv);
  }

  for (const dir of buildSearchDirs(cwd)) {
    for (const candidate of DEFAULT_PRIOR_FILE_CANDIDATES) {
      const absolute = resolve(dir, candidate);
      if (existsSync(absolute)) {
        return absolute;
      }
    }
  }

  return null;
}

export function buildNamePriorIndexFromFile(path?: string): PriorIndex {
  const resolved = path ? resolve(path) : resolveNamePriorPath();
  if (!resolved || !existsSync(resolved)) {
    return createEmptyPriorIndex();
  }

  const raw = readFileSync(resolved, "utf8");
  const sourceData = parseSourceDataFromRaw(raw);
  return buildNamePriorIndex(sourceData);
}

export function loadNamePriorIndex(path?: string): PriorIndex {
  const resolvedPath = path ? resolve(path) : resolveNamePriorPath();
  const cacheKey = resolvedPath ?? "__empty__";

  if (cachedPriorPath === cacheKey && cachedPriorIndex) {
    return cachedPriorIndex;
  }

  const index = buildNamePriorIndexFromFile(resolvedPath ?? undefined);
  cachedPriorPath = cacheKey;
  cachedPriorIndex = index;
  return index;
}
