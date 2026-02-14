import assert from "node:assert/strict";
import type { FreeRecommendResponse } from "@/types/recommend";
import {
  applyFeedbackScores,
  buildFeedbackHangulKey,
  buildFeedbackNameKey,
  type FeedbackSurnameContext,
  type NameFeedbackStatsMap,
} from "./feedbackScoring";

const KIM_SURNAME: FeedbackSurnameContext = {
  surnameHangul: "김",
  surnameHanja: "金",
};

const PARK_SURNAME: FeedbackSurnameContext = {
  surnameHangul: "박",
  surnameHanja: "朴",
};

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
    surnameHangul: " 김 ",
    surnameHanja: " 金 ",
    nameHangul: " 지안 ",
    hanjaPair: ["智", "安"]
  });

  assert.equal(key, "김:金:지안:智安");
}

function testHangulKey(): void {
  const key = buildFeedbackHangulKey({
    surnameHangul: " 김 ",
    nameHangul: " 지안 ",
  });

  assert.equal(key, "김:지안");
}

function testFeedbackAdjustReordersResults(): void {
  const results = sampleResults();
  const stats: NameFeedbackStatsMap = new Map([
    [buildFeedbackHangulKey({ surnameHangul: KIM_SURNAME.surnameHangul, nameHangul: "지안" }), { likes: 0, dislikes: 15 }],
    [buildFeedbackHangulKey({ surnameHangul: KIM_SURNAME.surnameHangul, nameHangul: "하윤" }), { likes: 20, dislikes: 0 }]
  ]);

  const adjusted = applyFeedbackScores(results, stats, KIM_SURNAME);
  assert.equal(adjusted[0].nameHangul, "하윤");
  assert.equal(adjusted[1].nameHangul, "지안");
}

function testFeedbackAdjustPenalizesAnyDislikes(): void {
  const results = sampleResults().map((item) => ({ ...item, score: 90 }));
  const stats: NameFeedbackStatsMap = new Map([
    [buildFeedbackHangulKey({ surnameHangul: KIM_SURNAME.surnameHangul, nameHangul: "지안" }), { likes: 20, dislikes: 10 }],
    [buildFeedbackHangulKey({ surnameHangul: KIM_SURNAME.surnameHangul, nameHangul: "하윤" }), { likes: 10, dislikes: 0 }]
  ]);

  const adjusted = applyFeedbackScores(results, stats, KIM_SURNAME);
  assert.equal(adjusted[0].nameHangul, "하윤");
  assert.equal(adjusted[1].nameHangul, "지안");
}

function testFeedbackAdjustKeepsSameWhenNoStats(): void {
  const results = sampleResults();
  const adjusted = applyFeedbackScores(results, new Map(), KIM_SURNAME);
  assert.deepEqual(adjusted.map((item) => item.nameHangul), ["지안", "하윤"]);
}

function testFeedbackAdjustUsesSurnameSpecificStats(): void {
  const results = sampleResults().map((item) => ({ ...item, score: 90 }));
  const stats: NameFeedbackStatsMap = new Map([
    [buildFeedbackHangulKey({ surnameHangul: KIM_SURNAME.surnameHangul, nameHangul: "지안" }), { likes: 0, dislikes: 20 }],
    [buildFeedbackHangulKey({ surnameHangul: PARK_SURNAME.surnameHangul, nameHangul: "지안" }), { likes: 25, dislikes: 0 }]
  ]);

  const adjustedForKim = applyFeedbackScores(results, stats, KIM_SURNAME);
  assert.equal(adjustedForKim[1].nameHangul, "지안");

  const adjustedForPark = applyFeedbackScores(results, stats, PARK_SURNAME);
  assert.equal(adjustedForPark[0].nameHangul, "지안");
}

function testFeedbackAdjustAggregatesByHangulName(): void {
  const results: FreeRecommendResponse["results"] = [
    {
      nameHangul: "지안",
      hanjaPair: ["智", "安"],
      readingPair: ["지", "안"],
      meaningKwPair: ["지혜", "편안"],
      score: 85,
      reasons: ["a"],
    },
    {
      nameHangul: "지안",
      hanjaPair: ["知", "安"],
      readingPair: ["지", "안"],
      meaningKwPair: ["알다", "편안"],
      score: 85,
      reasons: ["b"],
    },
    {
      nameHangul: "하윤",
      hanjaPair: ["河", "潤"],
      readingPair: ["하", "윤"],
      meaningKwPair: ["강", "윤택"],
      score: 90,
      reasons: ["c"],
    },
  ];

  const stats: NameFeedbackStatsMap = new Map([
    [buildFeedbackHangulKey({ surnameHangul: "김", nameHangul: "지안" }), { likes: 30, dislikes: 0 }],
    [buildFeedbackHangulKey({ surnameHangul: "김", nameHangul: "하윤" }), { likes: 0, dislikes: 25 }],
  ]);

  const adjusted = applyFeedbackScores(results, stats, KIM_SURNAME);
  assert.equal(adjusted[0].nameHangul, "지안");
  assert.equal(adjusted[1].nameHangul, "지안");
  assert.equal(adjusted[2].nameHangul, "하윤");
}

function run(): void {
  testHangulKey();
  testNameKey();
  testFeedbackAdjustReordersResults();
  testFeedbackAdjustPenalizesAnyDislikes();
  testFeedbackAdjustKeepsSameWhenNoStats();
  testFeedbackAdjustUsesSurnameSpecificStats();
  testFeedbackAdjustAggregatesByHangulName();
  console.log("[test:feedback-scoring] all tests passed");
}

run();
