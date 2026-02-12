import { PhoneticScoreResult } from "../../types";

const HANGUL_START = 0xac00;
const HANGUL_END = 0xd7a3;

function clampScore(score: number): number {
  return Math.max(0, Math.min(100, score));
}

function isHangulSyllable(ch: string): boolean {
  const code = ch.charCodeAt(0);
  return code >= HANGUL_START && code <= HANGUL_END;
}

export function scorePhonetic(fullHangulName: string): PhoneticScoreResult {
  const syllables = [...fullHangulName].filter(isHangulSyllable);
  const syllableCount = syllables.length;
  const reasons: string[] = [];

  let jongseongCount = 0;
  for (const syllable of syllables) {
    const code = syllable.charCodeAt(0);
    const jong = (code - HANGUL_START) % 28;
    if (jong !== 0) {
      jongseongCount += 1;
    }
  }

  const jongseongRatio = syllableCount > 0 ? jongseongCount / syllableCount : 1;

  let score = 100;

  if (syllableCount < 2) {
    score -= 30;
    reasons.push("음절 수가 2 미만이라 감점");
  }

  if (jongseongRatio >= 0.6) {
    score -= 18;
    reasons.push(`종성 비율 ${jongseongRatio.toFixed(2)} (>= 0.60)`);
  } else if (jongseongRatio >= 0.4) {
    score -= 10;
    reasons.push(`종성 비율 ${jongseongRatio.toFixed(2)} (>= 0.40)`);
  }

  score = clampScore(score);
  const gated = score < 70;
  if (gated) {
    reasons.push(`발음 게이트 탈락 (${score.toFixed(1)} < 70)`);
  }

  return {
    score,
    reasons,
    gated,
    syllableCount,
    jongseongRatio
  };
}
