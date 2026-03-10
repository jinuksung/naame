import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";

const SHARE_UTIL_PATH = path.resolve(__dirname, "shareResultCardImage.ts");

function testShareUtilityHasTextFallbackWhenFileShareIsUnsupported(): void {
  const source = readFileSync(SHARE_UTIL_PATH, "utf8");

  assert.equal(
    source.includes("await withShareTimeout("),
    true,
    "공유 유틸은 웹뷰 무응답 환경을 위해 share 호출에 타임아웃 보호를 적용해야 합니다.",
  );
  assert.equal(
    source.includes("files: [file]"),
    true,
    "공유 유틸은 canShare 결과만 신뢰하지 말고 파일 공유 호출을 먼저 시도해야 합니다.",
  );
  assert.equal(
    source.includes("text: options.title") &&
      source.includes("url: window.location.href"),
    true,
    "파일 공유가 불가능한 환경에서도 현재 페이지 URL을 포함한 텍스트 공유 폴백을 시도해야 합니다.",
  );
}

function run(): void {
  testShareUtilityHasTextFallbackWhenFileShareIsUnsupported();
  console.log("[test:share-fallback:toss] all tests passed");
}

run();
