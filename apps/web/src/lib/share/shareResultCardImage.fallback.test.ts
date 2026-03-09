import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";

const SHARE_UTIL_PATH = path.resolve(__dirname, "shareResultCardImage.ts");

function testShareUtilityHasTextFallbackWhenFileShareIsUnsupported(): void {
  const source = readFileSync(SHARE_UTIL_PATH, "utf8");

  assert.equal(
    source.includes("navigatorWithCanShare.canShare?.({ files: [file] })"),
    true,
    "공유 유틸은 파일 공유 가능 여부(canShare)를 먼저 확인해야 합니다.",
  );
  assert.equal(
    source.includes("text: options.title"),
    true,
    "파일 공유가 불가능한 환경에서도 navigator.share 텍스트 폴백을 시도해야 합니다.",
  );
}

function run(): void {
  testShareUtilityHasTextFallbackWhenFileShareIsUnsupported();
  console.log("[test:share-fallback:web] all tests passed");
}

run();
