import assert from "node:assert/strict";
import type { FreeRecommendResponse } from "@/types/recommend";
import {
  applyFeedbackScores,
  buildFeedbackNameKey,
  type NameFeedbackStatsMap,
} from "./feedbackScoring";

function sampleResults(): FreeRecommendResponse["results"] {
  return [
    {
      nameHangul: "지안",
      hanjaPair: ["智", "安"],
      readingPair: ["지", "안"],
      meaningKwPair: ["지혜", "편안"],
      score: 90,
      reasons: ["a"],
    },
    {
      nameHangul: "하윤",
      hanjaPair: ["河", "潤"],
      readingPair: ["하", "윤"],
      meaningKwPair: ["강", "윤택"],
      score: 89,
      reasons: ["b"],
    },
  ];
}

function testNameKey(): void {
  const key = buildFeedbackNameKey({
    nameHangul: "지안",
    hanjaPair: ["智", "安"],
  });

  assert.equal(key, "지안:智安");
}

function testFeedbackAdjustReordersResults(): void {
  const results = sampleResults();
  const stats: NameFeedbackStatsMap = new Map([
    ["지안:智安", { likes: 0, dislikes: 15 }],
    ["하윤:河潤", { likes: 20, dislikes: 0 }],
  ]);

  const adjusted = applyFeedbackScores(results, stats);
  assert.equal(adjusted[0].nameHangul, "하윤");
  assert.equal(adjusted[1].nameHangul, "지안");
}

function testFeedbackAdjustKeepsSameWhenNoStats(): void {
  const results = sampleResults();
  const adjusted = applyFeedbackScores(results, new Map());
  assert.deepEqual(adjusted.map((item) => item.nameHangul), ["지안", "하윤"]);
}

function run(): void {
  testNameKey();
  testFeedbackAdjustReordersResults();
  testFeedbackAdjustKeepsSameWhenNoStats();
  console.log("[test:feedback-scoring] all tests passed");
}

run();
