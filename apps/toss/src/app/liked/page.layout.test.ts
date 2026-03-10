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
}

function run(): void {
  testLikedPageUsesMutedSavedAtTextAndShareStyleRemoveButton();
  console.log("[test:liked-layout:toss] all tests passed");
}

run();
