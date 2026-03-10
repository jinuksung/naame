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

function testShareUtilityCapturesFromViewportStagingNode(): void {
  const source = readFileSync(SHARE_UTIL_PATH, "utf8");

  assert.equal(
    source.includes("data-namefit-share-capture"),
    true,
    "모바일 웹뷰의 빈 이미지 이슈를 피하려면 공유 캡처용 임시 스테이징 노드를 생성해야 합니다.",
  );
  assert.equal(
    source.includes("cloneNode(true)"),
    true,
    "공유 캡처는 오프스크린 원본 대신 뷰포트 내 clone 노드에서 수행해야 합니다.",
  );
  assert.equal(
    source.includes("waitForCaptureReady"),
    true,
    "캡처 전 폰트/레이아웃이 준비되도록 대기 로직이 있어야 합니다.",
  );
  assert.equal(
    source.includes("share-render-host") && source.includes("firstElementChild"),
    true,
    "공유 캡처 시 offscreen host가 아닌 실제 카드 요소를 선택해야 흰 화면 문제를 피할 수 있습니다.",
  );
  assert.equal(
    source.includes("namefit-mark.svg") && source.includes("네임핏"),
    true,
    "공유 이미지 좌하단에는 네임핏 로고와 서비스명이 함께 노출되어야 합니다.",
  );
}

function testShareUtilityUsesFriendlyShareTitle(): void {
  const source = readFileSync(SHARE_UTIL_PATH, "utf8");

  assert.equal(
    source.includes("네임핏이 만들어준 예쁜 이름이에요🐥"),
    true,
    "공유 텍스트는 사용자 요청 문구로 고정되어야 합니다.",
  );
}

function run(): void {
  testShareUtilityHasTextFallbackWhenFileShareIsUnsupported();
  testShareUtilityCapturesFromViewportStagingNode();
  testShareUtilityUsesFriendlyShareTitle();
  console.log("[test:share-fallback:web] all tests passed");
}

run();
