import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

const FREE_PAGE_PATH = path.resolve(__dirname, "..", "free", "page.tsx");
const PREMIUM_PAGE_PATH = path.resolve(__dirname, "..", "premium", "page.tsx");
const FREE_RESULT_PAGE_PATH = path.resolve(__dirname, "..", "result", "page.tsx");
const PREMIUM_RESULT_PAGE_PATH = path.resolve(__dirname, "..", "premium", "result", "page.tsx");
const LIKED_PAGE_PATH = path.resolve(__dirname, "page.tsx");

function testLikedListEntryButtonsAreRendered(): void {
  const freeSource = readFileSync(FREE_PAGE_PATH, "utf8");
  const premiumSource = readFileSync(PREMIUM_PAGE_PATH, "utf8");
  const freeResultSource = readFileSync(FREE_RESULT_PAGE_PATH, "utf8");
  const premiumResultSource = readFileSync(PREMIUM_RESULT_PAGE_PATH, "utf8");

  assert.equal(
    freeSource.includes("찜한 이름 보기"),
    true,
    "무료 입력 화면에 '찜한 이름 보기' 버튼이 있어야 합니다.",
  );
  assert.equal(
    premiumSource.includes("찜한 이름 보기"),
    true,
    "프리미엄 입력 화면에 '찜한 이름 보기' 버튼이 있어야 합니다.",
  );
  assert.equal(
    freeResultSource.includes("찜한 이름 보기"),
    true,
    "무료 결과 화면에 '찜한 이름 보기' 이동 버튼이 있어야 합니다.",
  );
  assert.equal(
    premiumResultSource.includes("찜한 이름 보기"),
    true,
    "프리미엄 결과 화면에 '찜한 이름 보기' 이동 버튼이 있어야 합니다.",
  );
}

function testLikedPageExistsWithEmptyStateCopy(): void {
  assert.equal(
    existsSync(LIKED_PAGE_PATH),
    true,
    "웹 앱에 찜 목록 화면(/liked)이 있어야 합니다.",
  );

  const source = readFileSync(LIKED_PAGE_PATH, "utf8");
  assert.equal(
    source.includes("찜한 이름"),
    true,
    "찜 목록 화면 타이틀이 보여야 합니다.",
  );
  assert.equal(
    source.includes("아직 저장한 이름이 없어요"),
    true,
    "찜 목록 화면에는 빈 상태 문구가 있어야 합니다.",
  );
  assert.equal(
    source.includes("nf-hanja-detail-list"),
    true,
    "찜 목록 카드에는 결과 카드와 동일한 한자/독음/뜻 영역이 있어야 합니다.",
  );
  assert.equal(
    source.includes("entry.reason"),
    false,
    "찜 목록 카드에서는 추천 설명 문구를 노출하지 않아야 합니다.",
  );
  assert.equal(
    source.includes("점수 없음"),
    false,
    "찜 목록 카드에서는 점수 문구를 노출하지 않아야 합니다.",
  );
}

function run(): void {
  testLikedListEntryButtonsAreRendered();
  testLikedPageExistsWithEmptyStateCopy();
  console.log("[test:liked-page-layout:web] all tests passed");
}

run();
