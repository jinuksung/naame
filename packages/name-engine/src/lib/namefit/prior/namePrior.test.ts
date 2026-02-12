import assert from "node:assert/strict";
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

  const blacklistCases = ["가지", "가나", "고지", "규도"] as const;
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

  console.log("[test:prior] all tests passed");
}

runTests();
