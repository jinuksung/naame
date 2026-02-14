import assert from "node:assert/strict";
import { attachPoolPrior, createPoolIndex } from "./poolAttach";
import { rerankWithSoftPrior } from "./rerank";
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
  const expected = 0.7 * 1.0 + 0.25 * 0.75 + 0.05 * 0.03;
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
  testNoCrossGenderPoolFallback();
  testDiversifyEndLimit();
  testDiversifyNoDuplicateNames();
  testTieBreakUsesRandomOrderWhenScoresEqual();
  console.log("[test:soft-prior] all tests passed");
}

run();
