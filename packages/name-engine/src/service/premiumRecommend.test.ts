import assert from "node:assert/strict";
import {
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

function run(): void {
  runInputParsingTests();
  runSortingTests();
  console.log("[test:premium:service] all tests passed");
}

run();
