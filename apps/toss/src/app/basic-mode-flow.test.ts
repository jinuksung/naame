import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";

const LOADING_PAGE_PATH = path.resolve(__dirname, "loading/page.tsx");
const RESULT_PAGE_PATH = path.resolve(__dirname, "result/page.tsx");

function testLoadingPageDoesNotRequireBirthDate(): void {
  const source = readFileSync(LOADING_PAGE_PATH, "utf8");
  assert.equal(
    source.includes("input.birth.date.length > 0"),
    false,
    "기본모드에서는 loading 페이지가 birth.date를 필수로 보지 않아야 합니다.",
  );
}

function testResultPageDoesNotRequireBirthDate(): void {
  const source = readFileSync(RESULT_PAGE_PATH, "utf8");
  assert.equal(
    source.includes("input.birth.date.length > 0"),
    false,
    "기본모드에서는 result 페이지가 birth.date를 필수로 보지 않아야 합니다.",
  );
}

function run(): void {
  testLoadingPageDoesNotRequireBirthDate();
  testResultPageDoesNotRequireBirthDate();
  console.log("[test:basic-mode-flow:toss] all tests passed");
}

run();
