import assert from "node:assert/strict";
import { diversifyByStartEnd, pickSeededWindow } from "./diversify";

function testPickSeededWindowDefaultsToTopSlice(): void {
  const source = ["가온", "나온", "다운", "라온", "마온", "바온"];
  const picked = pickSeededWindow(source, { limit: 3 });
  assert.deepEqual(picked, ["가온", "나온", "다운"]);
}

function testPickSeededWindowChangesWithSeed(): void {
  const source = ["가온", "나온", "다운", "라온", "마온", "바온", "사온", "아온"];
  const pickedA = pickSeededWindow(source, { limit: 3, seed: 1 });
  const pickedB = pickSeededWindow(source, { limit: 3, seed: 2 });
  const pickedBAgain = pickSeededWindow(source, { limit: 3, seed: 2 });

  assert.notDeepEqual(pickedA, pickedB);
  assert.deepEqual(pickedB, pickedBAgain);
}

function testDiversifyAndSeededWindowWorkTogether(): void {
  const ranked = [
    { nameHangul: "가온" },
    { nameHangul: "가람" },
    { nameHangul: "가빈" },
    { nameHangul: "나온" },
    { nameHangul: "다온" },
    { nameHangul: "라온" },
    { nameHangul: "마온" },
    { nameHangul: "바온" }
  ];

  const diversified = diversifyByStartEnd(ranked, {
    limit: 6,
    maxSameStart: 2,
    maxSameEnd: 2,
    getName: (candidate) => candidate.nameHangul
  });
  const picked = pickSeededWindow(diversified, { limit: 4, seed: 3 });

  assert.equal(picked.length, 4);
}

function run(): void {
  testPickSeededWindowDefaultsToTopSlice();
  testPickSeededWindowChangesWithSeed();
  testDiversifyAndSeededWindowWorkTogether();
  console.log("[test:diversify] all tests passed");
}

run();
