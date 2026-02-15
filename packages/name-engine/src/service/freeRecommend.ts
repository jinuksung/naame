import { access, readdir } from "node:fs/promises";
import { resolve } from "node:path";
import { loadHanjaDataset } from "../data/loadHanjaDataset";
import { resolveSurnameHanjaSelection } from "../data/loadSurnameMap";
import { ensureSupabaseSsotSnapshot } from "../data/supabaseSsotSnapshot";
import { recommendNames } from "../engine/recommend";
import { scoreSoundElement } from "../engine/scoring/soundElement";
import { normalizeHangulReading } from "../lib/korean/normalizeHangulReading";
import { buildMockResults } from "../mock";
import {
  FreeRecommendInput,
  FreeRecommendResponse,
  FreeRecommendResultItem
} from "../types/recommend";
import {
  FiveElement,
  Gender,
  HanjaDataset,
  RecommendationItem,
  RecommendRequest
} from "../types";

const DEFAULT_SOURCE_PATH = "hanname_master.jsonl";
const DEFAULT_TIMEZONE = "Asia/Seoul";
const DEFAULT_BASIC_MODE_BIRTH_DATE = "2000-01-01";
const FREE_LIMIT = 5;
const DISPLAY_SCORE_TOP = 96;
const DISPLAY_SCORE_MIN = 72;
const DISPLAY_SPREAD_MIN = 6;
const DISPLAY_SPREAD_MAX = 14;
const EXPLORE_SEED_MOD = 0x7fffffff;

let datasetPromise: Promise<HanjaDataset> | null = null;

interface RawPayload {
  surnameHangul?: unknown;
  surnameHanja?: unknown;
  birth?: {
    calendar?: unknown;
    date?: unknown;
    time?: unknown;
  };
  gender?: unknown;
  exploreSeed?: unknown;
}

export type FreeRecommendServiceResult =
  | {
      ok: true;
      response: FreeRecommendResponse;
      source: "engine" | "mock";
    }
  | {
      ok: false;
      status: number;
      error: string;
    };

function uniquePaths(paths: string[]): string[] {
  return Array.from(new Set(paths));
}

function buildSearchDirs(cwd: string): string[] {
  return uniquePaths([
    cwd,
    resolve(cwd, ".."),
    resolve(cwd, "../.."),
    resolve(cwd, "../../..")
  ]);
}

function isGender(value: unknown): value is FreeRecommendInput["gender"] {
  return value === "MALE" || value === "FEMALE" || value === "UNISEX";
}

function mapGenderToEngine(gender: FreeRecommendInput["gender"]): Gender {
  if (gender === "UNISEX") {
    return "ANY";
  }
  return gender;
}

function countChars(text: string): number {
  return Array.from(text).length;
}

function parseExploreSeed(value: unknown): number | undefined {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return undefined;
  }
  const integer = Math.max(1, Math.floor(value));
  const normalized = integer % EXPLORE_SEED_MOD;
  return normalized === 0 ? 1 : normalized;
}

function toInput(payload: RawPayload): FreeRecommendInput | null {
  const surnameHangul = normalizeHangulReading(
    typeof payload.surnameHangul === "string" ? payload.surnameHangul : ""
  );
  const surnameHanja =
    typeof payload.surnameHanja === "string" ? payload.surnameHanja.trim() : "";
  const calendar = payload.birth?.calendar;
  const date =
    typeof payload.birth?.date === "string" ? payload.birth.date.trim() : "";
  const time =
    typeof payload.birth?.time === "string" ? payload.birth.time.trim() : undefined;
  const exploreSeed = parseExploreSeed(payload.exploreSeed);

  if (countChars(surnameHangul) < 1 || countChars(surnameHangul) > 2) {
    return null;
  }
  if (surnameHanja && (countChars(surnameHanja) < 1 || countChars(surnameHanja) > 2)) {
    return null;
  }
  if (calendar !== undefined && calendar !== "SOLAR") {
    return null;
  }
  if (date && !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return null;
  }
  if (!isGender(payload.gender)) {
    return null;
  }
  if (time && !/^\d{2}:\d{2}$/.test(time)) {
    return null;
  }
  if (time && !date) {
    return null;
  }

  const birth = date
    ? {
        calendar: "SOLAR" as const,
        date,
        ...(time ? { time } : {})
      }
    : undefined;

  return {
    surnameHangul,
    surnameHanja,
    ...(birth ? { birth } : {}),
    gender: payload.gender,
    ...(exploreSeed ? { exploreSeed } : {})
  };
}

async function fileExists(path: string): Promise<boolean> {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
}

async function resolveDataPath(): Promise<string> {
  const cwd = process.cwd();
  const searchDirs = buildSearchDirs(cwd);

  const envSourcePath = process.env.DATA_SOURCE_PATH?.trim();
  if (envSourcePath) {
    const resolvedEnvPath = resolve(cwd, envSourcePath);
    if (await fileExists(resolvedEnvPath)) {
      return resolvedEnvPath;
    }
    throw new Error(
      `[recommendFree] DATA_SOURCE_PATH 파일이 존재하지 않습니다: ${resolvedEnvPath}`
    );
  }

  const legacyCsvPath = process.env.DATA_CSV_PATH?.trim();
  if (legacyCsvPath) {
    const resolvedLegacyPath = resolve(cwd, legacyCsvPath);
    if (await fileExists(resolvedLegacyPath)) {
      console.warn(
        "[recommendFree] DATA_CSV_PATH는 deprecated 입니다. DATA_SOURCE_PATH 사용을 권장합니다."
      );
      return resolvedLegacyPath;
    }
    throw new Error(
      `[recommendFree] DATA_CSV_PATH 파일이 존재하지 않습니다: ${resolvedLegacyPath}`
    );
  }

  for (const dir of searchDirs) {
    const candidate = resolve(dir, DEFAULT_SOURCE_PATH);
    if (await fileExists(candidate)) {
      return candidate;
    }
  }

  for (const dir of searchDirs) {
    const entries = await readdir(dir);
    const jsonlFiles = entries.filter((entry) => entry.toLowerCase().endsWith(".jsonl"));

    const normalizedDefault = DEFAULT_SOURCE_PATH.normalize("NFC");
    const normalizedMatch = jsonlFiles.find(
      (entry) => entry.normalize("NFC") === normalizedDefault
    );
    if (normalizedMatch) {
      return resolve(dir, normalizedMatch);
    }

    const fuzzyMatch = jsonlFiles.find((entry) => {
      const normalized = entry.normalize("NFC").toLowerCase();
      return normalized.includes("hanname") && normalized.includes("master");
    });

    if (fuzzyMatch) {
      const resolvedPath = resolve(dir, fuzzyMatch);
      console.warn(`[recommendFree] 기본 JSONL 경로 미존재. fallback 파일 사용: ${resolvedPath}`);
      return resolvedPath;
    }
  }

  throw new Error(
    `[recommendFree] JSONL 파일을 찾지 못했습니다. DATA_SOURCE_PATH를 지정하거나 ${DEFAULT_SOURCE_PATH} 파일을 추가하세요.`
  );
}

async function getDataset(): Promise<HanjaDataset> {
  if (datasetPromise) {
    return datasetPromise;
  }

  datasetPromise = (async () => {
    const dataPath = await resolveDataPath();
    console.info(`[recommendFree] dataset loading from ${dataPath}`);
    return loadHanjaDataset(dataPath);
  })().catch((error) => {
    datasetPromise = null;
    throw error;
  });

  return datasetPromise;
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function hashText(text: string): number {
  let hash = 0;
  for (const ch of text) {
    hash = (hash * 33 + ch.charCodeAt(0)) >>> 0;
  }
  return hash;
}

function pickTemplate(templates: readonly string[], seed: number, offset: number): string {
  const index = (seed + offset) % templates.length;
  return templates[index];
}

function formatMeaningPiece(item: RecommendationItem): string {
  const [kw1, kw2] = item.meaningKwPair;
  if (item.meaningTags.length >= 2) {
    return item.meaningTags.slice(0, 3).join(", ");
  }
  if (item.meaningTags.length === 1) {
    return item.meaningTags[0];
  }
  if (kw1 && kw2) {
    return `${kw1}, ${kw2}`;
  }
  return "긍정적";
}

const ELEMENT_LABELS: Record<FiveElement, string> = {
  WOOD: "목",
  FIRE: "화",
  EARTH: "토",
  METAL: "금",
  WATER: "수"
};

function getElementFlowText(item: RecommendationItem): string | null {
  const uniqueElements = Array.from(new Set(scoreSoundElement(item.fullHangul).elements));
  if (uniqueElements.length === 0) {
    return null;
  }
  return uniqueElements.map((element) => ELEMENT_LABELS[element]).join("/");
}

function buildElementBalanceTemplates(item: RecommendationItem): readonly string[] {
  const flow = getElementFlowText(item);
  if (!flow) {
    return [
      "오행 균형: 성씨와 이름의 오행 흐름이 한쪽으로 치우치지 않아 안정적이에요",
      "오행 균형: 성씨와 이름의 기운 배치가 고르게 이어져 조화로운 편이에요",
      "오행 균형: 성씨와 이름 조합에서 오행의 흐름이 자연스럽게 맞물려요"
    ] as const;
  }

  return [
    `오행 균형: ${flow}의 오행 균형이 잘 맞아요`,
    `오행 균형: 성씨와 이름에서 ${flow} 기운이 조화롭게 이어져요`,
    `오행 균형: ${flow} 조합이 치우치지 않아 전체 흐름이 안정적이에요`
  ] as const;
}

function buildFriendlyReasons(item: RecommendationItem): string[] {
  const seed = hashText(`${item.nameHangul}|${item.hanjaPair.join("")}|${item.readingPair.join("")}`);
  const meaningText = formatMeaningPiece(item);

  const meaningTemplates = [
    `의미: ${meaningText}을(를) 의미하는 한자들의 조합이에요`,
    `의미: ${item.hanjaPair[0]}·${item.hanjaPair[1]}는 ${meaningText}을(를) 의미하는 한자들의 조합이에요`,
    `의미: ${item.nameHangul}은(는) ${meaningText}을(를) 의미하는 한자들의 조합이에요`
  ] as const;

  const phoneticTemplates = [
    `발음오행: ${item.fullHangul}로 읽을 때 발음 점수 ${Math.round(item.scores.phonetic)}점으로 안정적이에요`,
    `발음오행: 성씨와 붙여 읽은 "${item.fullHangul}" 흐름이 매끄러워요`,
    "발음오행: 이름 소리 리듬이 부드러워 일상 호칭에서 쓰기 좋아요"
  ] as const;

  const summaryTemplates = buildElementBalanceTemplates(item);

  return [
    pickTemplate(meaningTemplates, seed, 0),
    pickTemplate(phoneticTemplates, seed, 1),
    pickTemplate(summaryTemplates, seed, 2)
  ];
}

function buildDisplayScores(items: RecommendationItem[]): number[] {
  if (items.length === 0) {
    return [];
  }

  if (items.length === 1) {
    return [DISPLAY_SCORE_TOP];
  }

  const rawScores = items.map((item) => item.scores.total);
  const maxRaw = Math.max(...rawScores);
  const minRaw = Math.min(...rawScores);
  const rawSpread = maxRaw - minRaw;
  const rankDenominator = items.length - 1;

  const targetSpread = clamp(Math.round(rawSpread * 2.8), DISPLAY_SPREAD_MIN, DISPLAY_SPREAD_MAX);

  const computed = rawScores.map((rawScore, index) => {
    const rankRatio = index / rankDenominator;
    if (rawSpread <= 0) {
      return DISPLAY_SCORE_TOP - Math.round(rankRatio * targetSpread);
    }

    const normalizedGap = (maxRaw - rawScore) / rawSpread;
    const blendedGap = normalizedGap * 0.75 + rankRatio * 0.25;
    return DISPLAY_SCORE_TOP - Math.round(blendedGap * targetSpread);
  });

  const monotonicDescending = [...computed];
  for (let i = 1; i < monotonicDescending.length; i += 1) {
    if (monotonicDescending[i] >= monotonicDescending[i - 1]) {
      monotonicDescending[i] = monotonicDescending[i - 1] - 1;
    }
  }

  return monotonicDescending.map((score) => clamp(score, DISPLAY_SCORE_MIN, 99));
}

function toFreeResultItem(item: RecommendationItem, score: number): FreeRecommendResultItem {
  return {
    nameHangul: item.nameHangul,
    hanjaPair: item.hanjaPair,
    readingPair: item.readingPair,
    meaningKwPair: item.meaningKwPair,
    score: clamp(Math.round(score), DISPLAY_SCORE_MIN, 99),
    reasons: buildFriendlyReasons(item)
  };
}

export async function recommendFreeNames(payload: unknown): Promise<FreeRecommendServiceResult> {
  const input = toInput((payload ?? {}) as RawPayload);
  if (!input) {
    return { ok: false, status: 400, error: "Invalid request payload" };
  }

  await ensureSupabaseSsotSnapshot();

  let resolvedInput: FreeRecommendInput;
  try {
    const resolvedSurname = await resolveSurnameHanjaSelection(input.surnameHangul, input.surnameHanja);
    if (!resolvedSurname.selectedHanja) {
      return { ok: false, status: 400, error: "Unsupported surname reading" };
    }
    resolvedInput = {
      ...input,
      surnameHanja: resolvedSurname.selectedHanja
    };
  } catch (error) {
    console.error("[recommendFree] 성씨 한자 해석 실패", error);
    return { ok: false, status: 500, error: "Failed to resolve surname hanja" };
  }

  const engineRequest: RecommendRequest = {
    surnameHangul: resolvedInput.surnameHangul,
    surnameHanja: resolvedInput.surnameHanja,
    birth: {
      calendar: "SOLAR",
      date: resolvedInput.birth?.date ?? DEFAULT_BASIC_MODE_BIRTH_DATE,
      ...(resolvedInput.birth?.time ? { time: resolvedInput.birth.time } : {}),
      timezone: DEFAULT_TIMEZONE
    },
    gender: mapGenderToEngine(resolvedInput.gender),
    limit: FREE_LIMIT,
    ...(resolvedInput.exploreSeed ? { exploreSeed: resolvedInput.exploreSeed } : {})
  };

  try {
    const dataset = await getDataset();
    const recommended = recommendNames(dataset, engineRequest);
    const topItems = recommended.recommendations.slice(0, FREE_LIMIT);
    const displayScores = buildDisplayScores(topItems);
    const results = topItems.map((item, index) => toFreeResultItem(item, displayScores[index]));

    if (results.length === 0) {
      console.warn("[recommendFree] 엔진 결과가 비어 mock fallback 사용");
      return {
        ok: true,
        source: "mock",
        response: {
          results: buildMockResults(resolvedInput)
        }
      };
    }

    return {
      ok: true,
      source: "engine",
      response: {
        results
      }
    };
  } catch (error) {
    console.error("[recommendFree] 엔진 호출 실패, mock fallback 사용", error);
    return {
      ok: true,
      source: "mock",
      response: {
        results: buildMockResults(resolvedInput)
      }
    };
  }
}
