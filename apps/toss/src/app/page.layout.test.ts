import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

const INPUT_PAGE_PATH = path.resolve(__dirname, "free", "page.tsx");
const ROOT_PAGE_PATH = path.resolve(__dirname, "page.tsx");
const LAYOUT_PAGE_PATH = path.resolve(__dirname, "layout.tsx");
const ROBOTS_ROUTE_PATH = path.resolve(__dirname, "robots.txt", "route.ts");
const GLOBAL_STYLE_PATH = path.resolve(__dirname, "globals.css");
const MAIN_DESCRIPTION_TEXT = "발음·의미·사용 데이터를 기준으로 조건에 맞는 이름을 찾습니다";
const BASIC_MODE_HEADER_TEXT = "기본모드에서는 아래 기준으로 이름을 선정합니다.";
const BASIC_MODE_SAJU_NOTE_TEXT = "※ 오행 균형은";
const TITLE_BRAND_IMAGE_PATH = "/namefit-mark-inline.svg";
const FAVICON_IMAGE_PATH = "/namefit-mark.svg";

function testBirthInputsAreNotRenderedInBasicMode(): void {
  const source = readFileSync(INPUT_PAGE_PATH, "utf8");

  assert.equal(source.includes('label="생년월일"'), false, "기본모드에 생년월일 입력이 없어야 합니다.");
  assert.equal(source.includes('label="출생시간 입력"'), false, "기본모드에 출생시간 토글이 없어야 합니다.");
  assert.equal(source.includes('label="출생시간"'), false, "기본모드에 출생시간 필드가 없어야 합니다.");
  assert.equal(
    source.includes('label="이름 느낌"'),
    true,
    "기본모드에 이름 느낌 입력은 유지되어야 합니다.",
  );
}

function testMainDescriptionRemovedAndBasicModeGuideVisible(): void {
  const source = readFileSync(INPUT_PAGE_PATH, "utf8");
  assert.equal(
    source.includes(MAIN_DESCRIPTION_TEXT),
    false,
    "메인 설명 문구는 제거되어야 합니다.",
  );
  assert.equal(
    source.includes(BASIC_MODE_HEADER_TEXT),
    true,
    "이름 추천 버튼 아래에 기본모드 기준 설명 헤더가 보여야 합니다.",
  );
  assert.equal(
    source.includes(BASIC_MODE_SAJU_NOTE_TEXT),
    true,
    "기본모드에서 사주 미반영 안내 문구가 보여야 합니다.",
  );
}

function testMainPageRendersBrandImage(): void {
  const source = readFileSync(INPUT_PAGE_PATH, "utf8");
  assert.equal(
    source.includes(`titleIconSrc={BRAND_TITLE_IMAGE_PATH}`) &&
      source.includes(`BRAND_TITLE_IMAGE_PATH = "${TITLE_BRAND_IMAGE_PATH}"`),
    true,
    "타이틀 왼쪽 아이콘 경로가 TdsScreen에 전달되어야 합니다.",
  );
}

function testMetadataUsesBrandFavicon(): void {
  const source = readFileSync(LAYOUT_PAGE_PATH, "utf8");
  assert.equal(
    source.includes(`icon: "${FAVICON_IMAGE_PATH}"`) ||
      source.includes(`BRAND_ICON_PATH = "${FAVICON_IMAGE_PATH}"`),
    true,
    "layout metadata에 브랜드 파비콘 경로가 설정되어야 합니다.",
  );

  assert.equal(
    source.includes("robots: {") &&
      source.includes("index: false") &&
      source.includes("follow: false"),
    true,
    "toss 앱은 전역 robots 메타에서 noindex/nofollow가 설정되어야 합니다.",
  );
}

function testViewportDisablesUnnecessaryZoom(): void {
  const source = readFileSync(LAYOUT_PAGE_PATH, "utf8");
  assert.equal(
    source.includes("export const viewport") &&
      source.includes("maximumScale: 1") &&
      source.includes("userScalable: false"),
    true,
    "toss 앱은 불필요한 확대/축소 제스처를 막기 위해 viewport에서 zoom을 제한해야 합니다.",
  );
}

function testLightModeIsForcedForTossNonGamePolicy(): void {
  const source = readFileSync(GLOBAL_STYLE_PATH, "utf8");
  assert.equal(
    source.includes("color-scheme: light"),
    true,
    "toss 비게임 가이드에 맞게 다크모드는 비활성화하고 라이트 컬러 스킴을 고정해야 합니다.",
  );
}

function testRobotsRouteDisallowsAllCrawling(): void {
  assert.equal(
    existsSync(ROBOTS_ROUTE_PATH),
    true,
    "toss 앱은 robots.txt 라우트 파일이 있어야 합니다.",
  );

  const source = readFileSync(ROBOTS_ROUTE_PATH, "utf8");
  assert.equal(
    source.includes("Disallow: /"),
    true,
    "toss robots.txt는 전체 경로 크롤링을 차단해야 합니다.",
  );
}

function testRootLandingHasPremiumAndFreeRoutes(): void {
  const source = readFileSync(ROOT_PAGE_PATH, "utf8");
  assert.equal(
    source.includes('href="/premium"') && source.includes('href="/free"'),
    true,
    "루트 랜딩에는 /premium 과 /free 선택 링크가 있어야 합니다.",
  );
}

function run(): void {
  testBirthInputsAreNotRenderedInBasicMode();
  testMainDescriptionRemovedAndBasicModeGuideVisible();
  testMainPageRendersBrandImage();
  testMetadataUsesBrandFavicon();
  testViewportDisablesUnnecessaryZoom();
  testLightModeIsForcedForTossNonGamePolicy();
  testRobotsRouteDisallowsAllCrawling();
  testRootLandingHasPremiumAndFreeRoutes();
  console.log("[test:input-page-layout:toss] all tests passed");
}

run();
