import type { HanjaRow } from "../types";

function normalizeLimit(limit: number): number {
  if (!Number.isFinite(limit)) {
    return 0;
  }
  return Math.max(0, Math.floor(limit));
}

function riskCount(row: HanjaRow): number {
  return Array.isArray(row.riskFlags) ? row.riskFlags.length : 0;
}

function curatedTagCount(row: HanjaRow): number {
  return Array.isArray(row.curatedTags) ? row.curatedTags.length : 0;
}

function tagPriorityScore(row: HanjaRow): number {
  const raw = row.tagPriorityScore;
  if (typeof raw !== "number" || !Number.isFinite(raw)) {
    return 0;
  }
  return raw;
}

function meaningTagCount(row: HanjaRow): number {
  return Array.isArray(row.meaningTags) ? row.meaningTags.length : 0;
}

export function sortHanjaRowsByRecommendationPriority(
  rows: HanjaRow[] | undefined,
  limit: number,
): HanjaRow[] {
  if (!rows || rows.length === 0) {
    return [];
  }

  const safeLimit = normalizeLimit(limit);
  if (safeLimit === 0) {
    return [];
  }

  return [...rows]
    .sort((a, b) => {
      if (riskCount(a) !== riskCount(b)) {
        return riskCount(a) - riskCount(b);
      }

      if (curatedTagCount(b) !== curatedTagCount(a)) {
        return curatedTagCount(b) - curatedTagCount(a);
      }

      if (tagPriorityScore(b) !== tagPriorityScore(a)) {
        return tagPriorityScore(b) - tagPriorityScore(a);
      }

      if (meaningTagCount(b) !== meaningTagCount(a)) {
        return meaningTagCount(b) - meaningTagCount(a);
      }

      return a.hanja.localeCompare(b.hanja, "ko");
    })
    .slice(0, safeLimit);
}
