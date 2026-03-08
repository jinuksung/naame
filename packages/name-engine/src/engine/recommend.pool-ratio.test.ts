import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";

const RECOMMEND_SOURCE_PATH = path.resolve(__dirname, "recommend.ts");

function testPreselectPoolMinRatioIsEightyPercent(): void {
  const source = readFileSync(RECOMMEND_SOURCE_PATH, "utf8");
  assert.equal(
    source.includes("const PRESELECT_POOL_MIN_RATIO = 0.8;"),
    true,
    "추천 엔진 preselect 단계의 pool 최소 출현 비율은 80%여야 합니다."
  );
}

function run(): void {
  testPreselectPoolMinRatioIsEightyPercent();
  console.log("[test:recommend-pool-ratio] all tests passed");
}

run();
