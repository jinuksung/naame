import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { filterCandidates } from "../core/filter";
import type { FrequencyProfile, Gender, NameCandidate } from "../types";

const RULE_ENV_KEY = "NAME_POOL_SYLLABLE_POSITION_RULES_PATH";

function withPatchedEnv<T>(patch: Record<string, string | undefined>, run: () => T): T {
  const backup = new Map<string, string | undefined>();
  for (const [key, value] of Object.entries(patch)) {
    backup.set(key, process.env[key]);
    if (value === undefined) {
      delete process.env[key];
    } else {
      process.env[key] = value;
    }
  }

  try {
    return run();
  } finally {
    for (const [key, value] of backup.entries()) {
      if (value === undefined) {
        delete process.env[key];
      } else {
        process.env[key] = value;
      }
    }
  }
}

function makeTempRulesFile(rows: unknown[]): string {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "name-pool-pos-rule-"));
  const filePath = path.join(dir, "rules.jsonl");
  const body = rows.map((row) => JSON.stringify(row)).join("\n");
  fs.writeFileSync(filePath, `${body}\n`, "utf8");
  return filePath;
}

function makeProfile(syllables: string[]): FrequencyProfile {
  const unique = Array.from(new Set(syllables));
  const startFreq = new Map<string, number>();
  const endFreq = new Map<string, number>();
  const allFreq = new Map<string, number>();
  const startPercentile = new Map<string, number>();
  const endPercentile = new Map<string, number>();
  const allPercentile = new Map<string, number>();

  for (const syl of unique) {
    startFreq.set(syl, 10);
    endFreq.set(syl, 10);
    allFreq.set(syl, 20);
    startPercentile.set(syl, 0.5);
    endPercentile.set(syl, 0.5);
    allPercentile.set(syl, 0.5);
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
    endTop10: [],
  };
}

function makeCandidate(name: string, tier: "A" | "B" | "C"): NameCandidate {
  const [start, end] = [...name];
  if (!start || !end) {
    throw new Error(`invalid 2-syllable name: ${name}`);
  }
  return {
    name,
    tier,
    features: {
      start,
      end,
    },
  };
}

function runFilter(
  gender: Gender,
  candidates: NameCandidate[],
  ruleRows: unknown[],
): ReturnType<typeof filterCandidates> {
  const rulesPath = makeTempRulesFile(ruleRows);
  const profile = makeProfile(candidates.flatMap((candidate) => [candidate.features.start, candidate.features.end]));

  return withPatchedEnv({ [RULE_ENV_KEY]: rulesPath }, () =>
    filterCandidates(candidates, profile, new Set<string>(), gender),
  );
}

function testBlocksStartSyllableForNonATiersOnly(): void {
  const result = runFilter(
    "M",
    [
      makeCandidate("린서", "B"),
      makeCandidate("서린", "B"),
      makeCandidate("린하", "A"),
    ],
    [
      {
        enabled: true,
        syllable: "린",
        gender: "ALL",
        blocked_position: "START",
        tier_scope: "NON_A",
      },
    ],
  );

  assert.deepEqual(
    result.kept.map((item) => `${item.name}:${item.tier}`),
    ["서린:B", "린하:A"],
  );
  assert.equal(result.removedByReason.position_rule, 1);
}

function testGenderScopedRuleAppliesOnlyToMatchingGender(): void {
  const rules = [
    {
      enabled: true,
      syllable: "로",
      gender: "F",
      blocked_position: "START",
      tier_scope: "NON_A",
    },
  ];

  const femaleResult = runFilter("F", [makeCandidate("로하", "B")], rules);
  assert.equal(femaleResult.kept.length, 0);
  assert.equal(femaleResult.removedByReason.position_rule, 1);

  const maleResult = runFilter("M", [makeCandidate("로하", "B")], rules);
  assert.equal(maleResult.kept.length, 1);
  assert.equal(maleResult.removedByReason.position_rule, 0);
}

function testEndBlockedRuleStillAllowsStart(): void {
  const result = runFilter(
    "F",
    [makeCandidate("온서", "B"), makeCandidate("서온", "B")],
    [
      {
        enabled: true,
        syllable: "온",
        gender: "ALL",
        blocked_position: "END",
        tier_scope: "NON_A",
      },
    ],
  );

  assert.deepEqual(result.kept.map((item) => item.name), ["온서"]);
  assert.equal(result.removedByReason.position_rule, 1);
}

function run(): void {
  testBlocksStartSyllableForNonATiersOnly();
  testGenderScopedRuleAppliesOnlyToMatchingGender();
  testEndBlockedRuleStillAllowsStart();
  console.log("[name-pool-position-rules] tests passed");
}

run();
