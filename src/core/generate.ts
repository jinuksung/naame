import type { Gender, LoadedInput, NameCandidate, SyllableStats, Tier } from "../types";

const TIER_PRIORITY: Record<Tier, number> = { A: 3, B: 2, C: 1 };

function splitTwoSyllable(name: string): { start: string; end: string } {
  const [start, end] = [...name];
  if (!start || !end) {
    throw new Error(`Expected 2-syllable name, got: ${name}`);
  }
  return { start, end };
}

function inRange(value: number, min: number, max: number): boolean {
  return value >= min && value <= max;
}

function upsertCandidate(
  map: Map<string, NameCandidate>,
  name: string,
  tier: Tier
): void {
  const candidate: NameCandidate = {
    name,
    tier,
    features: splitTwoSyllable(name)
  };
  const existing = map.get(name);
  if (!existing || TIER_PRIORITY[candidate.tier] > TIER_PRIORITY[existing.tier]) {
    map.set(name, candidate);
  }
}

export function generateCandidatesForGender(
  gender: Gender,
  input: LoadedInput,
  stats: SyllableStats
): NameCandidate[] {
  const profile = stats.profiles[gender];
  const candidates = new Map<string, NameCandidate>();

  for (const sourceName of input.allTwoSyllableSet) {
    upsertCandidate(candidates, sourceName, "A");
  }

  const starts = [...profile.startFreq.keys()];
  const ends = [...profile.endFreq.keys()];
  for (const start of starts) {
    for (const end of ends) {
      if (start === end) {
        continue;
      }
      const startPct = profile.startPercentile.get(start) ?? 0;
      const endPct = profile.endPercentile.get(end) ?? 0;
      const tooCommon = profile.commonStartSet.has(start) || profile.commonEndSet.has(end);
      const isMidRank = inRange(startPct, 0.3, 0.8) && inRange(endPct, 0.3, 0.8);
      const tier: Tier = isMidRank && !tooCommon ? "B" : "C";
      const name = `${start}${end}`;
      if (input.allTwoSyllableSet.has(name)) {
        continue;
      }
      upsertCandidate(candidates, name, tier);
    }
  }

  const allSyllables = [...profile.allFreq.keys()];
  for (const start of allSyllables) {
    for (const end of allSyllables) {
      if (start === end) {
        continue;
      }
      const name = `${start}${end}`;
      if (candidates.has(name)) {
        continue;
      }
      upsertCandidate(candidates, name, "C");
    }
  }

  return [...candidates.values()];
}
