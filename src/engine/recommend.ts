import { readFileSync } from "node:fs";
import {
  HanjaDataset,
  HanjaRow,
  RecommendRequest,
  RecommendResult,
  RecommendationItem
} from "../types";
import { scoreGender } from "./scoring/gender";
import { scoreMeaning } from "./scoring/meaning";
import { scorePhonetic } from "./scoring/phonetic";
import { calcSajuElementVector, scoreSajuFit } from "./scoring/sajuElements";
import { scoreSoundElement } from "./scoring/soundElement";
import { ALLOW_SYLLABLES } from "./whitelist/allowSyllables";

const TOP_READING_K = 120;
const HANJA_PER_READING = 20;
const MAX_SAME_FIRST_READING_IN_TOP10 = 2;
const SINGLE_HANGUL_SYLLABLE_PATTERN = /^[가-힣]$/;

let cachedWhitelistPath: string | null = null;
let cachedWhitelist: Set<string> | null = null;

const WEIGHTS = {
  phonetic: 0.45,
  meaning: 0.35,
  soundElement: 0.15,
  aux: 0.05
} as const;

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

function selectDiverseRecommendations(
  sorted: RecommendationItem[],
  limit: number
): RecommendationItem[] {
  const out: RecommendationItem[] = [];
  const seenReadingPattern = new Set<string>();
  const firstReadingCount = new Map<string, number>();

  for (const candidate of sorted) {
    const [r1, r2] = candidate.readingPair;
    const patternKey = `${r1}-${r2}`;
    if (seenReadingPattern.has(patternKey)) {
      continue;
    }

    const currentCount = firstReadingCount.get(r1) ?? 0;
    if (out.length < 10 && currentCount >= MAX_SAME_FIRST_READING_IN_TOP10) {
      continue;
    }

    seenReadingPattern.add(patternKey);
    firstReadingCount.set(r1, currentCount + 1);
    out.push({
      ...candidate,
      rank: out.length + 1
    });

    if (out.length >= limit) {
      break;
    }
  }

  return out;
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

  const sajuVector = calcSajuElementVector(request.birth);
  const sajuBaseScore = scoreSajuFit("", sajuVector.vector, {
    precision: sajuVector.precision,
    pillars: sajuVector.pillars,
    preReasons: sajuVector.reasons
  });

  const deduped = new Map<string, RecommendationItem>();
  let readingPairCount = 0;
  let phoneticGateRejected = 0;
  let hanjaPairEvaluated = 0;
  let sameReadingRejected = 0;
  let whitelistRejected = 0;

  console.info(
    `[recommend] totalReadings=${readingEntries.length} usingTopK=${topReadings.length} limit=${limit} allowSize=${allowSyllables.size}`
  );

  for (let i = 0; i < topReadings.length; i += 1) {
    const r1 = topReadings[i];
    const firstRows = getTopHanjaRows(dataset.byReading.get(r1), HANJA_PER_READING);
    if (firstRows.length === 0) {
      continue;
    }

    for (let j = 0; j < topReadings.length; j += 1) {
      const r2 = topReadings[j];
      readingPairCount += 1;

      if (r1 === r2) {
        sameReadingRejected += 1;
        continue;
      }

      if (!allowSyllables.has(r1) || !allowSyllables.has(r2)) {
        whitelistRejected += 1;
        continue;
      }

      const secondRows = getTopHanjaRows(dataset.byReading.get(r2), HANJA_PER_READING);
      if (secondRows.length === 0) {
        continue;
      }

      const nameHangul = `${r1}${r2}`;
      const fullHangul = `${request.surnameHangul}${nameHangul}`;
      const phonetic = scorePhonetic(fullHangul);
      if (phonetic.gated) {
        phoneticGateRejected += 1;
        continue;
      }

      const soundElement = scoreSoundElement(nameHangul);
      const gender = scoreGender(nameHangul, request.gender);

      for (const h1 of firstRows) {
        for (const h2 of secondRows) {
          hanjaPairEvaluated += 1;

          const meaningTags = uniqueNonEmpty([...h1.meaningTags, ...h2.meaningTags]);
          const meaning = scoreMeaning(meaningTags);

          const total =
            WEIGHTS.phonetic * phonetic.score +
            WEIGHTS.meaning * meaning.score +
            WEIGHTS.soundElement * soundElement.score +
            WEIGHTS.aux * (gender.score + sajuBaseScore.score);

          const key = `${nameHangul}|${h1.hanja}${h2.hanja}`;
          const candidate: RecommendationItem = {
            rank: 0,
            surnameHangul: request.surnameHangul,
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
              total: toFixed2(total)
            },
            reasons: {
              phonetic: [...phonetic.reasons],
              meaning: [...meaning.reasons],
              soundElement: [...soundElement.reasons],
              gender: [...gender.reasons],
              saju: [...sajuBaseScore.reasons]
            }
          };

          const existing = deduped.get(key);
          if (!existing || candidate.scores.total > existing.scores.total) {
            deduped.set(key, candidate);
          }
        }
      }
    }

    if ((i + 1) % 20 === 0 || i === topReadings.length - 1) {
      console.info(`[recommend] readingProgress=${i + 1}/${topReadings.length}`);
    }
  }

  console.info(
    `[recommend] filteredPairs sameReading=${sameReadingRejected} whitelist=${whitelistRejected}`
  );

  const sorted = Array.from(deduped.values()).sort((a, b) => {
    if (b.scores.total !== a.scores.total) {
      return b.scores.total - a.scores.total;
    }
    if (b.scores.meaning !== a.scores.meaning) {
      return b.scores.meaning - a.scores.meaning;
    }
    if (b.scores.phonetic !== a.scores.phonetic) {
      return b.scores.phonetic - a.scores.phonetic;
    }
    return a.hanja.localeCompare(b.hanja, "ko");
  });

  const recommendations = selectDiverseRecommendations(sorted, limit);

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
      usedReadingCount: topReadings.length,
      readingPairCount,
      hanjaPairEvaluated,
      phoneticGateRejected,
      dedupedCandidateCount: deduped.size
    },
    recommendations
  };
}
