import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";

const PREMIUM_INPUT_PAGE_PATH = path.resolve(__dirname, "page.tsx");

function testPremiumInputHasLocalQuickStartButton(): void {
  const source = readFileSync(PREMIUM_INPUT_PAGE_PATH, "utf8");
  assert.equal(
    source.includes("isLocalAdminToolsEnabled") &&
      source.includes("로컬 자동 입력으로 바로 조회"),
    true,
    "웹 프리미엄 입력 화면에는 로컬 개발 환경에서만 노출되는 원클릭 자동조회 버튼이 있어야 합니다.",
  );
}

function run(): void {
  testPremiumInputHasLocalQuickStartButton();
  console.log("[test:premium-page-layout:web] all tests passed");
}

run();
