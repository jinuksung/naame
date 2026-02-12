import { access, readdir } from "node:fs/promises";
import { resolve } from "node:path";
import { loadHanjaDataset } from "../data/loadHanjaDataset";
import { resolveSurnameHanjaSelection } from "../data/loadSurnameMap";
import { recommendNames } from "../engine/recommend";
import { buildMockResults } from "../mock";
import {
  FreeRecommendInput,
  FreeRecommendResponse,
  FreeRecommendResultItem
} from "../types/recommend";
import { Gender, HanjaDataset, RecommendationItem, RecommendRequest } from "../types";

const DEFAULT_SOURCE_PATH = "hanname_master.jsonl";
const DEFAULT_TIMEZONE = "Asia/Seoul";
const FREE_LIMIT = 5;
const DISPLAY_SCORE_TOP = 96;
const DISPLAY_SCORE_MIN = 72;
const DISPLAY_SPREAD_MIN = 6;
const DISPLAY_SPREAD_MAX = 14;

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

function toInput(payload: RawPayload): FreeRecommendInput | null {
  const surnameHangul =
    typeof payload.surnameHangul === "string" ? payload.surnameHangul.trim() : "";
  const surnameHanja =
    typeof payload.surnameHanja === "string" ? payload.surnameHanja.trim() : "";
  const calendar = payload.birth?.calendar;
  const date = typeof payload.birth?.date === "string" ? payload.birth.date : "";
  const time = typeof payload.birth?.time === "string" ? payload.birth.time : undefined;

  if (countChars(surnameHangul) < 1 || countChars(surnameHangul) > 2) {
    return null;
  }
  if (surnameHanja && (countChars(surnameHanja) < 1 || countChars(surnameHanja) > 2)) {
    return null;
  }
  if (calendar !== "SOLAR") {
    return null;
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return null;
  }
  if (!isGender(payload.gender)) {
    return null;
  }
  if (time && !/^\d{2}:\d{2}$/.test(time)) {
    return null;
  }

  return {
    surnameHangul,
    surnameHanja,
    birth: {
      calendar: "SOLAR",
      date,
      time
    },
    gender: payload.gender
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
    return `${item.meaningTags.slice(0, 2).join("·")} 축 의미`;
  }
  if (item.meaningTags.length === 1) {
    return `${item.meaningTags[0]} 의미`;
  }
  if (kw1 && kw2) {
    return `${kw1}·${kw2} 의미`;
  }
  return "긍정 의미";
}

function findDominantMetric(item: RecommendationItem): { label: string; score: number } {
  const candidates = [
    { label: "발음", score: item.scores.phonetic },
    { label: "의미", score: item.scores.meaning },
    { label: "초성 조화", score: item.scores.soundElement },
    { label: "사주 균형", score: item.scores.saju }
  ];

  let best = candidates[0];
  for (const metric of candidates.slice(1)) {
    if (metric.score > best.score) {
      best = metric;
    }
  }
  return best;
}

function buildFriendlyReasonsByRank(
  item: RecommendationItem,
  rank: number,
  totalCount: number
): string[] {
  const seed = hashText(`${item.nameHangul}|${item.hanjaPair.join("")}|${item.readingPair.join("")}`);
  const meaningText = formatMeaningPiece(item);
  const dominant = findDominantMetric(item);

  const meaningTemplates = [
    `한자 ${item.hanjaPair[0]}${item.hanjaPair[1]} 조합이 ${meaningText}를 담고 있어요`,
    `${item.hanjaPair[0]}·${item.hanjaPair[1]} 선택으로 ${meaningText} 방향이 또렷해요`,
    `${item.nameHangul}은(는) ${meaningText} 해석이 자연스러워요`
  ] as const;

  const phoneticTemplates = [
    `${item.fullHangul}로 읽을 때 발음 점수 ${Math.round(item.scores.phonetic)}점으로 안정적이에요`,
    `성씨와 붙여 읽은 "${item.fullHangul}" 흐름이 매끄러워요`,
    "이름 소리 리듬이 부드러워 일상 호칭에서 쓰기 좋아요"
  ] as const;

  const summaryTemplates = [
    `전체 후보 ${totalCount}개 중 ${rank}위로 선별됐고 종합 점수 ${Math.round(item.scores.total)}점이에요`,
    `${dominant.label} 지표가 특히 높게 나와 상위권에 올랐어요 (${Math.round(dominant.score)}점)`,
    `무료 추천 상위 ${rank}위이며 항목별 균형 점수가 고르게 나왔어요`
  ] as const;

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

function toFreeResultItem(
  item: RecommendationItem,
  score: number,
  rank: number,
  totalCount: number
): FreeRecommendResultItem {
  return {
    nameHangul: item.nameHangul,
    hanjaPair: item.hanjaPair,
    score: clamp(Math.round(score), DISPLAY_SCORE_MIN, 99),
    reasons: buildFriendlyReasonsByRank(item, rank, totalCount)
  };
}

export async function recommendFreeNames(payload: unknown): Promise<FreeRecommendServiceResult> {
  const input = toInput((payload ?? {}) as RawPayload);
  if (!input) {
    return { ok: false, status: 400, error: "Invalid request payload" };
  }

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
      calendar: resolvedInput.birth.calendar,
      date: resolvedInput.birth.date,
      time: resolvedInput.birth.time,
      timezone: DEFAULT_TIMEZONE
    },
    gender: mapGenderToEngine(resolvedInput.gender),
    limit: FREE_LIMIT
  };

  try {
    const dataset = await getDataset();
    const recommended = recommendNames(dataset, engineRequest);
    const topItems = recommended.recommendations.slice(0, FREE_LIMIT);
    const displayScores = buildDisplayScores(topItems);
    const results = topItems.map((item, index) =>
      toFreeResultItem(item, displayScores[index], index + 1, topItems.length)
    );

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
