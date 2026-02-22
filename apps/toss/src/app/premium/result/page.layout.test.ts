import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";

const PREMIUM_RESULT_PAGE_PATH = path.resolve(__dirname, "page.tsx");

function testPremiumNameAndHanjaUseFreeCardDesign(): void {
  const source = readFileSync(PREMIUM_RESULT_PAGE_PATH, "utf8");

  assert.equal(
    source.includes('className="result-header-row"'),
    true,
    "프리미엄 결과 카드 상단은 무료와 동일하게 result-header-row를 사용해야 합니다.",
  );
  assert.equal(
    source.includes('className="pron-emphasis"'),
    true,
    "프리미엄 결과 카드 이름 표시는 무료와 동일하게 pron-emphasis를 사용해야 합니다.",
  );
  assert.equal(
    source.includes('className="hanja-detail-list"') &&
      source.includes('className="hanja-detail-item"') &&
      source.includes('className="hanja-char"') &&
      source.includes('className="hanja-reading"') &&
      source.includes('className="hanja-meaning"'),
    true,
    "프리미엄 결과 카드 한자 표시는 무료와 동일한 hanja-detail-* 구조를 사용해야 합니다.",
  );

  assert.equal(
    source.includes("isLocalAdminToolsEnabled") &&
      source.includes("markHanjaAsNotInmyong") &&
      source.includes("addNameToBlacklist") &&
      source.includes("addNameBlockSyllableRule"),
    true,
    "개발모드에서만 노출되는 로컬 관리자 기능(한자 비인명용 처리/이름 블랙리스트/음절패턴 차단)이 프리미엄 결과에도 있어야 합니다.",
  );
  assert.equal(
    source.includes("local-admin-btn"),
    true,
    "로컬 관리자 액션 버튼은 기존 최소 스타일(local-admin-btn 계열)을 재사용해야 합니다.",
  );
  assert.equal(
    source.includes("음절패턴 차단"),
    true,
    "프리미엄 결과 카드에서 로컬 개발모드용 음절패턴 차단 버튼을 제공해야 합니다.",
  );

  assert.equal(
    source.includes("로컬 자동 입력으로 바로 조회"),
    true,
    "프리미엄 결과 화면에도 로컬 개발 환경에서만 보이는 원클릭 자동조회 버튼이 있어야 합니다.",
  );

  assert.equal(
    source.includes("submitNameFeedback") &&
      source.includes("syncFeedbackStatus") &&
      source.includes("syncFeedbackVote"),
    true,
    "프리미엄 결과도 무료와 동일하게 좋아요/싫어요 피드백 상태 동기화 및 전송 로직을 사용해야 합니다.",
  );

  assert.equal(
    source.includes('className="feedback-row is-split"') &&
      source.includes('className={`feedback-btn is-like') &&
      source.includes('className={`feedback-btn is-dislike') &&
      source.includes("<ThumbUpIcon />") &&
      source.includes("<ThumbDownIcon />"),
    true,
    "프리미엄 결과 카드에 무료와 동일한 좋아요/싫어요 버튼 UI(feedback-row/feedback-btn)가 있어야 합니다.",
  );

  const quickStartFnMatch = source.match(
    /const handleLocalQuickStart = async \(\): Promise<void> => \{[\s\S]*?\n  \};/,
  );
  assert.equal(
    quickStartFnMatch !== null,
    true,
    "프리미엄 결과 화면에는 로컬 자동조회 핸들러가 있어야 합니다.",
  );
  assert.equal(
    quickStartFnMatch?.[0].includes("setSummary(null)"),
    false,
    "로컬 자동조회는 현재 결과 화면의 summary를 먼저 비우면 /premium 리다이렉트와 경합이 발생하므로 setSummary(null)을 호출하면 안 됩니다.",
  );
  assert.equal(
    quickStartFnMatch?.[0].includes("fetchPremiumRecommendations"),
    true,
    "프리미엄 결과 화면의 로컬 자동조회는 로딩 페이지 경유 대신 직접 재조회할 수 있어야 합니다.",
  );
}

function run(): void {
  testPremiumNameAndHanjaUseFreeCardDesign();
  console.log("[test:premium-result-layout:toss] all tests passed");
}

run();
