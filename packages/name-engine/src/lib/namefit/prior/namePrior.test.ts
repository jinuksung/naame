import assert from "node:assert/strict";
import { mkdtempSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { buildNamePriorIndex } from "./buildNamePrior";
import { scoreNamePrior } from "./namePriorScore";
import { applyFinalScoreWithPrior } from "../rank/finalScore";

const sampleTopNames = {
  byGender: {
    M: ["도윤", "서준", "도준", "민준"],
    F: ["서연", "가은", "서윤", "지우"]
  },
  items: [
    { name: "도윤", gender: "M" as const },
    { name: "서준", gender: "M" as const },
    { name: "도준", gender: "M" as const },
    { name: "민준", gender: "M" as const },
    { name: "고지", gender: "M" as const },
    { name: "서연", gender: "F" as const },
    { name: "가은", gender: "F" as const },
    { name: "서윤", gender: "F" as const },
    { name: "지우", gender: "F" as const },
    { name: "가나", gender: "F" as const }
  ]
};

function runTests(): void {
  const priorIndex = buildNamePriorIndex(sampleTopNames);

  assert.equal(priorIndex.totalCountsByGender.M, 5);
  assert.equal(priorIndex.totalCountsByGender.F, 5);
  assert.equal(priorIndex.totalCountsByGender.ALL, 10);
  assert.ok(priorIndex.bigramSetByGender.M.has("도윤"));
  assert.ok(priorIndex.bigramSetByGender.F.has("서연"));
  assert.ok(priorIndex.bigramSetByGender.ALL.has("도윤"));
  assert.ok(priorIndex.syllableSetByGender.ALL.has("도"));
  assert.ok(priorIndex.syllableSetByGender.ALL.has("연"));

  const blacklistCases = ["가지", "가나", "고지", "규도", "유도"] as const;
  for (const name of blacklistCases) {
    const scored = scoreNamePrior(name, "U", priorIndex);
    assert.equal(scored.gate, "FAIL_BLACKLIST", `${name} should fail by blacklist`);
  }

  const strictFail = scoreNamePrior("도봄", "M", priorIndex, { strict: true });
  assert.equal(strictFail.gate, "FAIL_SYLLABLE");

  const relaxedPass = scoreNamePrior("도봄", "M", priorIndex, { strict: false });
  assert.equal(relaxedPass.gate, "PASS");
  assert.ok(relaxedPass.priorScore01 < 0.8);

  const known = scoreNamePrior("도윤", "M", priorIndex);
  const unknown = scoreNamePrior("윤도", "M", priorIndex, { strict: false });
  assert.equal(known.gate, "PASS");
  assert.ok(known.priorScore01 > unknown.priorScore01, "known top-name should get bigram boost");

  const combined = applyFinalScoreWithPrior(
    [
      { nameHangul: "가지", scores: { total: 96 } },
      { nameHangul: "도윤", scores: { total: 90 } },
      { nameHangul: "서준", scores: { total: 88 } }
    ],
    "M",
    priorIndex,
    { strictGate: true, allowNonWhitelist: false, priorWeight: 0.35 }
  );

  const bad = combined.find((row) => row.candidate.nameHangul === "가지");
  const good = combined.find((row) => row.candidate.nameHangul === "도윤");
  assert.ok(bad);
  assert.ok(good);
  assert.equal(bad?.dropped, true);
  assert.equal(good?.dropped, false);
  assert.ok((good?.finalScore01 ?? 0) > 0.7);

  const combinedAllowNonWhitelist = applyFinalScoreWithPrior(
    [{ nameHangul: "가지", scores: { total: 96 } }],
    "U",
    priorIndex,
    { strictGate: true, allowNonWhitelist: true, priorWeight: 0.35 }
  );
  assert.equal(
    combinedAllowNonWhitelist[0]?.dropped,
    true,
    "blacklist 이름은 allowNonWhitelist=true 여도 반드시 제외되어야 합니다.",
  );

  const emptyPriorIndex = buildNamePriorIndex({});
  const dynamicName = "툴링";
  const dynamicBlacklistDir = mkdtempSync(join(tmpdir(), "namefit-prior-blacklist-"));
  const dynamicBlacklistPath = join(dynamicBlacklistDir, "blacklist_words.jsonl");
  writeFileSync(dynamicBlacklistPath, JSON.stringify({ pattern: dynamicName }) + "\n", "utf8");

  const previousBlacklistPath = process.env.BLACKLIST_WORDS_PATH;
  const beforeDynamicUpdate = scoreNamePrior(dynamicName, "U", emptyPriorIndex);
  process.env.BLACKLIST_WORDS_PATH = dynamicBlacklistPath;
  const afterDynamicUpdate = scoreNamePrior(dynamicName, "U", emptyPriorIndex);
  if (previousBlacklistPath === undefined) {
    delete process.env.BLACKLIST_WORDS_PATH;
  } else {
    process.env.BLACKLIST_WORDS_PATH = previousBlacklistPath;
  }

  assert.equal(beforeDynamicUpdate.gate, "PASS");
  assert.equal(
    afterDynamicUpdate.gate,
    "FAIL_BLACKLIST",
    "BLACKLIST_WORDS_PATH가 런타임에 설정되어도 즉시 blacklist gate에 반영되어야 합니다.",
  );

  const syllableRuleName = "윤아";
  const dynamicSyllableRuleDir = mkdtempSync(join(tmpdir(), "namefit-prior-syllable-rule-"));
  const dynamicSyllableRulePath = join(dynamicSyllableRuleDir, "name_block_syllable_rules.jsonl");
  writeFileSync(
    dynamicSyllableRulePath,
    JSON.stringify({
      s1_has_jong: true,
      s2_has_jong: false,
      note: "받침 패턴만으로 차단",
    }) + "\n",
    "utf8",
  );

  const previousSyllableRulePath = process.env.NAME_BLOCK_SYLLABLE_RULES_PATH;
  const beforeSyllableRuleUpdate = scoreNamePrior(syllableRuleName, "U", emptyPriorIndex);
  process.env.NAME_BLOCK_SYLLABLE_RULES_PATH = dynamicSyllableRulePath;
  const afterSyllableRuleUpdate = scoreNamePrior(syllableRuleName, "U", emptyPriorIndex);
  if (previousSyllableRulePath === undefined) {
    delete process.env.NAME_BLOCK_SYLLABLE_RULES_PATH;
  } else {
    process.env.NAME_BLOCK_SYLLABLE_RULES_PATH = previousSyllableRulePath;
  }

  assert.equal(beforeSyllableRuleUpdate.gate, "PASS");
  assert.equal(
    afterSyllableRuleUpdate.gate,
    "FAIL_BLACKLIST",
    "NAME_BLOCK_SYLLABLE_RULES_PATH의 받침 패턴 룰(NULL=와일드카드)이 prior gate에 즉시 반영되어야 합니다.",
  );

  console.log("[test:prior] all tests passed");
}

runTests();
