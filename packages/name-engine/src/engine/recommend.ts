import { readFileSync } from "node:fs";
import {
  FiveElement,
  HanjaDataset,
  HanjaRow,
  RecommendRequest,
  RecommendResult,
  SajuElementVector,
  RecommendationItem
} from "../types";
import { scoreGender } from "./scoring/gender";
import { scoreMeaning } from "./scoring/meaning";
import { scorePhonetic } from "./scoring/phonetic";
import { calcSajuElementVector, scoreSajuFit } from "./scoring/sajuElements";
import { scoreSoundElement } from "./scoring/soundElement";
import {
  SurnameInfluenceConfig,
  resolveSurnameInfluenceConfig,
  scoreBalance3,
  scoreSurnamePronunciationFlow,
  scoreSurnameSynergy
} from "./scoring/surnameInfluence";
import { ALLOW_SYLLABLES } from "./whitelist/allowSyllables";
import {
  buildPriorDiagnosticRows,
  formatPriorDiagnosticRows
} from "../lib/namefit/debug/priorDiagnostics";
import { loadNamePriorIndex } from "../lib/namefit/prior/buildNamePrior";
import { PriorGate } from "../lib/namefit/prior/gates";
import {
  applyFinalScoreWithPrior,
  mapEngineGenderToPriorGender
} from "../lib/namefit/rank/finalScore";
import { diversifyByStartEnd } from "../core/diversify";
import { loadPoolIndex } from "../core/poolAttach";
import { formatSoftPriorTable, rerankWithSoftPrior } from "../core/rerank";
import { preselectNameSeeds } from "../core/preselect";
import type {
  NamePreselectInput,
  PoolTargetGender,
  SoftPriorRerankedRow
} from "../core/types";

const TOP_READING_K = 120;
const HANJA_PER_READING = 20;
const SINGLE_HANGUL_SYLLABLE_PATTERN = /^[가-힣]$/;

let cachedWhitelistPath: string | null = null;
let cachedWhitelist: Set<string> | null = null;

const WEIGHTS = {
  phonetic: 0.45,
  meaning: 0.35,
  soundElement: 0.15,
  aux: 0.05
} as const;

const DEFAULT_PRIOR_WEIGHT = 0.35;
const DEFAULT_STRICT_GATE = true;
const DEFAULT_ALLOW_NON_WHITELIST = false;
const DEFAULT_SURNAME_DIAGNOSTICS = false;
const DEFAULT_POOL_RERANK_DEBUG = false;
const PRESELECT_NAME_MULTIPLIER = 12;
const PRESELECT_NAME_MIN = 120;
const PRESELECT_EXPLORATION_MIN = 20;
const PRESELECT_EXPLORATION_RATIO = 0.2;

function toFixed2(value: number): number {
  return Math.round(value * 100) / 100;
}

function normalizeLimit(limit: number): number {
  if (!Number.isFinite(limit)) {
    return 10;
  }
  const parsed = Math.floor(limit);
  if (parsed < 1) {
    return 1;
  }
  if (parsed > 100) {
    return 100;
  }
  return parsed;
}

function clamp01(value: number): number {
  return Math.max(0, Math.min(1, value));
}

function parseBooleanEnv(value: string | undefined, fallback: boolean): boolean {
  if (value == null) {
    return fallback;
  }
  const normalized = value.trim().toLowerCase();
  if (normalized === "1" || normalized === "true" || normalized === "yes") {
    return true;
  }
  if (normalized === "0" || normalized === "false" || normalized === "no") {
    return false;
  }
  return fallback;
}

function parsePriorWeightEnv(value: string | undefined): number {
  if (!value) {
    return DEFAULT_PRIOR_WEIGHT;
  }
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) {
    return DEFAULT_PRIOR_WEIGHT;
  }
  return clamp01(parsed);
}

function mapEngineGenderToPoolTargetGender(gender: RecommendRequest["gender"]): PoolTargetGender {
  if (gender === "MALE") {
    return "M";
  }
  if (gender === "FEMALE") {
    return "F";
  }
  return "ANY";
}

function resolveEngineScore01(candidate: RecommendationItem): number {
  const source = candidate.scores.engine ?? candidate.scores.total;
  return clamp01(source / 100);
}

function toSoftPriorRowsFromRecommendations(
  recommendations: RecommendationItem[]
): Array<SoftPriorRerankedRow<RecommendationItem>> {
  return recommendations
    .map((candidate) => {
      const debug = candidate.debug?.softPrior;
      if (!debug) {
        return null;
      }
      return {
        name: candidate.nameHangul,
        candidate,
        pool: {
          poolIncluded: debug.poolIncluded,
          tier: debug.tier,
          poolScore01: debug.poolScore01,
          tierBonus01: debug.tierBonus01
        },
        breakdown: {
          engineScore01: debug.engineScore01,
          poolScore01: debug.poolScore01,
          tierBonus01: debug.tierBonus01,
          finalScore01: debug.finalScore01
        }
      };
    })
    .filter((row): row is SoftPriorRerankedRow<RecommendationItem> => row !== null);
}

function isSingleHangulSyllable(value: string): boolean {
  return SINGLE_HANGUL_SYLLABLE_PATTERN.test(value);
}

function toSyllableSet(values: unknown): Set<string> | null {
  if (!Array.isArray(values)) {
    return null;
  }

  const out = new Set<string>();
  for (const value of values) {
    if (typeof value !== "string") {
      continue;
    }
    const syllable = value.trim();
    if (isSingleHangulSyllable(syllable)) {
      out.add(syllable);
    }
  }

  return out.size > 0 ? out : null;
}

function loadRuntimeWhitelistFromEnv(): Set<string> | null {
  const path = process.env.SYLLABLE_WHITELIST_JSON?.trim();
  if (!path) {
    cachedWhitelistPath = null;
    cachedWhitelist = null;
    return null;
  }

  if (cachedWhitelistPath === path) {
    return cachedWhitelist;
  }

  try {
    const raw = readFileSync(path, "utf8");
    const parsed = JSON.parse(raw) as { allow?: unknown };
    const allow = toSyllableSet(parsed.allow);
    if (!allow) {
      throw new Error("allow 배열이 없거나 유효한 한글 1음절 데이터가 없습니다.");
    }

    cachedWhitelistPath = path;
    cachedWhitelist = allow;
    console.info(`[recommend] whitelist override loaded path=${path} size=${allow.size}`);
    return allow;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.warn(`[recommend] whitelist override load failed path=${path}: ${message}`);
    cachedWhitelistPath = path;
    cachedWhitelist = null;
    return null;
  }
}

function resolveAllowSyllables(): Set<string> {
  return loadRuntimeWhitelistFromEnv() ?? ALLOW_SYLLABLES;
}

function uniqueNonEmpty(values: string[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];

  for (const raw of values) {
    const value = raw.trim();
    if (!value || seen.has(value)) {
      continue;
    }
    seen.add(value);
    out.push(value);
  }

  return out;
}

function resolveSurnameElements(dataset: HanjaDataset, surnameHanja?: string): FiveElement[] {
  if (!surnameHanja) {
    return [];
  }

  const out: FiveElement[] = [];
  for (const hanja of Array.from(surnameHanja.trim())) {
    const row = dataset.byHanja.get(hanja);
    const element = row?.elementPronunciation ?? row?.elementResource;
    if (!element) {
      continue;
    }
    out.push(element);
  }
  return out;
}

function getTopHanjaRows(rows: HanjaRow[] | undefined, limit: number): HanjaRow[] {
  if (!rows || rows.length === 0) {
    return [];
  }

  return [...rows]
    .sort((a, b) => {
      if (b.meaningTags.length !== a.meaningTags.length) {
        return b.meaningTags.length - a.meaningTags.length;
      }
      return a.hanja.localeCompare(b.hanja, "ko");
    })
    .slice(0, limit);
}

function resolveResourceElement(row: HanjaRow | undefined): FiveElement | undefined {
  return row?.elementResource ?? row?.elementPronunciation;
}

function resolvePrimarySurnameElement(surnameElements: FiveElement[]): FiveElement | undefined {
  return surnameElements[0];
}

interface ReadingCandidate {
  reading: string;
  rows: HanjaRow[];
  representativeElement?: FiveElement;
}

interface FirstReadingBeamEntry {
  reading: ReadingCandidate;
  firstPartialScore01: number;
}

interface NameExpansionSeedPayload {
  r1: string;
  r2: string;
  firstRows: HanjaRow[];
  secondRows: HanjaRow[];
}

function buildReadingCandidates(dataset: HanjaDataset, readings: string[]): ReadingCandidate[] {
  const out: ReadingCandidate[] = [];
  for (const reading of readings) {
    const rows = getTopHanjaRows(dataset.byReading.get(reading), HANJA_PER_READING);
    if (rows.length === 0) {
      continue;
    }
    out.push({
      reading,
      rows,
      representativeElement: resolveResourceElement(rows[0])
    });
  }
  return out;
}

function scoreFirstReadingPartial(
  surnameHangul: string,
  surnameElement: FiveElement | undefined,
  reading: ReadingCandidate,
  config: SurnameInfluenceConfig
): number {
  const surnameSynergy = scoreSurnameSynergy({
    surnameElement,
    char1Element: reading.representativeElement,
    config
  }).score;
  const pronFlow = scoreSurnamePronunciationFlow(surnameHangul, reading.reading).score;
  return surnameSynergy * 0.75 + pronFlow * 0.25;
}

function scoreSecondReadingPartial(
  surnameHangul: string,
  surnameElement: FiveElement | undefined,
  firstReading: ReadingCandidate,
  secondReading: ReadingCandidate,
  sajuVector: SajuElementVector,
  config: SurnameInfluenceConfig
): number {
  const surnameSynergy = scoreSurnameSynergy({
    surnameElement,
    char1Element: firstReading.representativeElement,
    char2Element: secondReading.representativeElement,
    config
  }).score;
  const pronFlow = scoreSurnamePronunciationFlow(
    surnameHangul,
    `${firstReading.reading}${secondReading.reading}`
  ).score;
  const balance3 = scoreBalance3({
    surnameElement,
    char1Element: firstReading.representativeElement,
    char2Element: secondReading.representativeElement,
    sajuVector,
    config
  }).score;

  return (
    config.weightSurnameSynergy * surnameSynergy +
    config.weightSurnamePronFlow * pronFlow +
    config.weightBalance3 * balance3
  );
}

function resolveNamePreselectLimit(limit: number): number {
  const fromEnv = process.env.POOL_PRESELECT_LIMIT?.trim();
  if (fromEnv) {
    const parsed = Number(fromEnv);
    if (Number.isFinite(parsed) && parsed >= 1) {
      return Math.floor(parsed);
    }
  }
  return Math.max(PRESELECT_NAME_MIN, limit * PRESELECT_NAME_MULTIPLIER);
}

function selectDiverseRecommendations(
  sorted: RecommendationItem[],
  limit: number
): RecommendationItem[] {
  const diversified = diversifyByStartEnd(sorted, {
    limit,
    maxSameStart: 2,
    maxSameEnd: 2,
    getName: (candidate) => candidate.nameHangul
  });
  return diversified.map((candidate, index) => ({
    ...candidate,
    rank: index + 1
  }));
}

export function recommendNames(dataset: HanjaDataset, request: RecommendRequest): RecommendResult {
  const limit = normalizeLimit(request.limit);
  const allowSyllables = resolveAllowSyllables();
  const readingEntries = Array.from(dataset.byReading.entries()).sort((a, b) => {
    if (b[1].length !== a[1].length) {
      return b[1].length - a[1].length;
    }
    return a[0].localeCompare(b[0], "ko");
  });
  const topReadings = readingEntries
    .slice(0, TOP_READING_K)
    .map(([reading]) => reading)
    .filter((reading) => isSingleHangulSyllable(reading) && allowSyllables.has(reading));

  const surnameConfig = resolveSurnameInfluenceConfig();
  const surnameDiagnostics = parseBooleanEnv(
    process.env.SURNAME_DIAGNOSTICS,
    DEFAULT_SURNAME_DIAGNOSTICS
  );

  const sajuVector = calcSajuElementVector(request.birth);
  const sajuBaseScore = scoreSajuFit("", sajuVector.vector, {
    precision: sajuVector.precision,
    pillars: sajuVector.pillars,
    preReasons: sajuVector.reasons
  });
  const surnameElements = resolveSurnameElements(dataset, request.surnameHanja);
  const surnameElement = resolvePrimarySurnameElement(surnameElements);
  const poolIndex = loadPoolIndex();
  const poolTargetGender = mapEngineGenderToPoolTargetGender(request.gender);
  const readingCandidates = buildReadingCandidates(dataset, topReadings);
  const firstReadingBeam: FirstReadingBeamEntry[] = [...readingCandidates]
    .map((reading) => ({
      reading,
      firstPartialScore01: scoreFirstReadingPartial(
        request.surnameHangul,
        surnameElement,
        reading,
        surnameConfig
      )
    }))
    .sort((a, b) => {
      if (b.firstPartialScore01 !== a.firstPartialScore01) {
        return b.firstPartialScore01 - a.firstPartialScore01;
      }
      return a.reading.reading.localeCompare(b.reading.reading, "ko");
    })
    .slice(0, surnameConfig.beamTopK);

  const deduped = new Map<string, RecommendationItem>();
  const nameSeedInputs: Array<NamePreselectInput<NameExpansionSeedPayload>> = [];
  let readingPairCount = 0;
  let phoneticGateRejected = 0;
  let hanjaPairEvaluated = 0;
  let sameReadingRejected = 0;
  let whitelistRejected = 0;
  let preselectUniqueNameCount = 0;
  let preselectSelectedNameCount = 0;
  let preselectPoolSelectedCount = 0;
  let preselectExplorationSelectedCount = 0;
  const secondPartialWeightDenominator = Math.max(
    surnameConfig.weightSurnameSynergy +
      surnameConfig.weightSurnamePronFlow +
      surnameConfig.weightBalance3,
    0.0001
  );

  console.info(
    `[recommend] totalReadings=${readingEntries.length} usingTopK=${topReadings.length} firstBeam=${firstReadingBeam.length} limit=${limit} allowSize=${allowSyllables.size}`
  );

  for (let i = 0; i < firstReadingBeam.length; i += 1) {
    const firstEntry = firstReadingBeam[i];
    const firstReading = firstEntry.reading;
    const r1 = firstReading.reading;
    const firstRows = firstReading.rows;

    const secondReadingBeam = readingCandidates
      .filter((candidate) => {
        if (candidate.reading === r1) {
          sameReadingRejected += 1;
          return false;
        }
        return true;
      })
      .map((candidate) => ({
        reading: candidate,
        secondPartialRaw: scoreSecondReadingPartial(
          request.surnameHangul,
          surnameElement,
          firstReading,
          candidate,
          sajuVector.vector,
          surnameConfig
        )
      }))
      .sort((a, b) => {
        if (b.secondPartialRaw !== a.secondPartialRaw) {
          return b.secondPartialRaw - a.secondPartialRaw;
        }
        return a.reading.reading.localeCompare(b.reading.reading, "ko");
      })
      .slice(0, surnameConfig.beamTopK);

    for (const secondEntry of secondReadingBeam) {
      const secondReading = secondEntry.reading;
      const r2 = secondReading.reading;
      readingPairCount += 1;

      if (!allowSyllables.has(r1) || !allowSyllables.has(r2)) {
        whitelistRejected += 1;
        continue;
      }

      const nameHangul = `${r1}${r2}`;
      const secondPartialScore01 = clamp01(
        secondEntry.secondPartialRaw / secondPartialWeightDenominator
      );
      const partialEngineScore01 = clamp01(
        firstEntry.firstPartialScore01 * 0.4 + secondPartialScore01 * 0.6
      );

      nameSeedInputs.push({
        name: nameHangul,
        partialEngineScore01,
        payload: {
          r1,
          r2,
          firstRows,
          secondRows: secondReading.rows
        }
      });
    }

    if ((i + 1) % 20 === 0 || i === firstReadingBeam.length - 1) {
      console.info(`[recommend] readingProgress=${i + 1}/${firstReadingBeam.length}`);
    }
  }

  const preselectedNameSeeds = preselectNameSeeds(
    nameSeedInputs,
    poolTargetGender,
    poolIndex,
    {
      limit: resolveNamePreselectLimit(limit),
      explorationMinRatio: PRESELECT_EXPLORATION_RATIO,
      explorationMinCount: PRESELECT_EXPLORATION_MIN
    }
  );
  preselectUniqueNameCount = preselectedNameSeeds.stats.totalUnique;
  preselectSelectedNameCount = preselectedNameSeeds.selected.length;
  preselectPoolSelectedCount = preselectedNameSeeds.stats.selectedPool;
  preselectExplorationSelectedCount = preselectedNameSeeds.stats.selectedExploration;

  console.info(
    `[recommend] preselect unique=${preselectUniqueNameCount} selected=${preselectSelectedNameCount} poolSelected=${preselectPoolSelectedCount} explorationSelected=${preselectExplorationSelectedCount}`
  );

  for (const seed of preselectedNameSeeds.selected) {
    const { r1, r2, firstRows, secondRows } = seed.payload;
    const nameHangul = seed.name;
    const fullHangul = `${request.surnameHangul}${nameHangul}`;
    const phonetic = scorePhonetic(fullHangul);
    if (phonetic.gated) {
      phoneticGateRejected += 1;
      continue;
    }

    const soundElement = scoreSoundElement(nameHangul, {
      surnameHanja: request.surnameHanja,
      surnameElements
    });
    const gender = scoreGender(nameHangul, request.gender);

    for (const h1 of firstRows) {
      for (const h2 of secondRows) {
        hanjaPairEvaluated += 1;

        const meaningTags = uniqueNonEmpty([...h1.meaningTags, ...h2.meaningTags]);
        const meaning = scoreMeaning(meaningTags);

        const baseNameScore =
          WEIGHTS.phonetic * phonetic.score +
          WEIGHTS.meaning * meaning.score +
          WEIGHTS.soundElement * soundElement.score +
          WEIGHTS.aux * (gender.score + sajuBaseScore.score);
        const baseNameScore01 = clamp01(baseNameScore / 100);

        const char1Element = resolveResourceElement(h1);
        const char2Element = resolveResourceElement(h2);

        const surnameSynergy = scoreSurnameSynergy({
          surnameElement,
          char1Element,
          char2Element,
          config: surnameConfig
        });
        const surnamePronFlow = scoreSurnamePronunciationFlow(
          request.surnameHangul,
          nameHangul
        );
        const balance3 = scoreBalance3({
          surnameElement,
          char1Element,
          char2Element,
          sajuVector: sajuVector.vector,
          config: surnameConfig
        });

        const finalScore01 = clamp01(
          surnameConfig.weightBaseName * baseNameScore01 +
            surnameConfig.weightSurnameSynergy * surnameSynergy.score +
            surnameConfig.weightSurnamePronFlow * surnamePronFlow.score +
            surnameConfig.weightBalance3 * balance3.score
        );
        const finalScore = finalScore01 * 100;

        const key = `${nameHangul}|${h1.hanja}${h2.hanja}`;
        const candidate: RecommendationItem = {
          rank: 0,
          surnameHangul: request.surnameHangul,
          surnameHanja: request.surnameHanja,
          nameHangul,
          fullHangul,
          hanja: `${h1.hanja}${h2.hanja}`,
          hanjaPair: [h1.hanja, h2.hanja],
          unicodePair: [h1.unicode, h2.unicode],
          readingPair: [r1, r2],
          meaningKwPair: [h1.meaningKw, h2.meaningKw],
          meaningTags,
          scores: {
            phonetic: phonetic.score,
            meaning: meaning.score,
            soundElement: soundElement.score,
            gender: gender.score,
            saju: sajuBaseScore.score,
            baseName: toFixed2(baseNameScore01 * 100),
            surnameSynergy: toFixed2(surnameSynergy.score * 100),
            surnamePronFlow: toFixed2(surnamePronFlow.score * 100),
            balance3: toFixed2(balance3.score * 100),
            total: toFixed2(finalScore)
          },
          reasons: {
            phonetic: [...phonetic.reasons],
            meaning: [...meaning.reasons],
            soundElement: [...soundElement.reasons],
            gender: [...gender.reasons],
            saju: [...sajuBaseScore.reasons],
            surnameSynergy: [...surnameSynergy.reasons],
            surnamePronFlow: [...surnamePronFlow.reasons],
            balance3: [...balance3.reasons]
          }
        };

        if (surnameDiagnostics) {
          console.info(
            `[recommend][surname] ${request.surnameHangul}${nameHangul}(${h1.hanja}${h2.hanja}) ` +
              `base=${(baseNameScore01 * 100).toFixed(2)} ` +
              `synergy=${(surnameSynergy.score * 100).toFixed(2)} ` +
              `pron=${(surnamePronFlow.score * 100).toFixed(2)} ` +
              `balance=${(balance3.score * 100).toFixed(2)} ` +
              `final=${finalScore.toFixed(2)}`
          );
        }

        const existing = deduped.get(key);
        if (!existing || candidate.scores.total > existing.scores.total) {
          deduped.set(key, candidate);
        }
      }
    }
  }

  console.info(
    `[recommend] filteredPairs sameReading=${sameReadingRejected} whitelist=${whitelistRejected}`
  );

  const priorEvaluatedCount = deduped.size;
  const priorConfig = {
    priorWeight: parsePriorWeightEnv(process.env.PRIOR_WEIGHT),
    strictGate: parseBooleanEnv(process.env.PRIOR_STRICT_GATE, DEFAULT_STRICT_GATE),
    allowNonWhitelist: parseBooleanEnv(
      process.env.PRIOR_ALLOW_NON_WHITELIST,
      DEFAULT_ALLOW_NON_WHITELIST
    )
  } as const;
  const priorIndex = loadNamePriorIndex();
  const priorEvaluations = applyFinalScoreWithPrior(
    Array.from(deduped.values()),
    mapEngineGenderToPriorGender(request.gender),
    priorIndex,
    priorConfig
  );

  const priorGateRejectedByType: Record<Exclude<PriorGate, "PASS">, number> = {
    FAIL_SYLLABLE: 0,
    FAIL_BLACKLIST: 0,
    FAIL_PATTERN: 0
  };
  const priorAdjustedCandidates: RecommendationItem[] = [];

  for (const row of priorEvaluations) {
    if (row.gate !== "PASS") {
      priorGateRejectedByType[row.gate] += 1;
    }
    if (row.dropped) {
      continue;
    }

    priorAdjustedCandidates.push({
      ...row.candidate,
      scores: {
        ...row.candidate.scores,
        engine: toFixed2(row.engineScore01 * 100),
        prior: toFixed2(row.priorScore01 * 100),
        total: toFixed2(row.finalScore01 * 100)
      },
      reasons: {
        ...row.candidate.reasons,
        prior: [...row.reasons]
      }
    });
  }

  if (process.env.PRIOR_DIAGNOSTICS === "1") {
    const diagnostics = buildPriorDiagnosticRows(priorEvaluations, 10);
    console.info(`[recommend][prior]\n${formatPriorDiagnosticRows(diagnostics)}`);
  }

  const candidatesForRanking =
    priorAdjustedCandidates.length > 0 ? priorAdjustedCandidates : Array.from(deduped.values());

  if (priorAdjustedCandidates.length === 0 && deduped.size > 0) {
    console.warn("[recommend] prior gate removed all candidates; fallback to engine-only ranking");
  }

  const softRerankedRows = rerankWithSoftPrior(
    candidatesForRanking.map((candidate) => ({
      name: candidate.nameHangul,
      engineScore01: resolveEngineScore01(candidate),
      candidate
    })),
    poolTargetGender,
    poolIndex
  );

  const poolDebugEnabled = parseBooleanEnv(
    process.env.POOL_RERANK_DEBUG,
    DEFAULT_POOL_RERANK_DEBUG
  );
  if (poolDebugEnabled) {
    console.info(`[recommend][soft-prior][top30]\n${formatSoftPriorTable(softRerankedRows, 30)}`);
  }

  const rerankedCandidates = softRerankedRows.map((row) => {
    const candidate = row.candidate;
    const poolReason = [
      `tier=${row.pool.tier}`,
      `poolIncluded=${row.pool.poolIncluded ? "Y" : "N"}`,
      `engine=${row.breakdown.engineScore01.toFixed(4)} pool=${row.breakdown.poolScore01.toFixed(4)} tierBonus=${row.breakdown.tierBonus01.toFixed(4)}`
    ];

    return {
      ...candidate,
      scores: {
        ...candidate.scores,
        engine: toFixed2(row.breakdown.engineScore01 * 100),
        pool: toFixed2(row.breakdown.poolScore01 * 100),
        tierBonus: toFixed2(row.breakdown.tierBonus01 * 100),
        total: toFixed2(row.breakdown.finalScore01 * 100)
      },
      reasons: {
        ...candidate.reasons,
        pool: poolReason
      },
      debug: {
        ...(candidate.debug ?? {}),
        softPrior: {
          poolIncluded: row.pool.poolIncluded,
          tier: row.pool.tier,
          engineScore01: row.breakdown.engineScore01,
          poolScore01: row.breakdown.poolScore01,
          tierBonus01: row.breakdown.tierBonus01,
          finalScore01: row.breakdown.finalScore01
        }
      }
    } satisfies RecommendationItem;
  });

  const recommendations = selectDiverseRecommendations(rerankedCandidates, limit);
  if (poolDebugEnabled) {
    const finalRows = toSoftPriorRowsFromRecommendations(recommendations);
    console.info(`[recommend][soft-prior][top10]\n${formatSoftPriorTable(finalRows, 10)}`);
  }

  return {
    request: {
      ...request,
      limit
    },
    saju: {
      precision: sajuVector.precision,
      vector: sajuVector.vector,
      reasons: sajuBaseScore.reasons,
      pillars: sajuVector.pillars
    },
    meta: {
      totalReadingCount: readingEntries.length,
      usedReadingCount: firstReadingBeam.length,
      readingPairCount,
      hanjaPairEvaluated,
      phoneticGateRejected,
      dedupedCandidateCount: deduped.size,
      priorEvaluatedCount,
      priorGateRejectedCount:
        priorGateRejectedByType.FAIL_SYLLABLE +
        priorGateRejectedByType.FAIL_BLACKLIST +
        priorGateRejectedByType.FAIL_PATTERN,
      priorGateRejectedByType,
      softPriorApplied: true,
      preselectUniqueNameCount,
      preselectSelectedNameCount,
      preselectPoolSelectedCount,
      preselectExplorationSelectedCount
    },
    recommendations
  };
}
