import assert from "node:assert/strict";
import { diversifyCandidates } from "../core/diversify";
import { scoreCandidates } from "../core/score";
import type { LoadedInput, NameCandidate, SyllableStats } from "../types";

function makeLoadedInput(): LoadedInput {
  return {
    inputPath: "/tmp/test.json",
    sourceFile: undefined,
    items: [],
    oneSyllableItems: [],
    twoSyllableItems: [],
    threeSyllableItems: [],
    byGender: { M: new Set<string>(), F: new Set<string>() },
    byGenderTwoSyllable: { M: new Set<string>(), F: new Set<string>() },
    allTwoSyllableSet: new Set<string>()
  };
}

function makeProfile(): SyllableStats["profiles"]["M"] {
  const syllables = ["가", "나", "다", "라", "마", "바", "사", "아", "자"];
  const startFreq = new Map<string, number>();
  const endFreq = new Map<string, number>();
  const allFreq = new Map<string, number>();
  const startPercentile = new Map<string, number>();
  const endPercentile = new Map<string, number>();
  const allPercentile = new Map<string, number>();

  for (const s of syllables) {
    startFreq.set(s, 10);
    endFreq.set(s, 10);
    allFreq.set(s, 10);
    startPercentile.set(s, 0.5);
    endPercentile.set(s, 0.5);
    allPercentile.set(s, 0.5);
  }

  return {
    startFreq,
    endFreq,
    allFreq,
    startPercentile,
    endPercentile,
    allPercentile,
    commonStartSet: new Set<string>(),
    commonEndSet: new Set<string>(),
    startTop10: [],
    endTop10: []
  };
}

function makeStats(): SyllableStats {
  const profile = makeProfile();
  return {
    profiles: {
      M: profile,
      F: makeProfile()
    },
    commonStartIntersection: [],
    commonEndIntersection: [],
    oneSyllableByGender: { M: [], F: [] }
  };
}

function makeCandidate(name: string, tier: "A" | "B" | "C"): NameCandidate {
  const [start, end] = [...name];
  if (!start || !end) {
    throw new Error(`Expected 2-syllable name: ${name}`);
  }
  return {
    name,
    tier,
    features: { start, end }
  };
}

function testScoreCandidatesTierBaseBonusPrefersBThenAThenC(): void {
  const stats = makeStats();
  const input = makeLoadedInput();
  const scored = scoreCandidates(
    [
      makeCandidate("가나", "A"),
      makeCandidate("다라", "B"),
      makeCandidate("마바", "C")
    ],
    "M",
    input,
    stats
  );

  const byName = new Map(scored.map((row) => [row.name, row.score]));
  assert.ok((byName.get("다라") ?? -Infinity) > (byName.get("가나") ?? Infinity));
  assert.ok((byName.get("가나") ?? -Infinity) > (byName.get("마바") ?? Infinity));
}

function testDiversifyTieBreakPrefersBThenAThenC(): void {
  const result = diversifyCandidates(
    [
      {
        ...makeCandidate("가나", "A"),
        score: 10,
        scoreBreakdown: { baseBonus: 0, styleScore: 0, stabilityScore: 0, genderFitScore: 0 }
      },
      {
        ...makeCandidate("다라", "B"),
        score: 10,
        scoreBreakdown: { baseBonus: 0, styleScore: 0, stabilityScore: 0, genderFitScore: 0 }
      },
      {
        ...makeCandidate("마바", "C"),
        score: 10,
        scoreBreakdown: { baseBonus: 0, styleScore: 0, stabilityScore: 0, genderFitScore: 0 }
      }
    ],
    {
      targetCount: 3,
      minCount: 3,
      maxPerStart: 3,
      maxPerEnd: 3
    }
  );

  assert.deepEqual(
    result.selected.map((item) => `${item.name}:${item.tier}`),
    ["다라:B", "가나:A", "마바:C"]
  );
}

function run(): void {
  testScoreCandidatesTierBaseBonusPrefersBThenAThenC();
  testDiversifyTieBreakPrefersBThenAThenC();
  console.log("[name-pool-tier-priority] tests passed");
}

run();
