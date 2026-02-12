import assert from "node:assert/strict";
import {
  calcSajuElementVector,
  gregorianToJdn,
  scoreSajuFit
} from "./sajuElements";
import { BirthInput } from "../../types";

function runTests(): void {
  const refJdn = gregorianToJdn(1984, 2, 2);
  assert.equal(refJdn, 2445733, "1984-02-02 JDN should match reference");

  const withTimeBirth: BirthInput = {
    calendar: "SOLAR",
    date: "1984-02-02",
    time: "23:30",
    timezone: "Asia/Seoul"
  };

  const withTime = calcSajuElementVector(withTimeBirth);
  assert.equal(withTime.precision, "DATE_TIME");
  assert.equal(withTime.pillars.year.stem + withTime.pillars.year.branch, "갑자");
  assert.equal(withTime.pillars.day.stem + withTime.pillars.day.branch, "갑자");
  assert.ok(withTime.pillars.hour, "hour pillar should exist when time is provided");
  assert.equal(withTime.pillars.hour.stem + withTime.pillars.hour.branch, "갑자");

  const dateOnlyBirth: BirthInput = {
    calendar: "SOLAR",
    date: "2025-08-05",
    timezone: "Asia/Seoul"
  };
  const dateOnly = calcSajuElementVector(dateOnlyBirth);
  assert.equal(dateOnly.precision, "DATE_ONLY");
  assert.equal(dateOnly.pillars.day.stem + dateOnly.pillars.day.branch, "갑진");
  assert.equal(dateOnly.pillars.hour, undefined);

  const v = dateOnly.vector;
  const vectorSum = v.WOOD + v.FIRE + v.EARTH + v.METAL + v.WATER;
  assert.ok(Math.abs(vectorSum - 100) < 0.1, "normalized vector sum should be ~100");

  const lunarFallback = calcSajuElementVector({
    calendar: "LUNAR",
    date: "2025-08-05",
    timezone: "Asia/Seoul"
  });
  assert.ok(
    lunarFallback.reasons.some((reason) => reason.includes("미지원")),
    "LUNAR fallback reason should exist"
  );

  const sajuScore = scoreSajuFit("성가노", dateOnly.vector, {
    precision: dateOnly.precision,
    pillars: dateOnly.pillars
  });
  assert.ok(sajuScore.score >= 0 && sajuScore.score <= 100, "saju score must be clamped");

  console.log("[test:saju] all tests passed");
}

runTests();
