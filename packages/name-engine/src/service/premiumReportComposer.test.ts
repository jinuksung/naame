import assert from "node:assert/strict";
import {
  composePremiumReport,
  countPremiumReportPhrases,
} from "./premiumReportComposer";

function testPhraseCatalogCount(): void {
  assert.equal(
    countPremiumReportPhrases(),
    240,
    "프리미엄 상세 리포트 문구 풀은 240개여야 합니다.",
  );
}

function testComposedReportHasFiveAgeBandsWithTwoLines(): void {
  const report = composePremiumReport({
    displayName: "김하윤",
    weakTop3: ["WATER", "WOOD", "EARTH"],
    strongTop1: "FIRE",
    oneLineSummary: "일간이 기토이며 수 기운이 상대적으로 부족해요.",
    why: [
      "수 기운 보완에 도움 되는 구성입니다.",
      "발음 흐름이 안정적입니다.",
      "한자 의미가 긍정적입니다.",
    ],
    seed: 17,
  });

  assert.ok(report.summary.length > 0, "리포트 요약 문장은 비어있지 않아야 합니다.");
  assert.ok(
    report.bullets.length >= 3,
    "리포트 핵심 근거 불릿은 최소 3개 이상이어야 합니다.",
  );
  assert.equal(report.ageBands.length, 5, "연령대 해석은 5구간이어야 합니다.");
  assert.equal(
    report.ageBands.every((band) => band.lines.length === 2),
    true,
    "연령대 해석은 구간당 2문장이어야 합니다.",
  );
}

function run(): void {
  testPhraseCatalogCount();
  testComposedReportHasFiveAgeBandsWithTwoLines();
  console.log("[test:premium-report-composer] all tests passed");
}

run();
