import assert from "node:assert/strict";
import { calcSoundScore5 } from "./soundScore";

function run(): void {
  const twoMatch = calcSoundScore5({
    mode: "IMPROVE",
    weakTop3: ["WOOD", "FIRE", "EARTH"],
    soundElements: ["WOOD", "FIRE"],
    phoneticScore: 80,
  });
  assert.equal(
    twoMatch.soundScore5,
    4.5,
    "부족 오행 3개 기준에서도 2개 매칭은 기존과 같은 4.5점을 유지해야 합니다.",
  );

  const threeMatch = calcSoundScore5({
    mode: "IMPROVE",
    weakTop3: ["WOOD", "FIRE", "EARTH"],
    soundElements: ["WOOD", "FIRE", "EARTH"],
    phoneticScore: 80,
  });
  assert.equal(
    threeMatch.matchedWeakCount,
    3,
    "발음 오행은 부족 오행 최대 3개까지 매칭 개수를 계산해야 합니다.",
  );
  assert.equal(
    threeMatch.soundScore5,
    5,
    "부족 오행 3개를 모두 맞추면 발음 점수 보정 기준에서 5점까지 올라갈 수 있어야 합니다.",
  );

  console.log("[test:premium:sound-score] all tests passed");
}

run();
