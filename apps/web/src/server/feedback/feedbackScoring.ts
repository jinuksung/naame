import type { FreeRecommendResultItem, FreeRecommendResponse } from "@/types/recommend";

export interface NameFeedbackStats {
  likes: number;
  dislikes: number;
}

export type NameFeedbackStatsMap = Map<string, NameFeedbackStats>;

const MIN_VOTE_THRESHOLD = 2;
const FEEDBACK_WEIGHT = 0.4;
const FEEDBACK_DELTA_LIMIT = 8;

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function toSafeInteger(value: number): number {
  if (!Number.isFinite(value)) {
    return 0;
  }
  return Math.max(0, Math.round(value));
}

function buildFeedbackDelta(stats: NameFeedbackStats): number {
  const likes = toSafeInteger(stats.likes);
  const dislikes = toSafeInteger(stats.dislikes);
  const totalVotes = likes + dislikes;
  if (totalVotes < MIN_VOTE_THRESHOLD) {
    return 0;
  }

  const net = likes - dislikes;
  const confidence = clamp(totalVotes / 30, 0, 1);
  return clamp(net * FEEDBACK_WEIGHT * confidence, -FEEDBACK_DELTA_LIMIT, FEEDBACK_DELTA_LIMIT);
}

export function buildFeedbackNameKey(
  item: Pick<FreeRecommendResultItem, "nameHangul" | "hanjaPair">,
): string {
  const nameHangul = item.nameHangul.trim();
  const hanja = `${item.hanjaPair[0]}${item.hanjaPair[1]}`.trim();
  return `${nameHangul}:${hanja}`;
}

export function applyFeedbackScores(
  results: FreeRecommendResponse["results"],
  statsMap: NameFeedbackStatsMap,
): FreeRecommendResponse["results"] {
  const scored = results.map((item, index) => {
    const key = buildFeedbackNameKey(item);
    const stats = statsMap.get(key);
    const delta = stats ? buildFeedbackDelta(stats) : 0;
    return {
      ...item,
      score: clamp(Math.round(item.score + delta), 0, 99),
      _baseIndex: index,
    };
  });

  scored.sort((a, b) => {
    if (b.score !== a.score) {
      return b.score - a.score;
    }
    return a._baseIndex - b._baseIndex;
  });

  return scored.map(({ _baseIndex: _, ...item }) => item);
}
