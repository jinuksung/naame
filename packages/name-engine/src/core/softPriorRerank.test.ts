import assert from "node:assert/strict";
import { attachPoolPrior, createPoolIndex } from "./poolAttach";
import { DEFAULT_SOFT_PRIOR_WEIGHTS, rerankWithSoftPrior } from "./rerank";
import { diversifyByStartEnd } from "./diversify";

function createSequenceRandom(sequence: number[]): () => number {
  let index = 0;
  return () => {
    const value = sequence[index] ?? 0.5;
    index += 1;
    return value;
  };
}

function testFinalScoreFormula(): void {
  const poolIndex = createPoolIndex({
    M: [{ name: "도윤", tier: "B" }],
    F: []
  });
  const result = rerankWithSoftPrior(
    [
      {
        name: "도윤",
        engineScore01: 1.0
      }
    ],
    "M",
    poolIndex
  );
  assert.equal(result.length, 1);
  const expected =
    DEFAULT_SOFT_PRIOR_WEIGHTS.wE * 1.0 +
    DEFAULT_SOFT_PRIOR_WEIGHTS.wP * 0.75 +
    DEFAULT_SOFT_PRIOR_WEIGHTS.wT * 0.03;
  assert.equal(result[0].breakdown.finalScore01, Number(expected.toFixed(6)));
}

function testNonPoolCandidateNotDropped(): void {
  const poolIndex = createPoolIndex({
    M: [{ name: "도윤", tier: "B" }],
    F: []
  });
  const result = rerankWithSoftPrior(
    [
      { name: "도윤", engineScore01: 0.9 },
      { name: "가온", engineScore01: 0.8 }
    ],
    "M",
    poolIndex
  );
  assert.equal(result.length, 2);
  assert.ok(result.some((row) => row.name === "가온" && row.pool.poolIncluded === false));
}

function testTierPriorityAcrossPools(): void {
  const poolIndex = createPoolIndex({
    M: [{ name: "지안", tier: "A" }],
    F: [{ name: "지안", tier: "B" }]
  });
  const attached = attachPoolPrior("지안", "M", poolIndex);
  assert.equal(attached.tier, "A");
}

function testTierPriorityAcrossPoolsForAllPrefersAOverC(): void {
  const poolIndex = createPoolIndex({
    M: [{ name: "지안", tier: "A" }],
    F: [{ name: "지안", tier: "C" }]
  });
  const attached = attachPoolPrior("지안", "ANY", poolIndex);
  assert.equal(attached.tier, "A");
}

function testNoCrossGenderPoolFallback(): void {
  const poolIndex = createPoolIndex({
    M: [],
    F: [{ name: "나리", tier: "B" }]
  });
  const attachedM = attachPoolPrior("나리", "M", poolIndex);
  const attachedF = attachPoolPrior("나리", "F", poolIndex);
  assert.equal(attachedM.tier, "None");
  assert.equal(attachedM.poolIncluded, false);
  assert.equal(attachedF.tier, "B");
  assert.equal(attachedF.poolIncluded, true);
}

function testOppositeOnlyNameGetsLowerPoolScoreThanNeutralNone(): void {
  const poolIndex = createPoolIndex({
    M: [],
    F: [{ name: "나리", tier: "B" }]
  });

  const oppositeOnlyForMale = attachPoolPrior("나리", "M", poolIndex);
  const neutralMissing = attachPoolPrior("가온", "M", poolIndex);

  assert.equal(oppositeOnlyForMale.tier, "None");
  assert.equal(oppositeOnlyForMale.poolIncluded, false);
  assert.equal(neutralMissing.tier, "None");
  assert.equal(neutralMissing.poolIncluded, false);
  assert.ok(
    oppositeOnlyForMale.poolScore01 < neutralMissing.poolScore01,
    "opposite-only names should be penalized below neutral missing names"
  );
}

function testOverlapSameTierCanFlipByGenderFitMetadata(): void {
  const poolIndex = createPoolIndex({
    M: [
      { name: "가온", tier: "A", genderFitScore: -2 },
      { name: "나리", tier: "A", genderFitScore: 2 }
    ],
    F: [
      { name: "가온", tier: "A", genderFitScore: 2 },
      { name: "나리", tier: "A", genderFitScore: -2 }
    ]
  });

  const candidates = [
    { name: "가온", engineScore01: 0.9 },
    { name: "나리", engineScore01: 0.9 }
  ];

  const maleOrder = rerankWithSoftPrior(candidates, "M", poolIndex, undefined, () => 0.5).map(
    (row) => row.name
  );
  const femaleOrder = rerankWithSoftPrior(candidates, "F", poolIndex, undefined, () => 0.5).map(
    (row) => row.name
  );

  assert.deepEqual(maleOrder, ["나리", "가온"]);
  assert.deepEqual(femaleOrder, ["가온", "나리"]);
}

function testAnyModePrefersOverlapNameOverSinglePoolNameAtSameTier(): void {
  const poolIndex = createPoolIndex({
    M: [
      { name: "가온", tier: "A" },
      { name: "나리", tier: "A" }
    ],
    F: [{ name: "가온", tier: "A" }]
  });

  const overlap = attachPoolPrior("가온", "ANY", poolIndex);
  const singlePool = attachPoolPrior("나리", "ANY", poolIndex);
  assert.equal(overlap.tier, "A");
  assert.equal(singlePool.tier, "A");
  assert.ok(
    overlap.poolScore01 > singlePool.poolScore01,
    "UNISEX(ANY) should boost overlap names when best tier is the same"
  );

  const ranked = rerankWithSoftPrior(
    [
      { name: "가온", engineScore01: 0.9 },
      { name: "나리", engineScore01: 0.9 }
    ],
    "ANY",
    poolIndex,
    undefined,
    () => 0.5
  ).map((row) => row.name);

  assert.deepEqual(ranked, ["가온", "나리"]);
}

function testPoolPriorScoreOrderingPrefersAOverCAndNone(): void {
  const poolIndex = createPoolIndex({
    M: [
      { name: "비이", tier: "B" },
      { name: "에이", tier: "A" },
      { name: "씨이", tier: "C" }
    ],
    F: []
  });

  const b = attachPoolPrior("비이", "M", poolIndex);
  const a = attachPoolPrior("에이", "M", poolIndex);
  const c = attachPoolPrior("씨이", "M", poolIndex);
  const n = attachPoolPrior("없음", "M", poolIndex);

  assert.ok(b.poolScore01 > a.poolScore01, "B should remain strongest pool prior");
  assert.ok(a.poolScore01 > c.poolScore01, "A should outrank C");
  assert.ok(c.poolScore01 > n.poolScore01, "C should outrank None");
}

function testDiversifyEndLimit(): void {
  const ranked = [
    { name: "가나", score: 1 },
    { name: "다나", score: 0.99 },
    { name: "라나", score: 0.98 },
    { name: "마나", score: 0.97 },
    { name: "바사", score: 0.96 },
    { name: "자사", score: 0.95 },
    { name: "차아", score: 0.94 },
    { name: "카아", score: 0.93 },
    { name: "타자", score: 0.92 },
    { name: "파자", score: 0.91 },
    { name: "하차", score: 0.9 },
    { name: "거카", score: 0.89 }
  ];

  const diversified = diversifyByStartEnd(ranked, {
    limit: 10,
    maxSameStart: 2,
    maxSameEnd: 2
  });

  const endCount = new Map<string, number>();
  for (const item of diversified) {
    const end = Array.from(item.name).at(-1) ?? "";
    endCount.set(end, (endCount.get(end) ?? 0) + 1);
  }
  const maxEndCount = Math.max(...endCount.values());
  assert.ok(maxEndCount <= 2);
}

function testDiversifyNoDuplicateNames(): void {
  const ranked = [
    { name: "가나", score: 1 },
    { name: "가나", score: 0.99 },
    { name: "다라", score: 0.98 },
    { name: "마바", score: 0.97 },
    { name: "사아", score: 0.96 },
    { name: "자차", score: 0.95 }
  ];

  const diversified = diversifyByStartEnd(ranked, {
    limit: 5,
    maxSameStart: 2,
    maxSameEnd: 2
  });

  const names = diversified.map((item) => item.name);
  assert.equal(new Set(names).size, names.length);
}

function testTieBreakUsesRandomOrderWhenScoresEqual(): void {
  const poolIndex = createPoolIndex({
    M: [],
    F: []
  });
  const candidates = [
    { name: "가나", engineScore01: 0.9 },
    { name: "나다", engineScore01: 0.9 },
    { name: "다라", engineScore01: 0.9 }
  ];

  const runA = rerankWithSoftPrior(
    candidates,
    "M",
    poolIndex,
    undefined,
    createSequenceRandom([0.1, 0.9, 0.3])
  ).map((row) => row.name);
  const runB = rerankWithSoftPrior(
    candidates,
    "M",
    poolIndex,
    undefined,
    createSequenceRandom([0.9, 0.1, 0.3])
  ).map((row) => row.name);

  assert.notDeepEqual(runA, runB);
  assert.deepEqual(runA, ["나다", "다라", "가나"]);
  assert.deepEqual(runB, ["가나", "다라", "나다"]);
}

function run(): void {
  testFinalScoreFormula();
  testNonPoolCandidateNotDropped();
  testTierPriorityAcrossPools();
  testTierPriorityAcrossPoolsForAllPrefersAOverC();
  testNoCrossGenderPoolFallback();
  testOppositeOnlyNameGetsLowerPoolScoreThanNeutralNone();
  testOverlapSameTierCanFlipByGenderFitMetadata();
  testAnyModePrefersOverlapNameOverSinglePoolNameAtSameTier();
  testPoolPriorScoreOrderingPrefersAOverCAndNone();
  testDiversifyEndLimit();
  testDiversifyNoDuplicateNames();
  testTieBreakUsesRandomOrderWhenScoresEqual();
  console.log("[test:soft-prior] all tests passed");
}

run();
