import assert from "node:assert/strict";
import type { PremiumRecommendResultItem } from "../types/recommend";
import { sanitizePremiumResults } from "./premiumResultSanitizer";

function createItem(overrides: Partial<PremiumRecommendResultItem>): PremiumRecommendResultItem {
  return {
    rank: 1,
    nameHangul: "민준",
    hanjaPair: ["珉", "俊"],
    readingPair: ["민", "준"],
    meaningKwPair: ["옥돌", "준걸"],
    score: 0,
    sajuScore5: 0,
    soundScore5: 0,
    engineScore01: 0,
    why: ["추천 이유"],
    ...overrides
  };
}

function testKeepsAllZeroSajuTop20WithoutBlankingResult(): void {
  const zeros = Array.from({ length: 20 }, (_, index) =>
    createItem({ rank: index + 1, nameHangul: `이름${index}` })
  );

  const sanitized = sanitizePremiumResults(zeros);

  assert.equal(sanitized.length, 20);
}

function testKeepsWhenAtLeastOnePositiveSajuExists(): void {
  const rows = [
    createItem({ rank: 1, nameHangul: "가온", sajuScore5: 0 }),
    createItem({ rank: 2, nameHangul: "하준", sajuScore5: 1.5 })
  ];

  const sanitized = sanitizePremiumResults(rows);

  assert.equal(sanitized.length, 2);
  assert.equal(sanitized[0].sajuScore5, 0);
  assert.equal(sanitized[1].sajuScore5, 1.5);
}

function testKeepsUniformTop20ScoresWithoutBlankingResult(): void {
  const sameScores = Array.from({ length: 20 }, (_, index) =>
    createItem({ rank: index + 1, nameHangul: `이름${index}`, sajuScore5: 2.5 })
  );

  const sanitized = sanitizePremiumResults(sameScores);

  assert.equal(sanitized.length, 20);
}

function run(): void {
  testKeepsAllZeroSajuTop20WithoutBlankingResult();
  testKeepsWhenAtLeastOnePositiveSajuExists();
  testKeepsUniformTop20ScoresWithoutBlankingResult();
  console.log("[test:premium-result-sanitizer:web] all tests passed");
}

run();
