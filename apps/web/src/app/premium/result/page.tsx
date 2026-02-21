"use client";

import { useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Card, PrimaryButton, Screen } from "@/components/ui";
import { usePremiumRecommendStore } from "@/store/usePremiumRecommendStore";
import { PremiumRecommendResultItem, RecommendElement } from "@/types/recommend";

const ELEMENT_LABELS_KO: Record<RecommendElement, string> = {
  WOOD: "목",
  FIRE: "화",
  EARTH: "토",
  METAL: "금",
  WATER: "수"
};

const STATUS_LABELS_KO = {
  VERY_LOW: "매우 부족",
  LOW: "부족",
  BALANCED: "균형",
  HIGH: "강함",
  VERY_HIGH: "매우 강함"
} as const;

function buildNameKey(item: Pick<PremiumRecommendResultItem, "nameHangul" | "hanjaPair">): string {
  return `${item.nameHangul}:${item.hanjaPair[0]}${item.hanjaPair[1]}`;
}

function toElementKo(element: RecommendElement): string {
  return ELEMENT_LABELS_KO[element] ?? element;
}

export default function PremiumResultPage(): JSX.Element {
  const router = useRouter();
  const summary = usePremiumRecommendStore((state) => state.summary);
  const results = usePremiumRecommendStore((state) => state.results);
  const reset = usePremiumRecommendStore((state) => state.reset);

  useEffect(() => {
    if (!summary) {
      router.replace("/premium");
    }
  }, [router, summary]);

  const top20 = useMemo(() => results.slice(0, 20), [results]);

  if (!summary) {
    return <></>;
  }

  return (
    <Screen title="프리미엄 추천 결과" description="사주 점수를 우선으로 정렬했습니다.">
      <section className="nf-premium-summary">
        <div className="nf-premium-summary-head">
          <h2 className="nf-premium-summary-title">4주8자</h2>
          {!summary.hasHourPillar ? (
            <span className="nf-premium-badge">시주 미반영</span>
          ) : null}
        </div>
        <div className="nf-premium-pillars">
          <span className="nf-premium-pillar">년주 {summary.pillars.year.hangul}</span>
          <span className="nf-premium-pillar">월주 {summary.pillars.month.hangul}</span>
          <span className="nf-premium-pillar">일주 {summary.pillars.day.hangul}</span>
          {summary.pillars.hour ? (
            <span className="nf-premium-pillar">시주 {summary.pillars.hour.hangul}</span>
          ) : null}
        </div>

        <p className="nf-premium-summary-line">{summary.oneLineSummary}</p>
        <p className="nf-premium-weak">
          부족 TOP2: {summary.weakTop2.map((element) => toElementKo(element)).join(" / ")}
        </p>

        <ul className="nf-premium-dist-list">
          {summary.distStatus.map((item) => {
            const isWeak = summary.weakTop2.includes(item.element);
            return (
              <li
                key={item.element}
                className={`nf-premium-dist-item${isWeak ? " is-weak" : ""}`}
              >
                <span className="nf-premium-dist-element">{toElementKo(item.element)}</span>
                <span className="nf-premium-dist-percent">{item.percent.toFixed(1)}%</span>
                <span className="nf-premium-dist-status">
                  {STATUS_LABELS_KO[item.status]}
                </span>
              </li>
            );
          })}
        </ul>
      </section>

      <p className="nf-premium-notice">
        추천 정렬은 사주 점수 기준이며 발음 점수는 참고용입니다.
      </p>

      {top20.length === 0 ? (
        <div className="nf-result-actions">
          <p className="nf-description">추천 결과가 비어 있어요. 다시 시도해 주세요.</p>
          <PrimaryButton
            onClick={() => {
              router.replace("/premium/loading");
            }}
          >
            다시 분석하기
          </PrimaryButton>
        </div>
      ) : (
        <section className="nf-result-list">
          {top20.map((item) => (
            <Card key={buildNameKey(item)}>
              <div className="nf-premium-card-head">
                <strong className="nf-pron-emphasis">{item.nameHangul}</strong>
                <span className="nf-score-chip">#{item.rank}</span>
              </div>
              <p className="nf-premium-hanja">
                {item.hanjaPair[0]}({item.readingPair[0]}) · {item.hanjaPair[1]}({item.readingPair[1]})
              </p>
              <p className="nf-premium-star">사주 보완 ⭐ {item.sajuScore5.toFixed(1)}</p>
              <p className="nf-premium-star">발음 조화 ⭐ {item.soundScore5.toFixed(1)}</p>
              <ul className="nf-reason-list">
                {item.why.slice(0, 2).map((reason, index) => (
                  <li key={`${buildNameKey(item)}-${index}`}>{reason}</li>
                ))}
              </ul>
            </Card>
          ))}
        </section>
      )}

      <p className="nf-premium-free-note">현재 한시적 무료로 제공 중입니다.</p>

      <div className="nf-result-actions">
        <PrimaryButton
          onClick={() => {
            reset();
            router.replace("/premium");
          }}
        >
          다시 입력
        </PrimaryButton>
      </div>
    </Screen>
  );
}
