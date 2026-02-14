import assert from "node:assert/strict";
import { createPoolIndex } from "./poolAttach";
import { preselectNameSeeds } from "./preselect";

function testKeepsExplorationBucket(): void {
  const poolIndex = createPoolIndex({
    M: [
      { name: "도윤", tier: "B" },
      { name: "시우", tier: "B" },
      { name: "민준", tier: "A" },
      { name: "하준", tier: "C" }
    ],
    F: []
  });

  const inputs = [
    { name: "도윤", partialEngineScore01: 0.9, payload: { id: 1 } },
    { name: "시우", partialEngineScore01: 0.88, payload: { id: 2 } },
    { name: "민준", partialEngineScore01: 0.87, payload: { id: 3 } },
    { name: "하준", partialEngineScore01: 0.86, payload: { id: 4 } },
    { name: "가온", partialEngineScore01: 0.85, payload: { id: 5 } },
    { name: "라온", partialEngineScore01: 0.84, payload: { id: 6 } }
  ];

  const result = preselectNameSeeds(inputs, "M", poolIndex, {
    limit: 5,
    explorationMinRatio: 0.2,
    explorationMinCount: 1
  });

  assert.equal(result.selected.length, 5);
  assert.ok(result.stats.selectedExploration >= 1, "at least one non-pool candidate should survive");
  assert.ok(result.selected.some((row) => row.name === "가온" || row.name === "라온"));
}

function testDedupByNameKeepsBestScore(): void {
  const poolIndex = createPoolIndex({
    M: [{ name: "도윤", tier: "B" }],
    F: []
  });

  const result = preselectNameSeeds(
    [
      { name: "도윤", partialEngineScore01: 0.8, payload: { source: "low" } },
      { name: "도윤", partialEngineScore01: 0.9, payload: { source: "high" } },
      { name: "하준", partialEngineScore01: 0.7, payload: { source: "other" } }
    ],
    "M",
    poolIndex,
    { limit: 2, explorationMinCount: 0 }
  );

  assert.equal(result.stats.totalUnique, 2);
  const doyoon = result.selected.find((row) => row.name === "도윤");
  assert.ok(doyoon);
  assert.equal((doyoon?.payload as { source: string }).source, "high");
}

function run(): void {
  testKeepsExplorationBucket();
  testDedupByNameKeepsBestScore();
  console.log("[test:preselect] all tests passed");
}

run();
