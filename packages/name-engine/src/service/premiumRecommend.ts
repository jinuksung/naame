import { access, readdir } from "node:fs/promises";
import { resolve } from "node:path";
import { resolveSurnameElementByHanja, resolveSurnameReadingByHanja } from "../data/loadSurnameMap";
import { loadHanjaDataset } from "../data/loadHanjaDataset";
import {
  ensureSupabaseSsotSnapshot,
  getDefaultRuntimeSupabaseSsotFilePaths
} from "../data/supabaseSsotSnapshot";
import { recommendNames } from "../engine/recommend";
import { scoreSoundElement } from "../engine/scoring/soundElement";
import { diversifyByStartEnd } from "../core/diversify";
import {
  buildDistFromElements,
  buildSajuDistFromPillars,
  calcNeed,
  calcSajuScore5,
  calcSoundScore5,
  calculatePremiumSajuSnapshot,
  ELEMENT_KEYS,
  ELEMENT_LABELS_KO,
  ElementDist,
  ElementKey,
  sumDist,
  toElementStatusItems
} from "../core/premium";
import {
  FiveElement,
  Gender,
  HanjaDataset,
  RecommendationItem,
  RecommendRequest
} from "../types";
import {
  PremiumRecommendInput,
  PremiumRecommendResponse,
  PremiumRecommendResultItem,
  RecommendGender
} from "../types/recommend";

const DEFAULT_SOURCE_PATH = "hanname_master.jsonl";
const DEFAULT_TIMEZONE = "Asia/Seoul";
const PREMIUM_LIMIT = 20;
const PREMIUM_POOL_LIMIT = 80;
const PREMIUM_EXPANDED_POOL_LIMIT = 160;
const PREMIUM_ADDITIONAL_SEARCH_BUDGET_MS = 250;
const PREMIUM_MIN_TOP1_SAJU_SCORE5_FOR_SKIP_EXPANSION = 3.0;
const PREMIUM_MIN_TOP5_AVG_SAJU_SCORE5_FOR_SKIP_EXPANSION = 2.5;
const PREMIUM_MAX_TOP20_ZERO_SAJU_RATIO_FOR_SKIP_EXPANSION = 0.4;
const EXPLORE_SEED_MOD = 0x7fffffff;

let datasetPromise: Promise<HanjaDataset> | null = null;
let datasetVersionSignature: string | null = null;

interface RawPayload {
  birth?: {
    calendar?: unknown;
    date?: unknown;
    isLeapMonth?: unknown;
    time?: unknown;
  };
  surnameHanja?: unknown;
  gender?: unknown;
  exploreSeed?: unknown;
}

export interface PremiumSortItem {
  nameHangul: string;
  sajuScore5: number;
  engineScore01: number;
  soundScore5: number;
}

export interface PremiumQualityMetrics {
  topCount: number;
  top5Count: number;
  top1SajuScore5: number;
  top5AvgSajuScore5: number;
  top20ZeroSajuRatio: number;
}

interface PremiumRankedCandidate extends PremiumSortItem {
  candidate: RecommendationItem;
  why: string[];
}

export type PremiumRecommendServiceResult =
  | {
      ok: true;
      response: PremiumRecommendResponse;
    }
  | {
      ok: false;
      status: number;
      error: string;
    };

function clamp(value: number, min: number, max: number): number {
  if (!Number.isFinite(value)) {
    return min;
  }
  return Math.max(min, Math.min(max, value));
}

function toFixed4(value: number): number {
  return Math.round(value * 10000) / 10000;
}

function uniquePaths(paths: string[]): string[] {
  return Array.from(new Set(paths));
}

function buildSearchDirs(cwd: string): string[] {
  return uniquePaths([cwd, resolve(cwd, ".."), resolve(cwd, "../.."), resolve(cwd, "../../..")]);
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
      `[recommendPremium] DATA_SOURCE_PATH 파일이 존재하지 않습니다: ${resolvedEnvPath}`
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
    const fuzzyMatch = jsonlFiles.find((entry) => {
      const normalized = entry.normalize("NFC").toLowerCase();
      return normalized.includes("hanname") && normalized.includes("master");
    });
    if (fuzzyMatch) {
      return resolve(dir, fuzzyMatch);
    }
  }

  throw new Error(
    `[recommendPremium] JSONL 파일을 찾지 못했습니다. DATA_SOURCE_PATH를 지정하거나 ${DEFAULT_SOURCE_PATH} 파일을 추가하세요.`
  );
}

async function getDataset(versionSignature: string): Promise<HanjaDataset> {
  if (datasetPromise && datasetVersionSignature === versionSignature) {
    return datasetPromise;
  }

  datasetPromise = (async () => {
    const dataPath = await resolveDataPath();
    console.info(`[recommendPremium] dataset loading from ${dataPath}`);
    return loadHanjaDataset(dataPath);
  })().catch((error) => {
    datasetPromise = null;
    datasetVersionSignature = null;
    throw error;
  });
  datasetVersionSignature = versionSignature;

  return datasetPromise;
}

function isGender(value: unknown): value is RecommendGender {
  return value === "MALE" || value === "FEMALE" || value === "UNISEX";
}

function mapGenderToEngine(gender: RecommendGender): Gender {
  if (gender === "UNISEX") {
    return "ANY";
  }
  return gender;
}

function parseExploreSeed(value: unknown): number | undefined {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return undefined;
  }
  const integer = Math.max(1, Math.floor(value));
  const normalized = integer % EXPLORE_SEED_MOD;
  return normalized === 0 ? 1 : normalized;
}

function countChars(text: string): number {
  return Array.from(text).length;
}

function normalizeHanja(value: unknown): string {
  const text = typeof value === "string" ? value.trim().normalize("NFC") : "";
  const length = countChars(text);
  if (length < 1 || length > 2) {
    return "";
  }
  return text;
}

export function toPremiumInput(payload: unknown): PremiumRecommendInput | null {
  if (!payload || typeof payload !== "object") {
    return null;
  }

  const raw = payload as RawPayload;
  const calendar = raw.birth?.calendar;
  if (calendar !== "SOLAR" && calendar !== "LUNAR") {
    return null;
  }

  const date = typeof raw.birth?.date === "string" ? raw.birth.date.trim() : "";
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return null;
  }

  const time = typeof raw.birth?.time === "string" ? raw.birth.time.trim() : undefined;
  if (time && !/^\d{2}:\d{2}$/.test(time)) {
    return null;
  }

  if (raw.birth?.isLeapMonth !== undefined && typeof raw.birth.isLeapMonth !== "boolean") {
    return null;
  }

  const surnameHanja = normalizeHanja(raw.surnameHanja);
  if (!surnameHanja) {
    return null;
  }

  if (!isGender(raw.gender)) {
    return null;
  }

  const exploreSeed = parseExploreSeed(raw.exploreSeed);

  return {
    birth: {
      calendar,
      date,
      ...(calendar === "LUNAR" && raw.birth?.isLeapMonth === true ? { isLeapMonth: true } : {}),
      ...(time ? { time } : {})
    },
    surnameHanja,
    gender: raw.gender,
    ...(exploreSeed ? { exploreSeed } : {})
  };
}

function toEngineScore01(candidate: RecommendationItem): number {
  const source = candidate.scores.engine ?? candidate.scores.total;
  return clamp(source / 100, 0, 1);
}

function toElementKey(value: FiveElement): ElementKey {
  return value;
}

function resolveHanjaElement(dataset: HanjaDataset, hanja: string): ElementKey | null {
  const row = dataset.byHanja.get(hanja);
  const element = row?.elementResource ?? row?.elementPronunciation;
  if (!element) {
    return null;
  }
  return toElementKey(element);
}

function resolveSurnameElements(
  dataset: HanjaDataset,
  surnameHanja: string,
  fallbackSurnameElement: ElementKey | null,
): ElementKey[] {
  const out: ElementKey[] = [];
  for (const hanja of Array.from(surnameHanja)) {
    const element = resolveHanjaElement(dataset, hanja);
    if (!element) {
      continue;
    }
    out.push(element);
  }
  if (out.length === 0 && fallbackSurnameElement) {
    out.push(fallbackSurnameElement);
  }
  return out;
}

function buildDistFullName(
  dataset: HanjaDataset,
  surnameHanja: string,
  candidate: RecommendationItem,
  fallbackSurnameElement: ElementKey | null,
): ElementDist {
  const elements: ElementKey[] = [];

  const surnameElement =
    resolveHanjaElement(dataset, Array.from(surnameHanja)[0] ?? "") ?? fallbackSurnameElement;
  if (surnameElement) {
    elements.push(surnameElement);
  }

  const nameElement1 = resolveHanjaElement(dataset, candidate.hanjaPair[0]);
  if (nameElement1) {
    elements.push(nameElement1);
  }
  const nameElement2 = resolveHanjaElement(dataset, candidate.hanjaPair[1]);
  if (nameElement2) {
    elements.push(nameElement2);
  }

  const dist = buildDistFromElements(elements);
  if (sumDist(dist) > 0) {
    return dist;
  }

  return {
    WOOD: 0.2,
    FIRE: 0.2,
    EARTH: 0.2,
    METAL: 0.2,
    WATER: 0.2
  };
}

function buildWhyLines(input: {
  mode: "IMPROVE" | "HARMONY";
  weakTop2: ElementKey[];
  improveRatio: number | null;
  harmonyRatio: number | null;
  soundScore5: number;
  engineScore01: number;
}): string[] {
  const top2Ko = input.weakTop2.map((key) => ELEMENT_LABELS_KO[key]).join("/");
  const firstLine =
    input.mode === "IMPROVE"
      ? `${top2Ko} 보완 기여도가 ${Math.round((input.improveRatio ?? 0) * 100)}%입니다.`
      : `사주 분포와의 조화도가 ${Math.round((input.harmonyRatio ?? 0) * 100)}%입니다.`;

  const secondLine =
    `발음 조화 ${input.soundScore5.toFixed(1)}점 · 엔진 점수 ${(input.engineScore01 * 100).toFixed(1)}점`;

  return [firstLine, secondLine];
}

export function sortPremiumItems<T extends PremiumSortItem>(items: T[]): T[] {
  return [...items].sort((a, b) => {
    if (b.sajuScore5 !== a.sajuScore5) {
      return b.sajuScore5 - a.sajuScore5;
    }
    if (b.engineScore01 !== a.engineScore01) {
      return b.engineScore01 - a.engineScore01;
    }
    if (b.soundScore5 !== a.soundScore5) {
      return b.soundScore5 - a.soundScore5;
    }
    return a.nameHangul.localeCompare(b.nameHangul, "ko");
  });
}

export function summarizePremiumQuality(
  items: Array<Pick<PremiumSortItem, "sajuScore5">>,
  limit: number = PREMIUM_LIMIT
): PremiumQualityMetrics {
  const top = items.slice(0, Math.max(0, limit));
  const top5 = top.slice(0, 5);
  const top1 = top[0];
  const top20ZeroCount = top.reduce((count, item) => count + (item.sajuScore5 === 0 ? 1 : 0), 0);

  return {
    topCount: top.length,
    top5Count: top5.length,
    top1SajuScore5: top1?.sajuScore5 ?? 0,
    top5AvgSajuScore5:
      top5.length > 0
        ? Math.round(
            (top5.reduce((sum, item) => sum + item.sajuScore5, 0) / top5.length) * 100
          ) / 100
        : 0,
    top20ZeroSajuRatio:
      top.length > 0 ? Math.round((top20ZeroCount / top.length) * 10000) / 10000 : 0
  };
}

export function shouldExpandPremiumPool(input: {
  mode: "IMPROVE" | "HARMONY";
  preDiversity: PremiumQualityMetrics;
  elapsedMs: number;
  budgetMs?: number;
}): boolean {
  if (input.mode !== "IMPROVE") {
    return false;
  }

  const budgetMs = input.budgetMs ?? PREMIUM_ADDITIONAL_SEARCH_BUDGET_MS;
  if (input.elapsedMs > budgetMs) {
    return false;
  }

  if (input.preDiversity.topCount < PREMIUM_LIMIT) {
    return true;
  }

  return (
    input.preDiversity.top1SajuScore5 < PREMIUM_MIN_TOP1_SAJU_SCORE5_FOR_SKIP_EXPANSION ||
    input.preDiversity.top5AvgSajuScore5 < PREMIUM_MIN_TOP5_AVG_SAJU_SCORE5_FOR_SKIP_EXPANSION ||
    input.preDiversity.top20ZeroSajuRatio >= PREMIUM_MAX_TOP20_ZERO_SAJU_RATIO_FOR_SKIP_EXPANSION
  );
}

function comparePremiumQuality(a: PremiumQualityMetrics, b: PremiumQualityMetrics): number {
  if (a.top1SajuScore5 !== b.top1SajuScore5) {
    return a.top1SajuScore5 > b.top1SajuScore5 ? 1 : -1;
  }
  if (a.top5AvgSajuScore5 !== b.top5AvgSajuScore5) {
    return a.top5AvgSajuScore5 > b.top5AvgSajuScore5 ? 1 : -1;
  }
  if (a.top20ZeroSajuRatio !== b.top20ZeroSajuRatio) {
    return a.top20ZeroSajuRatio < b.top20ZeroSajuRatio ? 1 : -1;
  }
  if (a.topCount !== b.topCount) {
    return a.topCount > b.topCount ? 1 : -1;
  }
  return 0;
}

function buildPremiumCandidates(input: {
  recommendations: RecommendationItem[];
  dataset: HanjaDataset;
  surnameHanja: string;
  surnameFallbackElement: ElementKey | null;
  distSaju: ElementDist;
  weakTop2: ElementKey[];
  surnameElements: ElementKey[];
}): PremiumRankedCandidate[] {
  return input.recommendations.map((candidate) => {
    const distFullName = buildDistFullName(
      input.dataset,
      input.surnameHanja,
      candidate,
      input.surnameFallbackElement
    );
    const sajuEval = calcSajuScore5({
      distSaju: input.distSaju,
      distFullName
    });
    const soundRaw = scoreSoundElement(candidate.nameHangul, {
      surnameElements: input.surnameElements
    });
    const soundEval = calcSoundScore5({
      mode: sajuEval.mode,
      weakTop2: input.weakTop2,
      soundElements: soundRaw.elements.map(toElementKey),
      phoneticScore: candidate.scores.phonetic
    });
    const engineScore01 = toEngineScore01(candidate);

    return {
      candidate,
      nameHangul: candidate.nameHangul,
      sajuScore5: sajuEval.sajuScore5,
      soundScore5: soundEval.soundScore5,
      engineScore01,
      why: buildWhyLines({
        mode: sajuEval.mode,
        weakTop2: input.weakTop2,
        improveRatio: sajuEval.improveRatio,
        harmonyRatio: sajuEval.harmonyRatio,
        soundScore5: soundEval.soundScore5,
        engineScore01
      })
    };
  });
}

function finalizePremiumCandidates(
  premiumCandidates: PremiumRankedCandidate[]
): {
  sorted: PremiumRankedCandidate[];
  diversified: PremiumRankedCandidate[];
  results: PremiumRecommendResultItem[];
  preDiversityQuality: PremiumQualityMetrics;
  postDiversityQuality: PremiumQualityMetrics;
} {
  const sorted = sortPremiumItems(premiumCandidates);
  const diversified = diversifyByStartEnd(sorted, {
    limit: PREMIUM_LIMIT,
    maxSameStart: 2,
    maxSameEnd: 2,
    getName: (item) => item.nameHangul
  });

  return {
    sorted,
    diversified,
    results: diversified.map((row, index) => toPremiumResultItem(row, index + 1)),
    preDiversityQuality: summarizePremiumQuality(sorted),
    postDiversityQuality: summarizePremiumQuality(diversified)
  };
}

function toPremiumResultItem(
  row: PremiumRankedCandidate,
  rank: number
): PremiumRecommendResultItem {
  return {
    rank,
    nameHangul: row.candidate.nameHangul,
    hanjaPair: row.candidate.hanjaPair,
    readingPair: row.candidate.readingPair,
    meaningKwPair: row.candidate.meaningKwPair,
    score: Math.round(row.candidate.scores.total),
    sajuScore5: row.sajuScore5,
    soundScore5: row.soundScore5,
    engineScore01: toFixed4(row.engineScore01),
    why: row.why.slice(0, 2)
  };
}

export async function recommendPremiumNames(payload: unknown): Promise<PremiumRecommendServiceResult> {
  const input = toPremiumInput(payload);
  if (!input) {
    return { ok: false, status: 400, error: "Invalid request payload" };
  }

  const surnameHangul = await resolveSurnameReadingByHanja(input.surnameHanja);
  if (!surnameHangul) {
    return { ok: false, status: 400, error: "Unsupported surname hanja" };
  }

  let sajuSnapshot: Awaited<ReturnType<typeof calculatePremiumSajuSnapshot>>;
  try {
    sajuSnapshot = await calculatePremiumSajuSnapshot(input.birth);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Invalid saju input";
    return { ok: false, status: 400, error: message };
  }

  try {
    const snapshot = await ensureSupabaseSsotSnapshot({
      requiredPaths: getDefaultRuntimeSupabaseSsotFilePaths()
    });
    const currentVersionSignature = snapshot.versionSignature ?? snapshot.source;
    const dataset = await getDataset(currentVersionSignature);

    const engineRequestBase: Omit<RecommendRequest, "limit"> = {
      surnameHangul,
      surnameHanja: input.surnameHanja,
      birth: {
        calendar: "SOLAR",
        date: sajuSnapshot.solar.date,
        ...(input.birth.time ? { time: input.birth.time } : {}),
        timezone: DEFAULT_TIMEZONE
      },
      gender: mapGenderToEngine(input.gender),
      ...(input.exploreSeed ? { exploreSeed: input.exploreSeed } : {})
    };
    const distSaju = buildSajuDistFromPillars({
      yearPillar: sajuSnapshot.pillars.yearPillar,
      monthPillar: sajuSnapshot.pillars.monthPillar,
      dayPillar: sajuSnapshot.pillars.dayPillar,
      hourPillar: sajuSnapshot.pillars.hourPillar
    });
    const need = calcNeed(distSaju);
    const sumNeed = ELEMENT_KEYS.reduce((sum, key) => sum + need[key], 0);
    const mode = sumNeed > 0 ? "IMPROVE" : "HARMONY";
    const weakTop2 = [...ELEMENT_KEYS]
      .sort((a, b) => {
        if (distSaju[a] !== distSaju[b]) {
          return distSaju[a] - distSaju[b];
        }
        return a.localeCompare(b);
      })
      .slice(0, 2);
    const dayStem = Array.from(sajuSnapshot.pillars.dayPillar)[0] ?? "일간";
    const oneLineSummary =
      mode === "HARMONY"
        ? "현재 사주는 전반적으로 균형에 가까워 조화 중심으로 추천됩니다."
        : `일간이 ${dayStem}이며 ${weakTop2
            .map((element) => ELEMENT_LABELS_KO[element])
            .join("/")} 기운이 상대적으로 약한 편입니다.`;
    const surnameFallbackElementRaw = await resolveSurnameElementByHanja(input.surnameHanja);
    const surnameFallbackElement = surnameFallbackElementRaw
      ? toElementKey(surnameFallbackElementRaw)
      : null;
    const surnameElements = resolveSurnameElements(
      dataset,
      input.surnameHanja,
      surnameFallbackElement,
    );
    const runPremiumPass = (
      enginePoolLimit: number
    ): ReturnType<typeof finalizePremiumCandidates> => {
      const engineResult = recommendNames(dataset, {
        ...engineRequestBase,
        limit: enginePoolLimit
      });

      const premiumCandidates = buildPremiumCandidates({
        recommendations: engineResult.recommendations,
        dataset,
        surnameHanja: input.surnameHanja,
        surnameFallbackElement,
        distSaju,
        weakTop2,
        surnameElements
      });

      return finalizePremiumCandidates(premiumCandidates);
    };

    const premiumPassStartedAt = Date.now();
    let selectedPass = runPremiumPass(PREMIUM_POOL_LIMIT);
    const initialElapsedMs = Date.now() - premiumPassStartedAt;
    const shouldRunExpansion = shouldExpandPremiumPool({
      mode,
      preDiversity: selectedPass.preDiversityQuality,
      elapsedMs: initialElapsedMs
    });

    if (shouldRunExpansion && PREMIUM_EXPANDED_POOL_LIMIT > PREMIUM_POOL_LIMIT) {
      console.info(
        `[recommendPremium] adaptive expansion triggered ` +
          `preTop1=${selectedPass.preDiversityQuality.top1SajuScore5.toFixed(1)} ` +
          `preTop5Avg=${selectedPass.preDiversityQuality.top5AvgSajuScore5.toFixed(2)} ` +
          `preZeroRatio=${(selectedPass.preDiversityQuality.top20ZeroSajuRatio * 100).toFixed(1)}% ` +
          `elapsed=${initialElapsedMs}ms limit=${PREMIUM_POOL_LIMIT}->${PREMIUM_EXPANDED_POOL_LIMIT}`
      );

      const expandedPass = runPremiumPass(PREMIUM_EXPANDED_POOL_LIMIT);
      const postCompare = comparePremiumQuality(
        expandedPass.postDiversityQuality,
        selectedPass.postDiversityQuality
      );
      const preCompare = comparePremiumQuality(
        expandedPass.preDiversityQuality,
        selectedPass.preDiversityQuality
      );
      const shouldReplace = postCompare > 0 || (postCompare === 0 && preCompare > 0);

      if (shouldReplace) {
        selectedPass = expandedPass;
      }

      console.info(
        `[recommendPremium] adaptive expansion completed ` +
          `replaced=${shouldReplace ? "Y" : "N"} ` +
          `postTop1=${selectedPass.postDiversityQuality.top1SajuScore5.toFixed(1)} ` +
          `postTop5Avg=${selectedPass.postDiversityQuality.top5AvgSajuScore5.toFixed(2)} ` +
          `postZeroRatio=${(selectedPass.postDiversityQuality.top20ZeroSajuRatio * 100).toFixed(1)}% ` +
          `totalElapsed=${Date.now() - premiumPassStartedAt}ms`
      );
    }

    const results = selectedPass.results;

    return {
      ok: true,
      response: {
        summary: {
          mode,
          oneLineSummary,
          weakTop2,
          hasHourPillar: sajuSnapshot.hasHourPillar,
          pillars: {
            year: {
              hangul: sajuSnapshot.pillars.yearPillar,
              hanja: sajuSnapshot.pillars.yearPillarHanja
            },
            month: {
              hangul: sajuSnapshot.pillars.monthPillar,
              hanja: sajuSnapshot.pillars.monthPillarHanja
            },
            day: {
              hangul: sajuSnapshot.pillars.dayPillar,
              hanja: sajuSnapshot.pillars.dayPillarHanja
            },
            hour:
              sajuSnapshot.hasHourPillar &&
              sajuSnapshot.pillars.hourPillar &&
              sajuSnapshot.pillars.hourPillarHanja
                ? {
                    hangul: sajuSnapshot.pillars.hourPillar,
                    hanja: sajuSnapshot.pillars.hourPillarHanja
                  }
                : null
          },
          distSaju,
          distStatus: toElementStatusItems(distSaju)
        },
        results
      }
    };
  } catch (error) {
    console.error("[recommendPremium] 엔진 호출 실패", error);
    return { ok: false, status: 500, error: "Failed to generate premium recommendations" };
  }
}
