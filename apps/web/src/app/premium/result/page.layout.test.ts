import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";

const PREMIUM_RESULT_PAGE_PATH = path.resolve(__dirname, "page.tsx");

function testPremiumResultHasLocalQuickStartButton(): void {
  const source = readFileSync(PREMIUM_RESULT_PAGE_PATH, "utf8");
  assert.equal(
    source.includes("isLocalAdminToolsEnabled") &&
      source.includes("로컬 자동 입력으로 바로 조회"),
    true,
    "웹 프리미엄 결과 화면에도 로컬 개발 환경에서만 노출되는 원클릭 자동조회 버튼이 있어야 합니다.",
  );
  assert.equal(
    source.includes("formatDisplayName(surnameHangul, item.nameHangul)"),
    true,
    "웹 프리미엄 결과 카드 대표 이름 표시는 이름 2글자만이 아니라 성+이름(예: 김민준)으로 보여줘야 합니다.",
  );

  const quickStartFnMatch = source.match(
    /const handleLocalQuickStart = \(\): void => \{[\s\S]*?\n  \};/,
  );
  assert.equal(
    quickStartFnMatch !== null,
    true,
    "웹 프리미엄 결과 화면에는 로컬 자동조회 핸들러가 있어야 합니다.",
  );
  assert.equal(
    quickStartFnMatch?.[0].includes("setSummary(null)"),
    false,
    "로컬 자동조회는 현재 결과 화면의 summary를 먼저 비우면 /premium 리다이렉트와 경합이 발생하므로 setSummary(null)을 호출하면 안 됩니다.",
  );

  assert.equal(
    source.includes("addNameBlockSyllableRule") &&
      source.includes("음절패턴 차단"),
    true,
    "웹 프리미엄 결과 카드에도 로컬 개발모드용 음절패턴 차단 버튼이 있어야 합니다.",
  );
}

function run(): void {
  testPremiumResultHasLocalQuickStartButton();
  console.log("[test:premium-result-layout:web] all tests passed");
}

run();
