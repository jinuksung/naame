import type {
  PremiumAgeBandReport,
  PremiumNameReport,
  PremiumRecommendResultItem,
} from "../types/recommend";

function normalizeHalf(value: number): number {
  if (!Number.isFinite(value)) {
    return 0;
  }
  const clamped = Math.max(0, Math.min(5, value));
  return Math.round(clamped * 2) / 2;
}

export function sanitizePremiumResults(
  results: PremiumRecommendResultItem[]
): PremiumRecommendResultItem[] {
  return results.slice(0, 5).map((item, index) => ({
    ...item,
    rank: Number.isFinite(item.rank) ? item.rank : index + 1,
    sajuScore5: normalizeHalf(item.sajuScore5),
    soundScore5: normalizeHalf(item.soundScore5),
    engineScore01: Math.max(0, Math.min(1, item.engineScore01)),
    why: Array.isArray(item.why) && item.why.length > 0 ? item.why : ["추천 이유를 계산 중입니다."],
    report: normalizeReport(item.report, item.why)
  }));
}

function createFallbackAgeBands(): PremiumAgeBandReport[] {
  return [
    { key: "0-19", label: "0~19세", lines: ["기초를 다지는 구간입니다.", "리듬을 천천히 익혀 가세요."] },
    { key: "20-39", label: "20~39세", lines: ["진로와 실행이 함께 커지는 구간입니다.", "속도보다 방향을 먼저 맞추세요."] },
    { key: "40-59", label: "40~59세", lines: ["역할과 책임이 확장되는 구간입니다.", "과한 확장보다 균형을 지키세요."] },
    { key: "60-79", label: "60~79세", lines: ["성과를 정리하며 흐름을 안정시키는 구간입니다.", "무리한 소모를 줄이면 좋습니다."] },
    { key: "80-100", label: "80~100세", lines: ["생활의 온도와 안정이 중요한 구간입니다.", "편안한 리듬을 유지해 보세요."] }
  ];
}

function normalizeReport(
  report: PremiumNameReport | undefined,
  why: string[],
): PremiumNameReport {
  if (report && Array.isArray(report.ageBands) && report.ageBands.length === 5) {
    return report;
  }

  return {
    summary: "상세 리포트를 준비하고 있어요.",
    bullets: Array.isArray(why) && why.length > 0 ? why.slice(0, 3) : ["추천 이유를 정리하고 있어요."],
    ageBands: createFallbackAgeBands()
  };
}
