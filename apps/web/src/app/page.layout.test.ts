import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";

const INPUT_PAGE_PATH = path.resolve(__dirname, "free", "page.tsx");
const ROOT_PAGE_PATH = path.resolve(__dirname, "page.tsx");
const LAYOUT_PAGE_PATH = path.resolve(__dirname, "layout.tsx");
const MAIN_DESCRIPTION_TEXT = "발음·의미·사용 데이터를 기준으로 조건에 맞는 이름을 찾습니다";
const BASIC_MODE_HEADER_TEXT = "기본모드에서는 아래 기준으로 이름을 선정합니다.";
const BASIC_MODE_SAJU_NOTE_TEXT = "※ 오행 균형은";
const FREE_TITLE_WITH_LINE_BREAK = "네임핏:\\n우리 아이 이름 찾기";
const BASIC_MODE_RULE_PHONETIC = "발음오행: 이름을 읽었을 때 발음 흐름과 소리 균형을 봅니다.";
const BASIC_MODE_RULE_MEANING = "의미: 한자 조합이 전달하는 의미의 조화와 선명도를 봅니다.";
const BASIC_MODE_RULE_BALANCE = "오행 균형: 이름의 오행조합이 조화로운지 봅니다.";
const TITLE_BRAND_IMAGE_PATH = "/namefit-mark-inline.svg";
const FAVICON_IMAGE_PATH = "/namefit-mark.svg";

function testBirthInputsAreNotRenderedInBasicMode(): void {
  const source = readFileSync(INPUT_PAGE_PATH, "utf8");

  assert.equal(source.includes('label="생년월일"'), false, "기본모드에 생년월일 입력이 없어야 합니다.");
  assert.equal(source.includes('label="출생시간 입력"'), false, "기본모드에 출생시간 토글이 없어야 합니다.");
  assert.equal(source.includes('label="출생시간"'), false, "기본모드에 출생시간 필드가 없어야 합니다.");
  assert.equal(source.includes('label="성별"'), true, "기본모드에 성별 입력은 유지되어야 합니다.");
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
  assert.equal(
    source.includes(BASIC_MODE_RULE_PHONETIC) &&
      source.includes(BASIC_MODE_RULE_MEANING) &&
      source.includes(BASIC_MODE_RULE_BALANCE),
    true,
    "기본모드 설명 문구는 최신 안내 문구로 교체되어야 합니다.",
  );
}

function testMainTitleSupportsForcedLineBreak(): void {
  const source = readFileSync(INPUT_PAGE_PATH, "utf8");
  assert.equal(
    source.includes(`FREE_INPUT_TITLE = "${FREE_TITLE_WITH_LINE_BREAK}"`) &&
      source.includes("title={FREE_INPUT_TITLE}"),
    true,
    "입력 화면 타이틀은 '네임핏:' 다음 줄로 강제 줄바꿈되어야 합니다.",
  );
}

function testMainPageRendersBrandImage(): void {
  const source = readFileSync(INPUT_PAGE_PATH, "utf8");
  assert.equal(
    source.includes(`titleIconSrc={TITLE_ICON_PATH}`) &&
      source.includes(`TITLE_ICON_PATH = "${TITLE_BRAND_IMAGE_PATH}"`),
    true,
    "타이틀 왼쪽 아이콘 경로가 Screen에 전달되어야 합니다.",
  );
}

function testMetadataUsesBrandFavicon(): void {
  const source = readFileSync(LAYOUT_PAGE_PATH, "utf8");
  assert.equal(
    source.includes(`icon: "${FAVICON_IMAGE_PATH}"`),
    true,
    "layout metadata에 브랜드 파비콘 경로가 설정되어야 합니다.",
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
  testMainTitleSupportsForcedLineBreak();
  testMainPageRendersBrandImage();
  testMetadataUsesBrandFavicon();
  testRootLandingHasPremiumAndFreeRoutes();
  console.log("[test:input-page-layout:web] all tests passed");
}

run();
