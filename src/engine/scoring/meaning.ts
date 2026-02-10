import { MeaningScoreResult } from "../../types";

function clampScore(score: number): number {
  return Math.max(0, Math.min(100, score));
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

export function scoreMeaning(tags: string[]): MeaningScoreResult {
  const reasons: string[] = [];
  const uniqueTags = uniqueNonEmpty(tags);
  const uniqueTagCount = uniqueTags.length;

  let score = 85;
  if (uniqueTagCount >= 3) {
    score += 10;
    reasons.push(`의미 태그 다양성 높음 (${uniqueTagCount}개)`);
  } else if (uniqueTagCount === 2) {
    score += 5;
    reasons.push("의미 태그 2개");
  } else if (uniqueTagCount === 1) {
    score -= 5;
    reasons.push("의미 태그가 1개라 정보량 제한");
  } else {
    score -= 25;
    reasons.push("의미 태그가 없어 정보량 부족");
  }

  return {
    score: clampScore(score),
    reasons,
    uniqueTags,
    uniqueTagCount
  };
}
