import assert from "node:assert/strict";
import { buildMockResults } from "./mock";
import { FreeRecommendInput } from "./types/recommend";

const sampleInput: FreeRecommendInput = {
  surnameHangul: "김",
  surnameHanja: "金",
  birth: {
    calendar: "SOLAR",
    date: "2024-05-21",
    time: "08:30"
  },
  gender: "UNISEX"
};

function runTests(): void {
  const results = buildMockResults(sampleInput);
  assert.ok(results.length > 0, "mock results should not be empty");

  for (const item of results) {
    assert.ok(Array.isArray((item as { readingPair?: unknown }).readingPair), "readingPair should exist");
    assert.ok(
      Array.isArray((item as { meaningKwPair?: unknown }).meaningKwPair),
      "meaningKwPair should exist"
    );
  }

  console.log("[test:mock-shape] all tests passed");
}

runTests();
