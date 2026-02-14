import type { Gender, FrequencyProfile, LoadedInput, SyllableStats } from "../types";

function increment(map: Map<string, number>, key: string): void {
  map.set(key, (map.get(key) ?? 0) + 1);
}

function sortEntries(map: Map<string, number>): Array<[string, number]> {
  return [...map.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], "ko"));
}

function toPercentileMap(map: Map<string, number>): Map<string, number> {
  const entries = sortEntries(map);
  const out = new Map<string, number>();
  if (entries.length === 0) {
    return out;
  }
  const denominator = Math.max(entries.length - 1, 1);
  entries.forEach(([syllable], index) => {
    const percentile = entries.length === 1 ? 1 : 1 - index / denominator;
    out.set(syllable, percentile);
  });
  return out;
}

function topNSet(entries: Array<[string, number]>, n: number): Set<string> {
  return new Set(entries.slice(0, Math.max(0, n)).map(([syllable]) => syllable));
}

function intersectSets(a: Set<string>, b: Set<string>): string[] {
  return [...a].filter((value) => b.has(value)).sort((x, y) => x.localeCompare(y, "ko"));
}

function buildProfile(input: LoadedInput, gender: Gender, commonTopN: number): FrequencyProfile {
  const startFreq = new Map<string, number>();
  const endFreq = new Map<string, number>();
  const allFreq = new Map<string, number>();

  for (const item of input.twoSyllableItems) {
    if (item.gender !== gender) {
      continue;
    }
    const [start, end] = [...item.name];
    if (!start || !end) {
      continue;
    }
    increment(startFreq, start);
    increment(endFreq, end);
    increment(allFreq, start);
    increment(allFreq, end);
  }

  const startSorted = sortEntries(startFreq);
  const endSorted = sortEntries(endFreq);
  const startPercentile = toPercentileMap(startFreq);
  const endPercentile = toPercentileMap(endFreq);
  const allPercentile = toPercentileMap(allFreq);

  return {
    startFreq,
    endFreq,
    allFreq,
    startPercentile,
    endPercentile,
    allPercentile,
    commonStartSet: topNSet(startSorted, commonTopN),
    commonEndSet: topNSet(endSorted, commonTopN),
    startTop10: startSorted.slice(0, 10),
    endTop10: endSorted.slice(0, 10)
  };
}

export function buildSyllableStats(input: LoadedInput, commonTopN = 7): SyllableStats {
  const mProfile = buildProfile(input, "M", commonTopN);
  const fProfile = buildProfile(input, "F", commonTopN);

  const oneSyllableByGender: Record<Gender, string[]> = {
    M: input.oneSyllableItems
      .filter((item) => item.gender === "M")
      .map((item) => item.name)
      .sort((a, b) => a.localeCompare(b, "ko")),
    F: input.oneSyllableItems
      .filter((item) => item.gender === "F")
      .map((item) => item.name)
      .sort((a, b) => a.localeCompare(b, "ko"))
  };

  return {
    profiles: { M: mProfile, F: fProfile },
    commonStartIntersection: intersectSets(mProfile.commonStartSet, fProfile.commonStartSet),
    commonEndIntersection: intersectSets(mProfile.commonEndSet, fProfile.commonEndSet),
    oneSyllableByGender
  };
}
