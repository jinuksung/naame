import assert from "node:assert/strict";
import { recommendFreeNames } from "./freeRecommend";

async function testReasonsHaveCategoryLabelsAndNoAxisWord(): Promise<void> {
  const result = await recommendFreeNames({
    surnameHangul: "김",
    surnameHanja: "金",
    gender: "UNISEX",
  });

  assert.equal(result.ok, true, "추천 결과가 성공해야 합니다.");
  if (!result.ok) {
    return;
  }

  const first = result.response.results[0];
  assert.ok(first, "최소 1개 이상의 추천 결과가 있어야 합니다.");
  assert.ok(first.reasons.length >= 3, "해설 문구는 최소 3개여야 합니다.");
  assert.ok(first.reasons[0].startsWith("의미:"), "첫 번째 해설은 '의미:' 라벨이 있어야 합니다.");
  assert.ok(first.reasons[1].startsWith("발음오행:"), "두 번째 해설은 '발음오행:' 라벨이 있어야 합니다.");
  assert.ok(first.reasons[2].startsWith("오행 균형:"), "세 번째 해설은 '오행 균형:' 라벨이 있어야 합니다.");

  for (const item of result.response.results) {
    for (const reason of item.reasons) {
      assert.equal(reason.includes("축 의미"), false, "'축 의미' 표현은 사용하면 안 됩니다.");
      assert.equal(reason.includes(" 축 "), false, "'축' 표현은 사용하면 안 됩니다.");

      if (reason.startsWith("오행 균형:")) {
        assert.equal(
          /(\d+점|\d+%|점수)/.test(reason),
          false,
          "'오행 균형' 해설에는 점수/퍼센트 표현이 없어야 합니다."
        );
      }

      if (reason.startsWith("의미:")) {
        assert.equal(
          reason.includes("을(를) 의미하는 한자들의 조합이에요"),
          true,
          "'의미' 해설은 조사 표기를 '을(를)'로 사용해야 합니다."
        );
      }
    }
  }
}

async function run(): Promise<void> {
  await testReasonsHaveCategoryLabelsAndNoAxisWord();
  console.log("[test:free-recommend:reason-labels] all tests passed");
}

void run();
