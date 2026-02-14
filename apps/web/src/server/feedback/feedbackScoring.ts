import type { FreeRecommendResultItem, FreeRecommendResponse } from "@/types/recommend";

export interface FeedbackSurnameContext {
  surnameHangul: string;
  surnameHanja: string;
}

export interface NameFeedbackStats {
  likes: number;
  dislikes: number;
}

export type NameFeedbackStatsMap = Map<string, NameFeedbackStats>;

interface FeedbackHangulKeyInput {
  surnameHangul: string;
  nameHangul: string;
}

const MIN_VOTE_THRESHOLD = 2;
const FEEDBACK_WEIGHT = 0.4;
const FEEDBACK_DELTA_LIMIT = 8;
const DISLIKE_PENALTY_WEIGHT = 0.35;
const DISLIKE_PENALTY_LIMIT = 6;

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
  const baseDelta = net * FEEDBACK_WEIGHT * confidence;
  const dislikePenalty = clamp(
    dislikes * DISLIKE_PENALTY_WEIGHT * confidence,
    0,
    DISLIKE_PENALTY_LIMIT,
  );
  return clamp(baseDelta - dislikePenalty, -FEEDBACK_DELTA_LIMIT, FEEDBACK_DELTA_LIMIT);
}

export function buildFeedbackNameKey(
  item: FeedbackSurnameContext & Pick<FreeRecommendResultItem, "nameHangul" | "hanjaPair">,
): string {
  const surnameHangul = item.surnameHangul.trim();
  const surnameHanja = item.surnameHanja.trim();
  const nameHangul = item.nameHangul.trim();
  const hanja = `${item.hanjaPair[0]}${item.hanjaPair[1]}`.trim();
  return `${surnameHangul}:${surnameHanja}:${nameHangul}:${hanja}`;
}

export function buildFeedbackHangulKey(item: FeedbackHangulKeyInput): string {
  const surnameHangul = item.surnameHangul.trim();
  const nameHangul = item.nameHangul.trim();
  return `${surnameHangul}:${nameHangul}`;
}

export function applyFeedbackScores(
  results: FreeRecommendResponse["results"],
  statsMap: NameFeedbackStatsMap,
  surnameContext: FeedbackSurnameContext,
): FreeRecommendResponse["results"] {
  const scored = results.map((item, index) => {
    const key = buildFeedbackHangulKey({
      surnameHangul: surnameContext.surnameHangul,
      nameHangul: item.nameHangul,
    });
    const stats = statsMap.get(key);
    const delta = stats ? buildFeedbackDelta(stats) : 0;
    const adjustedRawScore = clamp(item.score + delta, 0, 99);
    return {
      ...item,
      score: Math.round(adjustedRawScore),
      _sortScore: adjustedRawScore,
      _baseIndex: index,
    };
  });

  scored.sort((a, b) => {
    if (b._sortScore !== a._sortScore) {
      return b._sortScore - a._sortScore;
    }
    return a._baseIndex - b._baseIndex;
  });

  return scored.map(({ _sortScore: _, _baseIndex: __, ...item }) => item);
}
