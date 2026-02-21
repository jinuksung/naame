import assert from "node:assert/strict";
import { buildSajuDistFromPillars } from "./sajuDist";
import { calcSajuScore5, pickWeakTop2 } from "./sajuScore";
import { ElementDist } from "./elements";

function sumDist(dist: ElementDist): number {
  return dist.WOOD + dist.FIRE + dist.EARTH + dist.METAL + dist.WATER;
}

function run(): void {
  const distSaju = buildSajuDistFromPillars({
    yearPillar: "갑자",
    monthPillar: "을축",
    dayPillar: "병인",
    hourPillar: null
  });

  assert.ok(Math.abs(sumDist(distSaju) - 1) < 1e-9, "distSaju는 1로 정규화되어야 합니다.");
  assert.ok(distSaju.WOOD > distSaju.FIRE, "목 비중이 화보다 커야 합니다.");
  assert.ok(distSaju.FIRE > distSaju.EARTH, "화 비중이 토보다 커야 합니다.");
  assert.ok(distSaju.EARTH > distSaju.METAL, "토 비중이 금보다 커야 합니다.");

  const weakTop2 = pickWeakTop2(distSaju);
  assert.deepEqual(weakTop2, ["METAL", "EARTH"], "부족 TOP2는 금/토 순서여야 합니다.");

  const improvePerfect = calcSajuScore5({
    distSaju: {
      WOOD: 0.31,
      FIRE: 0.24,
      EARTH: 0.15,
      METAL: 0.09,
      WATER: 0.21
    },
    distFullName: {
      WOOD: 0.05,
      FIRE: 0.10,
      EARTH: 0.35,
      METAL: 0.40,
      WATER: 0.10
    }
  });

  assert.equal(improvePerfect.mode, "IMPROVE");
  assert.equal(improvePerfect.sajuScore5, 5, "부족 오행을 완전히 채우면 5점이어야 합니다.");

  const improveHalfStep = calcSajuScore5({
    distSaju: {
      WOOD: 0.25,
      FIRE: 0.25,
      EARTH: 0.25,
      METAL: 0.05,
      WATER: 0.20
    },
    distFullName: {
      WOOD: 0.30,
      FIRE: 0.20,
      EARTH: 0.20,
      METAL: 0.105,
      WATER: 0.195
    }
  });

  assert.equal(improveHalfStep.mode, "IMPROVE");
  assert.equal(improveHalfStep.sajuScore5, 3.5, "0.5 단위 반올림이 적용되어야 합니다.");

  const harmonyPerfect = calcSajuScore5({
    distSaju: {
      WOOD: 0.2,
      FIRE: 0.2,
      EARTH: 0.2,
      METAL: 0.2,
      WATER: 0.2
    },
    distFullName: {
      WOOD: 0.2,
      FIRE: 0.2,
      EARTH: 0.2,
      METAL: 0.2,
      WATER: 0.2
    }
  });

  assert.equal(harmonyPerfect.mode, "HARMONY");
  assert.equal(harmonyPerfect.sajuScore5, 5, "조화 모드 완전 일치는 5점이어야 합니다.");

  console.log("[test:premium:saju-score] all tests passed");
}

run();
