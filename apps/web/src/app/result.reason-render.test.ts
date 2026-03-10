import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";

const RESULT_PAGE_PATH = path.resolve(__dirname, "result/page.tsx");
const GLOBAL_STYLE_PATH = path.resolve(__dirname, "globals.css");
const FEEDBACK_LAYOUT_CLASS = "nf-feedback-row is-split";
const LIKE_BUTTON_LABEL = "좋아요";
const DISLIKE_BUTTON_LABEL = "싫어요";
const FEEDBACK_ICON_CLASS = 'className="nf-feedback-icon"';

function testResultReasonLabelIsRenderedAsBold(): void {
  const source = readFileSync(RESULT_PAGE_PATH, "utf8");
  assert.equal(
    source.includes('className="nf-reason-label"'),
    true,
    "웹 결과 화면은 reason 항목명을 굵게 렌더링해야 합니다.",
  );
  assert.equal(
    source.includes("splitReasonLabel("),
    true,
    "웹 결과 화면은 라벨/본문을 분리해서 렌더링해야 합니다.",
  );
}

function testFeedbackButtonsUseSplitLayoutWithEmoji(): void {
  const source = readFileSync(RESULT_PAGE_PATH, "utf8");
  assert.equal(
    source.includes(FEEDBACK_LAYOUT_CLASS),
    true,
    "웹 결과 화면의 좋아요/싫어요는 하단 2분할 레이아웃이어야 합니다.",
  );
  assert.equal(
    source.includes(LIKE_BUTTON_LABEL),
    true,
    "웹 결과 화면의 좋아요 버튼 텍스트가 보여야 합니다.",
  );
  assert.equal(
    source.includes(DISLIKE_BUTTON_LABEL),
    true,
    "웹 결과 화면의 싫어요 버튼 텍스트가 보여야 합니다.",
  );
  assert.equal(
    source.includes(FEEDBACK_ICON_CLASS),
    true,
    "웹 결과 화면의 피드백 버튼은 라인 SVG 아이콘을 렌더링해야 합니다.",
  );
  assert.equal(
    source.includes("👍 좋아요"),
    false,
    "웹 결과 화면에서 노란 좋아요 이모지는 제거되어야 합니다.",
  );
  assert.equal(
    source.includes("👎 싫어요"),
    false,
    "웹 결과 화면에서 노란 싫어요 이모지는 제거되어야 합니다.",
  );
  assert.equal(
    source.includes('className="nf-share-row"') && source.includes("공유하기"),
    true,
    "웹 결과 카드 액션 하단에는 공유하기 단독 행(nf-share-row)이 있어야 합니다.",
  );
  assert.equal(
    source.includes("공유 준비 중..."),
    true,
    "웹 결과 카드 공유 버튼은 처리 중 상태 텍스트(공유 준비 중...)를 제공해야 합니다.",
  );
  assert.equal(
    source.includes("shareFreeResultCard"),
    true,
    "웹 결과 화면은 무료 카드 공유 핸들러(shareFreeResultCard)를 호출해야 합니다.",
  );
  assert.equal(
    source.includes("좋아요를 누르면 찜한 이름 목록에 저장됩니다."),
    true,
    "웹 결과 화면 상단에는 좋아요 저장 안내 문구가 노출되어야 합니다.",
  );
  assert.equal(
    source.includes('className="nf-description nf-save-hint"'),
    true,
    "웹 결과 화면 상단 저장 안내 문구는 약한 강조 스타일(nf-save-hint)을 사용해야 합니다.",
  );
}

function testPremiumTeaserCopyMatchesCurrentScope(): void {
  const source = readFileSync(RESULT_PAGE_PATH, "utf8");
  assert.equal(
    source.includes("추천 이름 수를 20개로 확대"),
    false,
    "무료 결과 유료 안내에는 더 이상 20개 확대 문구가 남아있으면 안 됩니다.",
  );
  assert.equal(
    source.includes("사주 기반 상위 5개 이름 추천") &&
      source.includes("후보별 상세 리포트(연령대 5구간)") &&
      source.includes("부족/과중 오행 중심 해설"),
    true,
    "무료 결과 유료 안내는 현재 오픈 범위 기준 3개 포인트만 노출해야 합니다.",
  );
}

function testLocalAdminControlsArePresentWithVisibilityGuard(): void {
  const source = readFileSync(RESULT_PAGE_PATH, "utf8");
  assert.equal(
    source.includes("isLocalAdminToolsEnabled"),
    true,
    "로컬 전용 admin UI는 환경 게이트 함수로 렌더링 제어해야 합니다.",
  );
  assert.equal(
    source.includes("한자 로컬 관리"),
    true,
    "결과 화면에는 로컬 환경에서만 보이는 한자 관리 UI가 있어야 합니다.",
  );
  assert.equal(
    source.includes("비인명용 처리"),
    true,
    "결과 화면의 각 한자 항목에 비인명용 처리 버튼이 있어야 합니다.",
  );
  assert.equal(
    source.includes("이름 블랙리스트 처리"),
    true,
    "결과 화면의 각 이름 카드에 블랙리스트 처리 버튼이 있어야 합니다.",
  );
}

function testHanjaRowsUseConsistentVerticalAnchors(): void {
  const styles = readFileSync(GLOBAL_STYLE_PATH, "utf8");
  const hanjaCharRule = styles.match(/\.nf-hanja-char\s*\{[\s\S]*?\n\}/);
  const hanjaReadingRule = styles.match(/\.nf-hanja-reading\s*\{[\s\S]*?\n\}/);
  const hanjaMeaningRule = styles.match(/\.nf-hanja-meaning\s*\{[\s\S]*?\n\}/);

  assert.equal(
    hanjaCharRule !== null,
    true,
    "웹 결과 화면 스타일에는 .nf-hanja-char 규칙이 있어야 합니다.",
  );
  assert.equal(
    hanjaReadingRule !== null,
    true,
    "웹 결과 화면 스타일에는 .nf-hanja-reading 규칙이 있어야 합니다.",
  );
  assert.equal(
    hanjaMeaningRule !== null,
    true,
    "웹 결과 화면 스타일에는 .nf-hanja-meaning 규칙이 있어야 합니다.",
  );

  assert.equal(
    hanjaCharRule?.[0].includes("display: inline-flex") &&
      hanjaCharRule?.[0].includes("line-height: 1") &&
      hanjaCharRule?.[0].includes("min-height"),
    true,
    "한자 글자는 글꼴 메트릭 차이에 흔들리지 않도록 고정된 줄 높이와 min-height를 가져야 합니다.",
  );
  assert.equal(
    hanjaReadingRule?.[0].includes("display: inline-flex") &&
      hanjaReadingRule?.[0].includes("min-height"),
    true,
    "음독 줄은 카드 간 세로 기준선을 맞추기 위해 inline-flex와 min-height를 가져야 합니다.",
  );
  assert.equal(
    hanjaMeaningRule?.[0].includes("display: inline-flex") &&
      hanjaMeaningRule?.[0].includes("min-height"),
    true,
    "뜻 줄은 카드 간 세로 기준선을 맞추기 위해 inline-flex와 min-height를 가져야 합니다.",
  );
}

function run(): void {
  testResultReasonLabelIsRenderedAsBold();
  testFeedbackButtonsUseSplitLayoutWithEmoji();
  testPremiumTeaserCopyMatchesCurrentScope();
  testLocalAdminControlsArePresentWithVisibilityGuard();
  testHanjaRowsUseConsistentVerticalAnchors();
  console.log("[test:result-reason-render:web] all tests passed");
}

run();
