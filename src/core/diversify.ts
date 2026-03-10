import type { DiversityStats, OutputItem, ScoredCandidate, Tier } from "../types";

const TIER_PRIORITY: Record<Tier, number> = { B: 3, A: 2, C: 1 };

export interface DiversifyOptions {
  targetCount: number;
  minCount: number;
  maxPerStart: number;
  maxPerEnd: number;
}

function sortCandidates(candidates: ScoredCandidate[]): ScoredCandidate[] {
  return [...candidates].sort((a, b) => {
    if (b.score !== a.score) {
      return b.score - a.score;
    }
    const tierDiff = TIER_PRIORITY[b.tier] - TIER_PRIORITY[a.tier];
    if (tierDiff !== 0) {
      return tierDiff;
    }
    return a.name.localeCompare(b.name, "ko");
  });
}

function countBySyllable(items: ScoredCandidate[], key: "start" | "end"): Map<string, number> {
  const counts = new Map<string, number>();
  for (const item of items) {
    const syllable = item.features[key];
    counts.set(syllable, (counts.get(syllable) ?? 0) + 1);
  }
  return counts;
}

function sortCountEntries(map: Map<string, number>): Array<[string, number]> {
  return [...map.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], "ko"));
}

function toOutputItems(items: ScoredCandidate[]): OutputItem[] {
  return items.map((item) => ({
    name: item.name,
    tier: item.tier,
    score: item.score,
    scoreBreakdown: item.scoreBreakdown,
    features: item.features
  }));
}

export function diversifyCandidates(
  candidates: ScoredCandidate[],
  options: DiversifyOptions
): { selected: OutputItem[]; stats: DiversityStats } {
  const sorted = sortCandidates(candidates);
  const selected: ScoredCandidate[] = [];
  const selectedNames = new Set<string>();

  const levels = [
    { maxPerStart: options.maxPerStart, maxPerEnd: options.maxPerEnd },
    { maxPerStart: options.maxPerStart + 1, maxPerEnd: options.maxPerEnd + 1 },
    { maxPerStart: options.maxPerStart + 2, maxPerEnd: options.maxPerEnd + 2 },
    { maxPerStart: Number.MAX_SAFE_INTEGER, maxPerEnd: Number.MAX_SAFE_INTEGER }
  ];

  for (const level of levels) {
    const startCounts = countBySyllable(selected, "start");
    const endCounts = countBySyllable(selected, "end");
    for (const candidate of sorted) {
      if (selected.length >= options.targetCount) {
        break;
      }
      if (selectedNames.has(candidate.name)) {
        continue;
      }

      const start = candidate.features.start;
      const end = candidate.features.end;
      if ((startCounts.get(start) ?? 0) >= level.maxPerStart) {
        continue;
      }
      if ((endCounts.get(end) ?? 0) >= level.maxPerEnd) {
        continue;
      }

      selected.push(candidate);
      selectedNames.add(candidate.name);
      startCounts.set(start, (startCounts.get(start) ?? 0) + 1);
      endCounts.set(end, (endCounts.get(end) ?? 0) + 1);
    }
    if (selected.length >= options.targetCount) {
      break;
    }
  }

  if (selected.length < options.minCount) {
    for (const candidate of sorted) {
      if (selected.length >= options.minCount) {
        break;
      }
      if (selectedNames.has(candidate.name)) {
        continue;
      }
      selected.push(candidate);
      selectedNames.add(candidate.name);
    }
  }

  const finalSelected = selected.slice(0, Math.min(options.targetCount, selected.length));
  const startCounts = sortCountEntries(countBySyllable(finalSelected, "start"));
  const endCounts = sortCountEntries(countBySyllable(finalSelected, "end"));

  const stats: DiversityStats = {
    startCounts: startCounts.slice(0, 10),
    endCounts: endCounts.slice(0, 10),
    maxPerStartUsed: startCounts[0]?.[1] ?? 0,
    maxPerEndUsed: endCounts[0]?.[1] ?? 0
  };

  return {
    selected: toOutputItems(finalSelected),
    stats
  };
}
