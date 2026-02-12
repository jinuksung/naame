import { PriorIndex } from "./buildNamePrior";
import { evaluateNamePriorGate, PriorGate } from "./gates";

export type Gender = "M" | "F" | "U";

export interface PriorScoreResult {
  gate: PriorGate;
  priorScore01: number;
  reasons: string[];
}

export interface ScoreNamePriorOptions {
  strict?: boolean;
  alpha?: number;
}

function clamp01(value: number): number {
  return Math.max(0, Math.min(1, value));
}

function normalizeToUnit(value: number, min: number, max: number): number {
  if (!Number.isFinite(value)) {
    return 0;
  }
  if (!Number.isFinite(min) || !Number.isFinite(max) || max - min < 1e-9) {
    return 0.5;
  }
  return clamp01((value - min) / (max - min));
}

function toPriorGenderKey(gender: Gender): "M" | "F" | "ALL" {
  if (gender === "M") {
    return "M";
  }
  if (gender === "F") {
    return "F";
  }
  return "ALL";
}

function getTotalSyllablesByGender(
  priorIndex: PriorIndex,
  key: "M" | "F" | "ALL"
): number {
  return priorIndex.totalCountsByGender[key] * 2;
}

export function scoreNamePrior(
  name2: string,
  gender: Gender,
  priorIndex: PriorIndex,
  options: ScoreNamePriorOptions = {}
): PriorScoreResult {
  const alpha = Number.isFinite(options.alpha) ? Math.max(options.alpha ?? 0, 1e-4) : 1;
  const strict = options.strict ?? true;
  const reasons: string[] = [];

  const gateResult = evaluateNamePriorGate(name2, priorIndex, { strict });
  reasons.push(...gateResult.reasons);

  if (name2.length !== 2) {
    return {
      gate: gateResult.gate,
      priorScore01: 0,
      reasons
    };
  }

  let indexKey = toPriorGenderKey(gender);
  let syllableFreq = priorIndex.syllableFreqByGender[indexKey];
  let syllableSet = priorIndex.syllableSetByGender[indexKey];
  let bigramSet = priorIndex.bigramSetByGender[indexKey];
  let totalSyllables = getTotalSyllablesByGender(priorIndex, indexKey);

  if ((totalSyllables === 0 || syllableSet.size === 0) && indexKey !== "ALL") {
    indexKey = "ALL";
    syllableFreq = priorIndex.syllableFreqByGender.ALL;
    syllableSet = priorIndex.syllableSetByGender.ALL;
    bigramSet = priorIndex.bigramSetByGender.ALL;
    totalSyllables = getTotalSyllablesByGender(priorIndex, "ALL");
    reasons.push("성별 prior 데이터 부족으로 ALL index fallback");
  }

  if (totalSyllables === 0 || syllableSet.size === 0) {
    const emptyScore = gateResult.gate === "PASS" ? 0.5 : 0;
    reasons.push("prior 데이터가 비어 기본 점수 사용");
    return {
      gate: gateResult.gate,
      priorScore01: emptyScore,
      reasons
    };
  }

  const s1 = name2[0];
  const s2 = name2[1];
  const vocabSize = Math.max(syllableSet.size, 1);
  const denominator = totalSyllables + alpha * vocabSize;
  const p1 = ((syllableFreq.get(s1) ?? 0) + alpha) / denominator;
  const p2 = ((syllableFreq.get(s2) ?? 0) + alpha) / denominator;
  const logScore = Math.log(p1) + Math.log(p2);

  const observedFreqs = Array.from(syllableFreq.values());
  const minObserved = observedFreqs.length > 0 ? Math.min(...observedFreqs) : 0;
  const maxObserved = observedFreqs.length > 0 ? Math.max(...observedFreqs) : 0;

  const minLog = 2 * Math.log((minObserved + alpha) / denominator);
  const maxLog = 2 * Math.log((maxObserved + alpha) / denominator);

  let priorScore01 = normalizeToUnit(logScore, minLog, maxLog);
  reasons.push(
    `prior(${indexKey}) p1=${p1.toFixed(4)} p2=${p2.toFixed(4)} log=${logScore.toFixed(4)}`
  );

  if (bigramSet.has(name2)) {
    priorScore01 = clamp01(priorScore01 + 0.25);
    reasons.push("상위 이름 bigram 일치 +0.25");
  }

  if (gateResult.penalty01 > 0) {
    priorScore01 = clamp01(priorScore01 - gateResult.penalty01);
    reasons.push(`gate/pattern 감점 -${gateResult.penalty01.toFixed(2)}`);
  }

  return {
    gate: gateResult.gate,
    priorScore01: clamp01(priorScore01),
    reasons
  };
}
