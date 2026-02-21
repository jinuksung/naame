import { access, readFile } from "node:fs/promises";
import { resolve } from "node:path";
import type { RecommendElement, SurnameHanjaOption } from "../types/recommend";
import { normalizeHangulReading } from "../lib/korean/normalizeHangulReading";
import {
  ensureSupabaseSsotSnapshot
} from "./supabaseSsotSnapshot";

interface RawSurnameMapRow {
  surnameReading?: unknown;
  hanja?: unknown;
  isDefault?: unknown;
  popularityRank?: unknown;
  elementPronunciation?: unknown;
  elementResource?: unknown;
}

export interface SurnameHanjaResolution {
  options: SurnameHanjaOption[];
  defaultHanja: string | null;
  selectedHanja: string | null;
}

const DEFAULT_SURNAME_MAP_FILENAME = "surname_map.jsonl";
const SURNAME_SSOT_REQUIRED_PATHS = [DEFAULT_SURNAME_MAP_FILENAME];
const MAX_HANJA_LENGTH = 2;
let surnameMapPromise: Promise<Map<string, SurnameHanjaOption[]>> | null = null;
let surnameMapVersionSignature: string | null = null;

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

function buildSearchDirs(cwd: string): string[] {
  return uniquePaths([
    cwd,
    resolve(cwd, ".."),
    resolve(cwd, "../.."),
    resolve(cwd, "../../..")
  ]);
}

async function resolveSurnameMapPath(): Promise<string> {
  const envPath = process.env.SURNAME_MAP_PATH?.trim();
  if (envPath) {
    const resolvedEnvPath = resolve(process.cwd(), envPath);
    if (await fileExists(resolvedEnvPath)) {
      return resolvedEnvPath;
    }
    throw new Error(`[loadSurnameMap] SURNAME_MAP_PATH 파일이 존재하지 않습니다: ${resolvedEnvPath}`);
  }

  for (const dir of buildSearchDirs(process.cwd())) {
    const candidate = resolve(dir, DEFAULT_SURNAME_MAP_FILENAME);
    if (await fileExists(candidate)) {
      return candidate;
    }
  }

  throw new Error(
    `[loadSurnameMap] ${DEFAULT_SURNAME_MAP_FILENAME} 파일을 찾지 못했습니다. SURNAME_MAP_PATH를 지정하세요.`
  );
}

function normalizeReading(value: unknown): string {
  if (typeof value !== "string") {
    return "";
  }
  return normalizeHangulReading(value);
}

function normalizeHanja(value: unknown): string {
  const text = typeof value === "string" ? value : String(value ?? "");
  const normalized = text.trim().normalize("NFC");
  if (!normalized) {
    return "";
  }

  const chars = Array.from(normalized);
  if (chars.length < 1 || chars.length > MAX_HANJA_LENGTH) {
    return "";
  }
  return chars.join("");
}

function toPopularityRank(value: unknown): number {
  if (typeof value === "number" && Number.isInteger(value) && value > 0) {
    return value;
  }
  return Number.MAX_SAFE_INTEGER;
}

function toRecommendElement(value: unknown): RecommendElement | undefined {
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

function sortOptions(options: SurnameHanjaOption[]): SurnameHanjaOption[] {
  return options.sort((a, b) => {
    if (a.isDefault !== b.isDefault) {
      return a.isDefault ? -1 : 1;
    }
    if (a.popularityRank !== b.popularityRank) {
      return a.popularityRank - b.popularityRank;
    }
    return a.hanja.localeCompare(b.hanja, "ko");
  });
}

function cloneOptions(options: SurnameHanjaOption[]): SurnameHanjaOption[] {
  return options.map((option) => ({ ...option }));
}

async function loadSurnameMap(sourcePath: string): Promise<Map<string, SurnameHanjaOption[]>> {
  let text: string;
  try {
    text = await readFile(sourcePath, "utf8");
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    throw new Error(`[loadSurnameMap] 파일을 읽지 못했습니다: ${sourcePath} (${message})`);
  }

  const byReading = new Map<string, SurnameHanjaOption[]>();
  let parseFailed = 0;
  let skipped = 0;

  for (const rawLine of text.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line) {
      continue;
    }

    let raw: RawSurnameMapRow;
    try {
      raw = JSON.parse(line) as RawSurnameMapRow;
    } catch {
      parseFailed += 1;
      continue;
    }

    const surnameReading = normalizeReading(raw.surnameReading);
    const hanja = normalizeHanja(raw.hanja);
    if (!surnameReading || !hanja) {
      skipped += 1;
      continue;
    }
    const elementPronunciation = toRecommendElement(raw.elementPronunciation);
    const elementResource = toRecommendElement(raw.elementResource);

    const option: SurnameHanjaOption = {
      hanja,
      isDefault: raw.isDefault === true,
      popularityRank: toPopularityRank(raw.popularityRank),
      ...(elementPronunciation ? { elementPronunciation } : {}),
      ...(elementResource ? { elementResource } : {}),
    };

    const options = byReading.get(surnameReading) ?? [];
    const existingIndex = options.findIndex((item) => item.hanja === hanja);
    if (existingIndex >= 0) {
      const existing = options[existingIndex];
      options[existingIndex] = {
        hanja,
        isDefault: existing.isDefault || option.isDefault,
        popularityRank: Math.min(existing.popularityRank, option.popularityRank),
        ...(existing.elementPronunciation || option.elementPronunciation
          ? { elementPronunciation: existing.elementPronunciation ?? option.elementPronunciation }
          : {}),
        ...(existing.elementResource || option.elementResource
          ? { elementResource: existing.elementResource ?? option.elementResource }
          : {}),
      };
    } else {
      options.push(option);
    }
    byReading.set(surnameReading, options);
  }

  for (const [reading, options] of byReading) {
    byReading.set(reading, sortOptions(options));
  }

  if (parseFailed > 0) {
    console.warn(`[loadSurnameMap] JSONL 파싱 실패 라인 수: ${parseFailed}`);
  }

  console.info(
    `[loadSurnameMap] readings=${byReading.size} skipped=${skipped} parseFailed=${parseFailed}`
  );

  return byReading;
}

async function getSurnameMap(): Promise<Map<string, SurnameHanjaOption[]>> {
  const snapshot = await ensureSupabaseSsotSnapshot({
    requiredPaths: SURNAME_SSOT_REQUIRED_PATHS
  });
  const nextSignature = snapshot.versionSignature ?? snapshot.source;
  if (surnameMapPromise && surnameMapVersionSignature === nextSignature) {
    return surnameMapPromise;
  }

  surnameMapPromise = (async () => {
    const sourcePath = await resolveSurnameMapPath();
    return loadSurnameMap(sourcePath);
  })().catch((error) => {
    surnameMapPromise = null;
    surnameMapVersionSignature = null;
    throw error;
  });
  surnameMapVersionSignature = nextSignature;

  return surnameMapPromise;
}

export function resetSurnameMapCacheForRuntime(): void {
  surnameMapPromise = null;
  surnameMapVersionSignature = null;
}

export async function getSurnameHanjaOptions(surnameReading: string): Promise<SurnameHanjaOption[]> {
  const reading = normalizeReading(surnameReading);
  if (!reading) {
    return [];
  }
  const map = await getSurnameMap();
  return cloneOptions(map.get(reading) ?? []);
}

export function pickDefaultSurnameHanja(options: SurnameHanjaOption[]): string | null {
  const explicitDefault = options.find((option) => option.isDefault);
  if (explicitDefault) {
    return explicitDefault.hanja;
  }
  return options[0]?.hanja ?? null;
}

export async function resolveSurnameHanjaSelection(
  surnameReading: string,
  requestedHanja?: string
): Promise<SurnameHanjaResolution> {
  const options = await getSurnameHanjaOptions(surnameReading);
  const defaultHanja = pickDefaultSurnameHanja(options);
  const normalizedRequested = normalizeHanja(requestedHanja);
  const selectedFromRequest =
    normalizedRequested && options.some((option) => option.hanja === normalizedRequested)
      ? normalizedRequested
      : null;

  return {
    options,
    defaultHanja,
    selectedHanja: selectedFromRequest ?? defaultHanja
  };
}

interface SurnameReadingCandidate {
  surnameReading: string;
  isDefault: boolean;
  popularityRank: number;
}

export async function resolveSurnameReadingByHanja(hanja: string): Promise<string | null> {
  const normalizedHanja = normalizeHanja(hanja);
  if (!normalizedHanja) {
    return null;
  }

  const map = await getSurnameMap();
  const candidates: SurnameReadingCandidate[] = [];

  for (const [surnameReading, options] of map.entries()) {
    for (const option of options) {
      if (option.hanja !== normalizedHanja) {
        continue;
      }
      candidates.push({
        surnameReading,
        isDefault: option.isDefault,
        popularityRank: option.popularityRank
      });
    }
  }

  if (candidates.length === 0) {
    return null;
  }

  candidates.sort((a, b) => {
    if (a.isDefault !== b.isDefault) {
      return a.isDefault ? -1 : 1;
    }
    if (a.popularityRank !== b.popularityRank) {
      return a.popularityRank - b.popularityRank;
    }
    return a.surnameReading.localeCompare(b.surnameReading, "ko");
  });

  return candidates[0]?.surnameReading ?? null;
}

interface SurnameElementCandidate {
  element: RecommendElement;
  isDefault: boolean;
  popularityRank: number;
  hasResource: boolean;
}

export async function resolveSurnameElementByHanja(hanja: string): Promise<RecommendElement | null> {
  const normalizedHanja = normalizeHanja(hanja);
  if (!normalizedHanja) {
    return null;
  }

  const map = await getSurnameMap();
  const candidates: SurnameElementCandidate[] = [];

  for (const options of map.values()) {
    for (const option of options) {
      if (option.hanja !== normalizedHanja) {
        continue;
      }

      const element = option.elementResource ?? option.elementPronunciation;
      if (!element) {
        continue;
      }

      candidates.push({
        element,
        isDefault: option.isDefault,
        popularityRank: option.popularityRank,
        hasResource: Boolean(option.elementResource),
      });
    }
  }

  if (candidates.length === 0) {
    return null;
  }

  candidates.sort((a, b) => {
    if (a.isDefault !== b.isDefault) {
      return a.isDefault ? -1 : 1;
    }
    if (a.popularityRank !== b.popularityRank) {
      return a.popularityRank - b.popularityRank;
    }
    if (a.hasResource !== b.hasResource) {
      return a.hasResource ? -1 : 1;
    }
    return a.element.localeCompare(b.element);
  });

  return candidates[0]?.element ?? null;
}
