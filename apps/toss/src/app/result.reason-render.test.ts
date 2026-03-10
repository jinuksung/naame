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
  assert.equal(
    source.includes('className="share-row"') && source.includes("공유하기"),
    true,
    "토스 결과 카드 액션 하단에는 공유하기 단독 행(share-row)이 있어야 합니다.",
  );
  assert.equal(
    source.includes("공유 준비 중..."),
    true,
    "토스 결과 카드 공유 버튼은 처리 중 상태 텍스트(공유 준비 중...)를 제공해야 합니다.",
  );
  assert.equal(
    source.includes("shareFreeResultCard"),
    true,
    "토스 결과 화면은 무료 카드 공유 핸들러(shareFreeResultCard)를 호출해야 합니다.",
  );
  assert.equal(
    source.includes("여기 밑에 좋아요를 누르면 찜한 이름 목록에 저장됩니다."),
    true,
    "토스 결과 화면 상단에는 좋아요 저장 안내 문구가 노출되어야 합니다.",
  );
}

function testPremiumTeaserUsesTossStyledClasses(): void {
  const source = readFileSync(RESULT_PAGE_PATH, "utf8");
  assert.equal(
    source.includes('className="tds-premium-teaser"'),
    true,
    "토스 결과 화면의 유료 안내 섹션은 tds-premium-teaser 클래스를 사용해야 합니다.",
  );
  assert.equal(
    source.includes('className="tds-premium-title"'),
    true,
    "토스 결과 화면의 유료 안내 제목은 tds-premium-title 클래스를 사용해야 합니다.",
  );
  assert.equal(
    source.includes('className="tds-premium-list"'),
    true,
    "토스 결과 화면의 유료 안내 목록은 tds-premium-list 클래스를 사용해야 합니다.",
  );
  assert.equal(
    source.includes('className="nf-premium-teaser"'),
    false,
    "토스 결과 화면에서 web 전용 nf-premium-teaser 클래스는 사용하지 않아야 합니다.",
  );
  assert.equal(
    source.includes('className="premium-teaser"'),
    false,
    "토스 결과 화면에서 레거시 premium-teaser 클래스는 사용하지 않아야 합니다.",
  );
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

function run(): void {
  testResultReasonLabelIsRenderedAsBold();
  testFeedbackButtonsUseSplitLayoutWithEmoji();
  testPremiumTeaserUsesTossStyledClasses();
  testLocalAdminControlsArePresentWithVisibilityGuard();
  console.log("[test:result-reason-render:toss] all tests passed");
}

run();
