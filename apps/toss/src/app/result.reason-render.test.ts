import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";

const RESULT_PAGE_PATH = path.resolve(__dirname, "result/page.tsx");
const FEEDBACK_LAYOUT_CLASS = "feedback-row is-split";
const LIKE_BUTTON_LABEL = "좋아요";
const DISLIKE_BUTTON_LABEL = "싫어요";
const FEEDBACK_ICON_CLASS = 'className="feedback-icon"';

function testResultReasonLabelIsRenderedAsBold(): void {
  const source = readFileSync(RESULT_PAGE_PATH, "utf8");
  assert.equal(
    source.includes('className="reason-label"'),
    true,
    "토스 결과 화면은 reason 항목명을 굵게 렌더링해야 합니다.",
  );
  assert.equal(
    source.includes("splitReasonLabel("),
    true,
    "토스 결과 화면은 라벨/본문을 분리해서 렌더링해야 합니다.",
  );
}

function testFeedbackButtonsUseSplitLayoutWithEmoji(): void {
  const source = readFileSync(RESULT_PAGE_PATH, "utf8");
  assert.equal(
    source.includes(FEEDBACK_LAYOUT_CLASS),
    true,
    "토스 결과 화면의 좋아요/싫어요는 하단 2분할 레이아웃이어야 합니다.",
  );
  assert.equal(
    source.includes(LIKE_BUTTON_LABEL),
    true,
    "토스 결과 화면의 좋아요 버튼 텍스트가 보여야 합니다.",
  );
  assert.equal(
    source.includes(DISLIKE_BUTTON_LABEL),
    true,
    "토스 결과 화면의 싫어요 버튼 텍스트가 보여야 합니다.",
  );
  assert.equal(
    source.includes(FEEDBACK_ICON_CLASS),
    true,
    "토스 결과 화면의 피드백 버튼은 라인 SVG 아이콘을 렌더링해야 합니다.",
  );
  assert.equal(
    source.includes("👍 좋아요"),
    false,
    "토스 결과 화면에서 노란 좋아요 이모지는 제거되어야 합니다.",
  );
  assert.equal(
    source.includes("👎 싫어요"),
    false,
    "토스 결과 화면에서 노란 싫어요 이모지는 제거되어야 합니다.",
  );
}

function run(): void {
  testResultReasonLabelIsRenderedAsBold();
  testFeedbackButtonsUseSplitLayoutWithEmoji();
  console.log("[test:result-reason-render:toss] all tests passed");
}

run();
