import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";

const INPUT_PAGE_PATH = path.resolve(__dirname, "page.tsx");
const BIRTH_NOTE_TEXT =
  "생년월일, 출생시간은 참고용으로만 사용되며 결과에 큰 영향을 주지 않습니다.";

function testBirthTimeSectionComesBeforeGenderSection(): void {
  const source = readFileSync(INPUT_PAGE_PATH, "utf8");
  const birthTimeToggleIndex = source.indexOf('label="출생시간 입력"');
  const genderSectionIndex = source.indexOf('label="성별"');

  assert.notEqual(birthTimeToggleIndex, -1, "출생시간 입력 토글을 찾을 수 있어야 합니다.");
  assert.notEqual(genderSectionIndex, -1, "성별 입력 영역을 찾을 수 있어야 합니다.");
  assert.ok(
    birthTimeToggleIndex < genderSectionIndex,
    "출생시간 입력 영역이 성별 영역보다 먼저 렌더링되어야 합니다.",
  );
}

function testBirthReferenceNoteIsVisible(): void {
  const source = readFileSync(INPUT_PAGE_PATH, "utf8");
  assert.ok(
    source.includes(BIRTH_NOTE_TEXT),
    "생년월일/출생시간이 참고용이라는 안내 문구가 있어야 합니다.",
  );
}

function run(): void {
  testBirthTimeSectionComesBeforeGenderSection();
  testBirthReferenceNoteIsVisible();
  console.log("[test:input-page-layout:toss] all tests passed");
}

run();
