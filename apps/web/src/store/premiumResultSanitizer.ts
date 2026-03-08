import type { PremiumRecommendResultItem } from "../types/recommend";

function normalizeHalf(value: number): number {
  if (!Number.isFinite(value)) {
    return 0;
  }
  const clamped = Math.max(0, Math.min(5, value));
  return Math.round(clamped * 2) / 2;
}

export function sanitizePremiumResults(
  results: PremiumRecommendResultItem[]
): PremiumRecommendResultItem[] {
  return results.slice(0, 20).map((item, index) => ({
    ...item,
    rank: Number.isFinite(item.rank) ? item.rank : index + 1,
    sajuScore5: normalizeHalf(item.sajuScore5),
    soundScore5: normalizeHalf(item.soundScore5),
    engineScore01: Math.max(0, Math.min(1, item.engineScore01)),
    why: Array.isArray(item.why) && item.why.length > 0 ? item.why : ["추천 이유를 계산 중입니다."]
  }));
}
