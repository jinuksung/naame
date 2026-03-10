import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";

const LIKED_PAGE_PATH = path.resolve(__dirname, "page.tsx");

function testLikedPageUsesMutedSavedAtTextAndShareStyleRemoveButton(): void {
  const source = readFileSync(LIKED_PAGE_PATH, "utf8");

  assert.equal(
    source.includes('className="nf-liked-saved-at"'),
    true,
    "웹 찜한 이름 카드의 저장 시각은 전용 약한 강조 클래스(nf-liked-saved-at)를 사용해야 합니다.",
  );
  assert.equal(
    source.includes('className="nf-share-row"') &&
      source.includes('className="nf-feedback-btn is-share"') &&
      source.includes("찜 해제"),
    true,
    "웹 찜 해제 버튼은 공유하기와 동일한 단독 행 버튼 스타일(nf-share-row / nf-feedback-btn is-share)을 사용해야 합니다.",
  );
}

function testLikedPageWrapsSearchParamsWithSuspenseBoundary(): void {
  const source = readFileSync(LIKED_PAGE_PATH, "utf8");

  assert.equal(
    source.includes("function LikedPageContent(): JSX.Element"),
    true,
    "useSearchParams를 사용하는 찜 화면 본문은 분리된 내부 컴포넌트여야 합니다.",
  );
  assert.equal(
    source.includes("<Suspense fallback={<></>}>") &&
      source.includes("<LikedPageContent />"),
    true,
    "웹 찜 화면은 prerender 오류를 피하기 위해 Suspense 경계로 래핑되어야 합니다.",
  );
}

function run(): void {
  testLikedPageUsesMutedSavedAtTextAndShareStyleRemoveButton();
  testLikedPageWrapsSearchParamsWithSuspenseBoundary();
  console.log("[test:liked-layout:web] all tests passed");
}

run();
