import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";

const PREMIUM_RESULT_PAGE_PATH = path.resolve(__dirname, "page.tsx");
const GLOBAL_STYLE_PATH = path.resolve(__dirname, "..", "..", "globals.css");

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
    /formatDisplayName\(\s*surnameHangul,\s*item\.nameHangul,\s*\)/.test(source),
    true,
    "프리미엄 결과 카드 대표 이름 표시는 이름 2글자만이 아니라 성+이름(예: 김민준)으로 보여줘야 합니다.",
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

  assert.equal(
    source.includes("{summary.pillars.year.hangul} ({summary.pillars.year.hanja})") &&
      source.includes("{summary.pillars.month.hangul} ({summary.pillars.month.hanja})") &&
      source.includes("{summary.pillars.day.hangul} ({summary.pillars.day.hanja})") &&
      source.includes("{summary.pillars.hour.hangul} ({summary.pillars.hour.hanja})"),
    true,
    "사주 요약의 년/월/일/시주 표시는 한글 뒤에 한자를 소괄호로 함께 보여줘야 합니다.",
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

function testHanjaCardAreaIsCenterAligned(): void {
  const styles = readFileSync(GLOBAL_STYLE_PATH, "utf8");
  const hanjaListRuleMatch = styles.match(/\.hanja-detail-list\s*\{[\s\S]*?\n\}/);

  assert.equal(
    hanjaListRuleMatch !== null,
    true,
    "globals.css에 .hanja-detail-list 규칙이 있어야 합니다.",
  );
  assert.equal(
    hanjaListRuleMatch?.[0].includes("justify-content: center"),
    true,
    "한자 카드 영역(.hanja-detail-list)은 카드 내부에서 가운데 정렬되어야 합니다.",
  );
}

function testPremiumHeaderDescriptionUsesFriendlyEmoji(): void {
  const source = readFileSync(PREMIUM_RESULT_PAGE_PATH, "utf8");

  assert.equal(
    source.includes('description="적합한 이름을 골라봤어요 ✨"'),
    true,
    "프리미엄 결과 화면 설명 문구는 이모지 1개를 붙여 딱딱한 느낌을 완화해야 합니다.",
  );
}

function testPremiumPillarsUseCompactGridLayout(): void {
  const styles = readFileSync(GLOBAL_STYLE_PATH, "utf8");
  const pillarsRuleMatch = styles.match(/\.tds-premium-pillars\s*\{[\s\S]*?\n\}/);

  assert.equal(
    pillarsRuleMatch !== null,
    true,
    "globals.css에 .tds-premium-pillars 규칙이 있어야 합니다.",
  );
  assert.equal(
    pillarsRuleMatch?.[0].includes("display: grid"),
    true,
    "사주 배지 영역은 줄배치 제어를 위해 grid 레이아웃을 사용해야 합니다.",
  );
  assert.equal(
    pillarsRuleMatch?.[0].includes("grid-template-columns: repeat(2, minmax(0, 1fr))"),
    true,
    "모바일에서는 년/월/일/시주가 2개씩 한 줄에 배치되도록 2열 그리드를 사용해야 합니다.",
  );
}

function testPremiumSummaryExplainsWhatIlganMeans(): void {
  const source = readFileSync(PREMIUM_RESULT_PAGE_PATH, "utf8");

  assert.equal(
    source.includes('className="tds-premium-summary-help"'),
    true,
    "일간 설명 보강을 위한 보조 문구 영역이 있어야 합니다.",
  );
  assert.equal(
    source.includes("일간은") && source.includes("천간") && source.includes("부족한 오행"),
    true,
    "일간 의미와 문구가 설명하는 대상(부족한 오행)을 함께 안내해야 합니다.",
  );
}

function testPremiumPillarsExplainWhatEachPillarMeans(): void {
  const source = readFileSync(PREMIUM_RESULT_PAGE_PATH, "utf8");

  assert.equal(
    source.includes("PILLAR_HELP_TEXT") &&
      source.includes("초년") &&
      source.includes("성장기") &&
      source.includes("나 자신") &&
      source.includes("후반"),
    true,
    "년주/월주/일주/시주 카드에는 각 축의 의미를 설명하는 보조 문구가 있어야 합니다.",
  );
  assert.equal(
    source.includes("summary.pillars.hour ?") && source.includes("시주 미반영"),
    true,
    "출생시간 미입력인 경우에도 시주 카드 자리와 미반영 상태를 안내해야 합니다.",
  );
}

function testPremiumWeakSummaryUsesDynamicTop2OrTop3(): void {
  const source = readFileSync(PREMIUM_RESULT_PAGE_PATH, "utf8");

  assert.equal(
    source.includes("getWeakTopElements(summary)") &&
      source.includes("부족 TOP{weakTopLabelCount}:") &&
      source.includes("weakTopElements.map"),
    true,
    "프리미엄 요약은 부족 오행 개수(2~3개)에 따라 TOP2/TOP3를 가변 표기해야 합니다.",
  );
}

function run(): void {
  testPremiumNameAndHanjaUseFreeCardDesign();
  testHanjaCardAreaIsCenterAligned();
  testPremiumHeaderDescriptionUsesFriendlyEmoji();
  testPremiumPillarsUseCompactGridLayout();
  testPremiumSummaryExplainsWhatIlganMeans();
  testPremiumPillarsExplainWhatEachPillarMeans();
  testPremiumWeakSummaryUsesDynamicTop2OrTop3();
  console.log("[test:premium-result-layout:toss] all tests passed");
}

run();
