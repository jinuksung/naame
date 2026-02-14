import { Gender, ScoreResult } from "../../types";
import { loadNamePriorIndex } from "../../lib/namefit/prior/buildNamePrior";

const TWO_SYLLABLE_HANGUL = /^[가-힣]{2}$/;
const LOG_ODDS_WEIGHT = 6;
const SCORE_LIMIT = 12;
const ALPHA = 0.5;

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function normalizeGender(gender: Gender): "M" | "F" | null {
  if (gender === "MALE") {
    return "M";
  }
  if (gender === "FEMALE") {
    return "F";
  }
  return null;
}

function scoreBySyllableLikelihood(
  nameHangul: string,
  target: "M" | "F",
): { score: number; reasons: string[] } {
  const index = loadNamePriorIndex();
  const opposite: "M" | "F" = target === "M" ? "F" : "M";

  const targetTotal = index.totalCountsByGender[target] * 2;
  const oppositeTotal = index.totalCountsByGender[opposite] * 2;
  if (targetTotal <= 0 || oppositeTotal <= 0) {
    return { score: 0, reasons: ["성별 prior 데이터 부족으로 중립 점수"] };
  }

  const targetFreq = index.syllableFreqByGender[target];
  const oppositeFreq = index.syllableFreqByGender[opposite];
  const targetVocab = Math.max(index.syllableSetByGender[target].size, 1);
  const oppositeVocab = Math.max(index.syllableSetByGender[opposite].size, 1);

  const syllables = [...nameHangul];
  const [s1, s2] = syllables;
  const targetP1 = ((targetFreq.get(s1) ?? 0) + ALPHA) / (targetTotal + ALPHA * targetVocab);
  const targetP2 = ((targetFreq.get(s2) ?? 0) + ALPHA) / (targetTotal + ALPHA * targetVocab);
  const oppositeP1 = ((oppositeFreq.get(s1) ?? 0) + ALPHA) / (oppositeTotal + ALPHA * oppositeVocab);
  const oppositeP2 = ((oppositeFreq.get(s2) ?? 0) + ALPHA) / (oppositeTotal + ALPHA * oppositeVocab);

  const targetLog = Math.log(targetP1) + Math.log(targetP2);
  const oppositeLog = Math.log(oppositeP1) + Math.log(oppositeP2);
  const logOdds = targetLog - oppositeLog;
  const score = clamp(logOdds * LOG_ODDS_WEIGHT, -SCORE_LIMIT, SCORE_LIMIT);

  const targetBigramHit = index.bigramSetByGender[target].has(nameHangul);
  const oppositeBigramHit = index.bigramSetByGender[opposite].has(nameHangul);

  const reasons = [
    `gender(${target}) logOdds=${logOdds.toFixed(3)} score=${score.toFixed(2)}`,
    `bigram(target=${targetBigramHit ? "Y" : "N"}, opposite=${oppositeBigramHit ? "Y" : "N"})`,
  ];

  return { score, reasons };
}

export function scoreGender(nameHangul: string, gender: Gender): ScoreResult {
  const normalized = normalizeGender(gender);
  if (normalized == null) {
    return {
      score: 0,
      reasons: ["성별 중립 모드로 점수 0"]
    };
  }

  if (!TWO_SYLLABLE_HANGUL.test(nameHangul)) {
    return {
      score: 0,
      reasons: ["2글자 한글 이름이 아니어서 성별 점수 생략"]
    };
  }

  try {
    return scoreBySyllableLikelihood(nameHangul, normalized);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return {
      score: 0,
      reasons: [`성별 점수 계산 실패로 중립 처리: ${message}`]
    };
  }
}
