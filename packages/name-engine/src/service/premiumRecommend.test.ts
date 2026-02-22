import assert from "node:assert/strict";
import {
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
}

function runAdaptiveExpansionGateTests(): void {
  const weakQuality = {
    top1SajuScore5: 2.0,
    top5AvgSajuScore5: 1.4,
    top20ZeroSajuRatio: 0.6,
    topCount: 20,
    top5Count: 5
  };
  const strongQuality = {
    top1SajuScore5: 4.0,
    top5AvgSajuScore5: 3.5,
    top20ZeroSajuRatio: 0.1,
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

function run(): void {
  runInputParsingTests();
  runSortingTests();
  runPremiumQualityMetricTests();
  runAdaptiveExpansionGateTests();
  console.log("[test:premium:service] all tests passed");
}

run();
