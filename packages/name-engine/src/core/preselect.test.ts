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

function testPoolMinRatioGuaranteesPoolHeavySelectionWhenPoolIsSufficient(): void {
  const poolNames = ["도윤", "시우", "민준", "하준", "지호", "준서", "서준", "예준", "주원", "지안"];
  const poolIndex = createPoolIndex({
    M: poolNames.map((name) => ({ name, tier: "B" as const })),
    F: []
  });

  const explorationNames = ["가온", "라온", "하온", "다온", "로운", "서온", "채온", "이온", "세온", "다인"];
  const inputs = [
    ...poolNames.map((name, index) => ({
      name,
      partialEngineScore01: 0.95 - index * 0.01,
      payload: { bucket: "pool", id: index }
    })),
    ...explorationNames.map((name, index) => ({
      name,
      partialEngineScore01: 0.9 - index * 0.01,
      payload: { bucket: "exploration", id: index }
    }))
  ];

  const result = preselectNameSeeds(inputs, "M", poolIndex, {
    limit: 10,
    explorationMinRatio: 0.4,
    explorationMinCount: 4,
    poolMinRatio: 0.8
  });

  assert.equal(result.selected.length, 10);
  assert.ok(
    result.stats.selectedPool >= 8,
    "pool 후보가 충분할 때는 pool 최소 비율(80%)을 보장해야 합니다."
  );
}

function run(): void {
  testKeepsExplorationBucket();
  testDedupByNameKeepsBestScore();
  testPoolMinRatioGuaranteesPoolHeavySelectionWhenPoolIsSufficient();
  console.log("[test:preselect] all tests passed");
}

run();
