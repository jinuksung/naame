import assert from "node:assert/strict";
import {
  normalizeHangulReading,
  normalizeHangulReadingWithLimit
} from "./normalizeHangulReading";

function runTests(): void {
  assert.equal(normalizeHangulReading("김"), "김");
  assert.equal(normalizeHangulReading("  ㄱㅣㅁ "), "김");
  assert.equal(normalizeHangulReading("기ㅁ"), "김");
  assert.equal(normalizeHangulReading("ㄴㅏㅁㄱㅜㅇ"), "남궁");
  assert.equal(normalizeHangulReading("이"), "이");

  assert.equal(normalizeHangulReadingWithLimit("ㄴㅏㅁㄱㅜㅇ", 2), "남궁");
  assert.equal(normalizeHangulReadingWithLimit("ㄱㅣㅁㅅㅓ", 2), "김서");

  console.log("[test:normalize-hangul-reading] all tests passed");
}

runTests();
