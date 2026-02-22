import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";

const PREMIUM_INPUT_PAGE_PATH = path.resolve(__dirname, "page.tsx");

function testPremiumTopNoticeIsVisible(): void {
  const source = readFileSync(PREMIUM_INPUT_PAGE_PATH, "utf8");
  assert.equal(
    source.includes("현재 한시적으로 유료 버전을 무료로 제공 중이며 추후 유료 전환될 수 있습니다."),
    true,
    "프리미엄 입력 페이지 상단에 한시적 무료/추후 유료 전환 안내문구가 있어야 합니다.",
  );
}

function testPremiumSurnameFollowsFreeModeSelectorFlow(): void {
  const source = readFileSync(PREMIUM_INPUT_PAGE_PATH, "utf8");
  assert.equal(
    source.includes("fetchSurnameHanjaOptions"),
    true,
    "프리미엄 입력 페이지도 성(음) 입력 기반 성씨 한자 옵션 조회를 사용해야 합니다.",
  );
  assert.equal(
    source.includes("성(음) / 성씨 한자"),
    true,
    "프리미엄 입력 페이지 성씨 입력 라벨은 무료 페이지와 동일한 형태여야 합니다.",
  );
  assert.equal(
    source.includes("tds-hanja-options"),
    true,
    "프리미엄 입력 페이지에 성씨 한자 옵션 리스트 영역이 있어야 합니다.",
  );
}

function testPremiumDateAndTimeFieldsUseTextStyleInput(): void {
  const source = readFileSync(PREMIUM_INPUT_PAGE_PATH, "utf8");
  assert.equal(
    source.includes('type="date"'),
    false,
    "생년월일 입력은 네이티브 date 타입 대신 TDS 텍스트 필드를 사용해야 합니다.",
  );
  assert.equal(
    source.includes('type="time"'),
    false,
    "출생시간 입력은 네이티브 time 타입 대신 TDS 텍스트 필드를 사용해야 합니다.",
  );
  assert.equal(
    source.includes("tds-inline-input-row") &&
      source.includes("년") &&
      source.includes("월") &&
      source.includes("일"),
    true,
    "생년월일은 연/월/일 분리 텍스트 입력 형태여야 합니다.",
  );
  assert.equal(
    source.includes("오전") &&
      source.includes("오후") &&
      source.includes("시") &&
      source.includes("분"),
    true,
    "출생시간은 오전/오후 선택과 시/분 분리 입력 형태여야 합니다.",
  );
  assert.equal(
    source.includes("tds-time-inline-row"),
    true,
    "출생시간 입력은 오전/오후와 시/분이 한 줄 레이아웃으로 렌더링되어야 합니다.",
  );

  assert.equal(
    source.includes("isLocalAdminToolsEnabled") &&
      source.includes("로컬 자동 입력으로 바로 조회"),
    true,
    "프리미엄 입력 화면에는 로컬 개발 환경에서만 보이는 원클릭 자동조회 버튼이 있어야 합니다.",
  );
}

function run(): void {
  testPremiumTopNoticeIsVisible();
  testPremiumSurnameFollowsFreeModeSelectorFlow();
  testPremiumDateAndTimeFieldsUseTextStyleInput();
  console.log("[test:premium-page-layout:toss] all tests passed");
}

run();
