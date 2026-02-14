"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, PrimaryButton, Screen, SecondaryButton } from "@/components/ui";
import { submitNameFeedback } from "@/lib/api";
import { useRecommendStore } from "@/store/useRecommendStore";
import type { FreeRecommendResultItem } from "@/types/recommend";

function displayScore(score: unknown): string {
  if (typeof score === "number" && Number.isFinite(score)) {
    return `${Math.round(score)}%`;
  }
  return "--";
}

function displayMeaning(meaning: string): string {
  const normalized = meaning.trim();
  return normalized.length > 0 ? normalized : "뜻 정보 없음";
}

function buildNameKey(item: Pick<FreeRecommendResultItem, "nameHangul" | "hanjaPair">): string {
  return `${item.nameHangul}:${item.hanjaPair[0]}${item.hanjaPair[1]}`;
}

export default function ResultPage(): JSX.Element {
  const router = useRouter();
  const input = useRecommendStore((state) => state.input);
  const results = useRecommendStore((state) => state.results);
  const reset = useRecommendStore((state) => state.reset);
  const [feedbackStatus, setFeedbackStatus] = useState<Record<string, "idle" | "pending" | "done">>({});
  const [feedbackVote, setFeedbackVote] = useState<Record<string, "like" | "dislike" | undefined>>({});

  const hasInput =
    input.surnameHangul.trim().length > 0 &&
    input.surnameHanja.trim().length > 0 &&
    input.birth.date.length > 0;

  useEffect(() => {
    if (!hasInput) {
      router.replace("/");
    }
  }, [hasInput, router]);

  const top5 = results.slice(0, 5);
  const top5Keys = useMemo(() => top5.map((item) => buildNameKey(item)), [top5]);

  useEffect(() => {
    setFeedbackStatus((prev) => {
      const next: Record<string, "idle" | "pending" | "done"> = {};
      for (const key of top5Keys) {
        next[key] = prev[key] ?? "idle";
      }
      return next;
    });
    setFeedbackVote((prev) => {
      const next: Record<string, "like" | "dislike" | undefined> = {};
      for (const key of top5Keys) {
        next[key] = prev[key];
      }
      return next;
    });
  }, [top5Keys]);

  if (!hasInput) {
    return <></>;
  }

  const handleFeedbackClick = async (
    item: FreeRecommendResultItem,
    vote: "like" | "dislike",
  ): Promise<void> => {
    const key = buildNameKey(item);
    if (feedbackStatus[key] === "pending" || feedbackStatus[key] === "done") {
      return;
    }

    setFeedbackStatus((prev) => ({ ...prev, [key]: "pending" }));
    setFeedbackVote((prev) => ({ ...prev, [key]: vote }));
    try {
      await submitNameFeedback({
        nameHangul: item.nameHangul,
        hanjaPair: item.hanjaPair,
        vote,
      });
      setFeedbackStatus((prev) => ({ ...prev, [key]: "done" }));
    } catch (error) {
      console.error("[result] feedback submit failed", error);
      setFeedbackStatus((prev) => ({ ...prev, [key]: "idle" }));
      setFeedbackVote((prev) => ({ ...prev, [key]: undefined }));
    }
  };

  return (
    <Screen title="추천 이름 TOP 5" description="입력하신 정보를 바탕으로 선별했습니다">
      {top5.length === 0 ? (
        <div className="nf-result-actions">
          <p className="nf-description">추천 결과가 비어 있어요. 다시 시도해 주세요.</p>
          <PrimaryButton
            onClick={() => {
              router.replace("/loading");
            }}
          >
            다시 추천받기
          </PrimaryButton>
        </div>
      ) : (
        <>
          <section className="nf-result-list">
            {top5.map((item, index) => {
              const itemKey = buildNameKey(item);
              const pronunciation = `${input.surnameHangul} ${item.readingPair[0]} ${item.readingPair[1]}`;
              const hanjaDetails = [
                {
                  hanja: item.hanjaPair[0],
                  reading: item.readingPair[0],
                  meaning: displayMeaning(item.meaningKwPair[0])
                },
                {
                  hanja: item.hanjaPair[1],
                  reading: item.readingPair[1],
                  meaning: displayMeaning(item.meaningKwPair[1])
                }
              ];

              return (
                <Card key={`${item.nameHangul}-${item.hanjaPair.join("")}-${index}`}>
                  <div className="nf-result-header-row">
                    <span className="nf-score-chip">추천 적합도 {displayScore(item.score)}</span>
                  </div>
                  <p className="nf-pron-emphasis">{pronunciation}</p>
                  <ul className="nf-hanja-detail-list">
                    {hanjaDetails.map((detail, detailIndex) => (
                      <li
                        key={`${detail.hanja}-${detail.reading}-${detailIndex}`}
                        className="nf-hanja-detail-item"
                      >
                        <span className="nf-hanja-char">{detail.hanja}</span>
                        <span className="nf-hanja-reading">{detail.reading}</span>
                        <span className="nf-hanja-meaning">{detail.meaning}</span>
                      </li>
                    ))}
                  </ul>
                  <ul className="nf-reason-list">
                    {item.reasons.slice(0, 3).map((reason, reasonIndex) => (
                      <li key={`${reason}-${reasonIndex}`}>{reason}</li>
                    ))}
                  </ul>
                  <div className="nf-feedback-row">
                    <button
                      type="button"
                      className={`nf-feedback-btn${feedbackVote[itemKey] === "like" ? " is-selected" : ""}`}
                      disabled={feedbackStatus[itemKey] === "pending" || feedbackStatus[itemKey] === "done"}
                      onClick={() => {
                        void handleFeedbackClick(item, "like");
                      }}
                    >
                      좋아요
                    </button>
                    <button
                      type="button"
                      className={`nf-feedback-btn${feedbackVote[itemKey] === "dislike" ? " is-selected" : ""}`}
                      disabled={feedbackStatus[itemKey] === "pending" || feedbackStatus[itemKey] === "done"}
                      onClick={() => {
                        void handleFeedbackClick(item, "dislike");
                      }}
                    >
                      싫어요
                    </button>
                  </div>
                </Card>
              );
            })}
          </section>

          <section className="nf-premium-teaser">
            <h3 className="nf-premium-title">더 많은 기능을 준비 중이에요</h3>
            <ul className="nf-premium-list">
              <li>좋은 이름 후보 더 보기</li>
              <li>출생 정보 반영한 세부 분석</li>
              <li>이름별 의미/오행 리포트</li>
            </ul>
          </section>
        </>
      )}

      <div className="nf-result-actions">
        <SecondaryButton
          onClick={() => {
            reset();
            router.replace("/");
          }}
        >
          다시 입력
        </SecondaryButton>
      </div>
    </Screen>
  );
}
