import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";

const LOADING_PAGE_PATH = path.resolve(__dirname, "loading/page.tsx");
const RESULT_PAGE_PATH = path.resolve(__dirname, "result/page.tsx");
const INPUT_ROUTE = '"/feature/recommend"';

function testLoadingPageRedirectsToFeatureRecommend(): void {
  const source = readFileSync(LOADING_PAGE_PATH, "utf8");
  assert.equal(
    source.includes(`router.replace(${INPUT_ROUTE})`),
    true,
    "loading 페이지는 입력 화면 복귀 경로를 /feature/recommend로 사용해야 합니다.",
  );
}

function testResultPageRedirectsToFeatureRecommend(): void {
  const source = readFileSync(RESULT_PAGE_PATH, "utf8");
  assert.equal(
    source.includes(`router.replace(${INPUT_ROUTE})`),
    true,
    "result 페이지는 입력 화면 복귀 경로를 /feature/recommend로 사용해야 합니다.",
  );
}

function run(): void {
  testLoadingPageRedirectsToFeatureRecommend();
  testResultPageRedirectsToFeatureRecommend();
  console.log("[test:route-redirect-paths:toss] all tests passed");
}

run();
