import assert from "node:assert/strict";
import { scoreGender } from "./gender";

function testGenderScoreSupportsMaleSignal(): void {
  const male = scoreGender("도윤", "MALE");
  const female = scoreGender("도윤", "FEMALE");
  assert.ok(male.score > female.score);
  assert.ok(male.score > 0);
}

function testGenderScoreSupportsFemaleSignal(): void {
  const male = scoreGender("서아", "MALE");
  const female = scoreGender("서아", "FEMALE");
  assert.ok(female.score > male.score);
  assert.ok(female.score > 0);
}

function testAnyGenderReturnsNeutral(): void {
  const any = scoreGender("도윤", "ANY");
  assert.equal(any.score, 0);
}

function run(): void {
  testGenderScoreSupportsMaleSignal();
  testGenderScoreSupportsFemaleSignal();
  testAnyGenderReturnsNeutral();
  console.log("[test:gender] all tests passed");
}

run();
