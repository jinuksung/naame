import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";

const LIKED_PAGE_PATH = path.resolve(__dirname, "page.tsx");

function testLikedPageUsesMutedSavedAtTextAndShareStyleRemoveButton(): void {
  const source = readFileSync(LIKED_PAGE_PATH, "utf8");

  assert.equal(
    source.includes('className="liked-saved-at"'),
    true,
    "토스 찜한 이름 카드의 저장 시각은 전용 약한 강조 클래스(liked-saved-at)를 사용해야 합니다.",
  );
  assert.equal(
    source.includes('className="share-row"') &&
      source.includes('className="feedback-btn is-share"') &&
      source.includes("찜 해제"),
    true,
    "토스 찜 해제 버튼은 공유하기와 동일한 단독 행 버튼 스타일(share-row / feedback-btn is-share)을 사용해야 합니다.",
  );
  const shareButtonIndex = source.indexOf("공유하기");
  const unlikeButtonIndex = source.indexOf("찜 해제");
  assert.equal(
    shareButtonIndex >= 0 && unlikeButtonIndex > shareButtonIndex,
    true,
    "찜한 이름 카드에는 찜 해제 버튼 위에 동일한 스타일의 공유하기 버튼이 있어야 합니다.",
  );
  assert.equal(
    source.includes("shareFreeResultCard") &&
      source.includes("FreeResultShareCard"),
    true,
    "찜한 이름 카드의 공유하기 버튼은 공유 카드 렌더와 이미지 공유 유틸을 사용해야 합니다.",
  );
}

function run(): void {
  testLikedPageUsesMutedSavedAtTextAndShareStyleRemoveButton();
  console.log("[test:liked-layout:toss] all tests passed");
}

run();
