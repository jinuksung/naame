import assert from "node:assert/strict";
import {
  buildPremiumRescueExploreSeeds,
  isTopRawSajuAllZero,
  selectPremiumTopWithHighSajuQuota,
  summarizePremiumQuality,
  shouldExpandPremiumPool,
  PremiumSortItem,
  sortPremiumItems,
  toPremiumInput
} from "./premiumRecommend";

function runInputParsingTests(): void {
  const valid = toPremiumInput({
    birth: {
      calendar: "SOLAR",
      date: "2020-05-02"
    },
    surnameHanja: "金",
    gender: "UNISEX"
  });

  assert.ok(valid, "정상 payload는 파싱되어야 합니다.");
  assert.equal(valid?.birth.calendar, "SOLAR");
  assert.equal(valid?.birth.date, "2020-05-02");
  assert.equal(valid?.surnameHanja, "金");

  const invalidDate = toPremiumInput({
    birth: {
      calendar: "SOLAR",
      date: "2020/05/02"
    },
    surnameHanja: "金",
    gender: "UNISEX"
  });
  assert.equal(invalidDate, null, "날짜 형식이 다르면 실패해야 합니다.");

  const invalidGender = toPremiumInput({
    birth: {
      calendar: "SOLAR",
      date: "2020-05-02"
    },
    surnameHanja: "金",
    gender: "OTHER"
  });
  assert.equal(invalidGender, null, "성별 enum 외 값은 실패해야 합니다.");

  const invalidHanja = toPremiumInput({
    birth: {
      calendar: "SOLAR",
      date: "2020-05-02"
    },
    surnameHanja: "",
    gender: "UNISEX"
  });
  assert.equal(invalidHanja, null, "성씨 한자가 비어 있으면 실패해야 합니다.");
}

function runSortingTests(): void {
  const items: PremiumSortItem[] = [
    {
      nameHangul: "다나",
      sajuScore5: 4.5,
      engineScore01: 0.80,
      soundScore5: 4.0
    },
    {
      nameHangul: "가라",
      sajuScore5: 5,
      engineScore01: 0.30,
      soundScore5: 2.5
    },
    {
      nameHangul: "마바",
      sajuScore5: 4.5,
      engineScore01: 0.90,
      soundScore5: 3.0
    },
    {
      nameHangul: "사아",
      sajuScore5: 4.5,
      engineScore01: 0.90,
      soundScore5: 4.0
    }
  ];

  const sorted = sortPremiumItems(items);
  assert.deepEqual(
    sorted.map((item) => item.nameHangul),
    ["가라", "사아", "마바", "다나"],
    "정렬 우선순위는 saju > engine > sound 여야 합니다."
  );
}

function runPremiumQualityMetricTests(): void {
  const items: PremiumSortItem[] = [
    { nameHangul: "가나", sajuScore5: 2.0, engineScore01: 0.9, soundScore5: 4.5 },
    { nameHangul: "다라", sajuScore5: 0.0, engineScore01: 0.8, soundScore5: 4.0 },
    { nameHangul: "마바", sajuScore5: 3.5, engineScore01: 0.7, soundScore5: 3.5 },
    { nameHangul: "사아", sajuScore5: 0.0, engineScore01: 0.6, soundScore5: 3.0 },
    { nameHangul: "자차", sajuScore5: 1.5, engineScore01: 0.5, soundScore5: 2.5 }
  ];

  const summary = summarizePremiumQuality(items);
  assert.equal(summary.top1SajuScore5, 2.0, "top1 사주점수는 첫 후보 기준이어야 합니다.");
  assert.equal(summary.top5AvgSajuScore5, 1.4, "top5 평균 사주점수를 계산해야 합니다.");
  assert.equal(summary.top20ZeroSajuRatio, 0.4, "top20 내 0점 비율을 계산해야 합니다.");
  assert.equal(summary.top20HighSaju35Count, 1, "top20 내 3.5점 이상 개수를 계산해야 합니다.");
}

function runAdaptiveExpansionGateTests(): void {
  const weakQuality = {
    top1SajuScore5: 2.0,
    top5AvgSajuScore5: 1.4,
    top20ZeroSajuRatio: 0.6,
    top20HighSaju35Count: 0,
    topCount: 20,
    top5Count: 5
  };
  const strongQuality = {
    top1SajuScore5: 4.0,
    top5AvgSajuScore5: 3.5,
    top20ZeroSajuRatio: 0.1,
    top20HighSaju35Count: 6,
    topCount: 20,
    top5Count: 5
  };

  assert.equal(
    shouldExpandPremiumPool({
      mode: "IMPROVE",
      preDiversity: weakQuality,
      elapsedMs: 120
    }),
    true,
    "IMPROVE 모드에서 품질 게이트 미달이고 예산 이내면 추가 탐색을 켜야 합니다."
  );
  assert.equal(
    shouldExpandPremiumPool({
      mode: "HARMONY",
      preDiversity: weakQuality,
      elapsedMs: 120
    }),
    false,
    "HARMONY 모드는 사주 보완 부족 게이트로 추가 탐색을 켜지 않아야 합니다."
  );
  assert.equal(
    shouldExpandPremiumPool({
      mode: "IMPROVE",
      preDiversity: weakQuality,
      elapsedMs: 600
    }),
    false,
    "예산을 이미 초과했으면 추가 탐색을 켜지 않아야 합니다."
  );
  assert.equal(
    shouldExpandPremiumPool({
      mode: "IMPROVE",
      preDiversity: strongQuality,
      elapsedMs: 120
    }),
    false,
    "품질이 충분하면 추가 탐색을 켜지 않아야 합니다."
  );
}

function runHighSajuQuotaSelectionTests(): void {
  const lows: PremiumSortItem[] = Array.from({ length: 12 }, (_, index) => ({
    nameHangul: `${String.fromCharCode(0xac00 + index)}${String.fromCharCode(0xb098 + index)}`,
    sajuScore5: 1.5,
    engineScore01: 0.95 - index * 0.01,
    soundScore5: 4.5
  }));
  const highs: PremiumSortItem[] = [
    { nameHangul: "하나", sajuScore5: 3.5, sajuScoreRaw5: 3.26, engineScore01: 0.10, soundScore5: 2.5 },
    { nameHangul: "하늘", sajuScore5: 3.5, sajuScoreRaw5: 3.31, engineScore01: 0.11, soundScore5: 2.5 },
    { nameHangul: "하람", sajuScore5: 3.5, sajuScoreRaw5: 3.41, engineScore01: 0.12, soundScore5: 2.5 },
    { nameHangul: "하린", sajuScore5: 3.5, sajuScoreRaw5: 3.55, engineScore01: 0.13, soundScore5: 2.5 },
    { nameHangul: "하윤", sajuScore5: 4.0, sajuScoreRaw5: 3.76, engineScore01: 0.14, soundScore5: 2.5 },
    { nameHangul: "하준", sajuScore5: 4.0, sajuScoreRaw5: 3.88, engineScore01: 0.15, soundScore5: 2.5 }
  ];

  // Intentionally pass a low-first order to verify quota injection behavior.
  const selected = selectPremiumTopWithHighSajuQuota([...lows, ...highs], {
    limit: 10,
    minHighSajuCount: 4,
    targetHighSajuCount: 6,
    highSajuRawThreshold5: 3.25
  });

  const highCount = selected.filter((item) => (item.sajuScoreRaw5 ?? item.sajuScore5) >= 3.25).length;
  assert.equal(selected.length, 10, "최종 선발 개수는 limit을 따라야 합니다.");
  assert.ok(highCount >= 4, "topN에 고사주 후보 최소 개수를 확보해야 합니다.");
}

function runAllZeroRawDetectionTests(): void {
  const allZero: PremiumSortItem[] = Array.from({ length: 20 }, (_, index) => ({
    nameHangul: `가${String.fromCharCode(0xb098 + index)}`,
    sajuScore5: 0,
    sajuScoreRaw5: 0,
    engineScore01: 0.8 - index * 0.01,
    soundScore5: 3
  }));
  const mixed: PremiumSortItem[] = [
    ...allZero.slice(0, 19),
    {
      nameHangul: "하나",
      sajuScore5: 0,
      sajuScoreRaw5: 0.12,
      engineScore01: 0.1,
      soundScore5: 2
    }
  ];

  assert.equal(
    isTopRawSajuAllZero(allZero, 20),
    true,
    "topN raw 사주점수가 모두 0이면 all-zero로 감지해야 합니다."
  );
  assert.equal(
    isTopRawSajuAllZero(mixed, 20),
    false,
    "topN raw 사주점수에 양수가 하나라도 있으면 all-zero가 아닙니다."
  );
}

function runRescueExploreSeedGenerationTests(): void {
  const seeds = buildPremiumRescueExploreSeeds(12345, 3);
  assert.equal(seeds.length, 3, "요청한 개수만큼 rescue seed를 생성해야 합니다.");
  assert.equal(new Set(seeds).size, 3, "rescue seed는 중복되면 안 됩니다.");
  assert.ok(seeds.every((seed) => Number.isInteger(seed) && seed > 0), "seed는 양의 정수여야 합니다.");
  assert.ok(!seeds.includes(12345), "기존 exploreSeed와 동일한 값은 제외해야 합니다.");
}

function run(): void {
  runInputParsingTests();
  runSortingTests();
  runPremiumQualityMetricTests();
  runAdaptiveExpansionGateTests();
  runHighSajuQuotaSelectionTests();
  runAllZeroRawDetectionTests();
  runRescueExploreSeedGenerationTests();
  console.log("[test:premium:service] all tests passed");
}

run();
