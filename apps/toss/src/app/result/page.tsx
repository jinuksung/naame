"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  TdsCard,
  TdsPrimaryButton,
  TdsScreen,
  TdsSecondaryButton,
} from "@/components/tds";
import {
  fetchFreeRecommendations,
  fetchSurnameHanjaOptions,
  submitNameFeedback,
} from "@/lib/api";
import { syncFeedbackStatus, syncFeedbackVote } from "@/lib/feedbackState";
import {
  buildQuickExploreSeed,
  buildQuickSurnameCandidates,
  isQuickComboEnabled,
  pickPreferredSurnameHanja,
} from "@/lib/quickCombo";
import { genderOptions, useRecommendStore } from "@/store/useRecommendStore";
import type { FreeRecommendInput, FreeRecommendResultItem, RecommendGender } from "@/types/recommend";

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
  const setInput = useRecommendStore((state) => state.setInput);
  const setResults = useRecommendStore((state) => state.setResults);
  const reset = useRecommendStore((state) => state.reset);
  const [feedbackStatus, setFeedbackStatus] = useState<Record<string, "idle" | "pending" | "done">>({});
  const [feedbackVote, setFeedbackVote] = useState<Record<string, "like" | "dislike" | undefined>>({});
  const [quickGender, setQuickGender] = useState<RecommendGender>(input.gender);
  const [quickLoadingKey, setQuickLoadingKey] = useState<string | null>(null);
  const [quickError, setQuickError] = useState<string | null>(null);
  const [surnameHanjaCache, setSurnameHanjaCache] = useState<Record<string, string>>({});
  const quickExploreCounterRef = useRef(0);

  const hasInput =
    input.surnameHangul.trim().length > 0 &&
    input.surnameHanja.trim().length > 0 &&
    input.birth.date.length > 0;

  useEffect(() => {
    if (!hasInput) {
      router.replace("/");
    }
  }, [hasInput, router]);

  const top5 = useMemo(() => results.slice(0, 5), [results]);
  const top5Keys = useMemo(() => top5.map((item) => buildNameKey(item)), [top5]);
  const quickSurnames = useMemo(
    () => buildQuickSurnameCandidates(input.surnameHangul),
    [input.surnameHangul],
  );
  const isQuickLoading = quickLoadingKey !== null;
  const quickComboEnabled = isQuickComboEnabled();

  useEffect(() => {
    setFeedbackStatus((prev) => syncFeedbackStatus(prev, top5Keys));
    setFeedbackVote((prev) => syncFeedbackVote(prev, top5Keys));
  }, [top5Keys]);

  useEffect(() => {
    setQuickGender(input.gender);
  }, [input.gender]);

  useEffect(() => {
    const surnameHangul = input.surnameHangul.trim();
    const surnameHanja = input.surnameHanja.trim();
    if (!surnameHangul || !surnameHanja) {
      return;
    }
    setSurnameHanjaCache((prev) => {
      if (prev[surnameHangul] === surnameHanja) {
        return prev;
      }
      return {
        ...prev,
        [surnameHangul]: surnameHanja,
      };
    });
  }, [input.surnameHangul, input.surnameHanja]);

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
        surnameHangul: input.surnameHangul,
        surnameHanja: input.surnameHanja,
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

  const handleQuickComboClick = async (surnameHangul: string): Promise<void> => {
    const normalizedSurname = surnameHangul.trim();
    if (!normalizedSurname || isQuickLoading) {
      return;
    }

    const nextComboKey = `${normalizedSurname}:${quickGender}`;
    setQuickError(null);
    setQuickLoadingKey(nextComboKey);

    try {
      const cachedHanja = surnameHanjaCache[normalizedSurname];
      let surnameHanja = cachedHanja;
      if (!surnameHanja) {
        const optionsResponse = await fetchSurnameHanjaOptions(normalizedSurname);
        surnameHanja = pickPreferredSurnameHanja(optionsResponse);
        if (!surnameHanja) {
          throw new Error("해당 성씨의 한자를 찾지 못했습니다.");
        }
        setSurnameHanjaCache((prev) => ({
          ...prev,
          [normalizedSurname]: surnameHanja,
        }));
      }

      const nextInput: FreeRecommendInput = {
        surnameHangul: normalizedSurname,
        surnameHanja,
        birth: {
          calendar: "SOLAR",
          date: input.birth.date,
          ...(input.birth.time ? { time: input.birth.time } : {}),
        },
        gender: quickGender,
        exploreSeed: buildQuickExploreSeed((quickExploreCounterRef.current += 1)),
      };
      const response = await fetchFreeRecommendations(nextInput);
      setInput(nextInput);
      setResults(response.results);
      setFeedbackStatus({});
      setFeedbackVote({});
    } catch (error) {
      console.error("[result] quick combo failed", error);
      setQuickError("조합 추천을 불러오지 못했어요. 다시 시도해 주세요.");
    } finally {
      setQuickLoadingKey(null);
    }
  };

  return (
    <TdsScreen
      title="추천 이름 TOP 5"
      description="입력하신 정보를 바탕으로 선별했습니다"
    >
      {top5.length === 0 ? (
        <div className="result-actions">
          <p className="tds-description">
            추천 결과가 비어 있어요. 다시 시도해 주세요.
          </p>
          <TdsPrimaryButton
            onClick={() => {
              router.replace("/loading");
            }}
          >
            다시 추천받기
          </TdsPrimaryButton>
        </div>
      ) : (
        <>
          {quickComboEnabled ? (
            <section className="quick-combo">
              <div className="quick-combo-head">
                <h3 className="quick-combo-title">빠른 조합 보기</h3>
                <p className="quick-combo-description">
                  성씨와 성별만 바꿔서 결과를 빠르게 넘겨보고, 안 예쁜 이름은 바로 싫어요를 눌러 정리하세요.
                </p>
              </div>
              <div className="quick-gender-row" role="tablist" aria-label="빠른 조합 성별">
                {genderOptions.map((option) => (
                  <button
                    key={`quick-gender-${option.value}`}
                    type="button"
                    role="tab"
                    aria-selected={quickGender === option.value}
                    disabled={isQuickLoading}
                    className={`quick-gender-btn${quickGender === option.value ? " is-selected" : ""}`}
                    onClick={() => {
                      setQuickGender(option.value);
                    }}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
              <div className="quick-surname-row">
                {quickSurnames.map((surname) => {
                  const comboKey = `${surname}:${quickGender}`;
                  const isSelected = surname === input.surnameHangul.trim() && quickGender === input.gender;
                  const isLoadingThis = quickLoadingKey === comboKey;
                  return (
                    <button
                      key={comboKey}
                      type="button"
                      disabled={isQuickLoading}
                      className={`quick-surname-btn${isSelected ? " is-selected" : ""}`}
                      onClick={() => {
                        void handleQuickComboClick(surname);
                      }}
                    >
                      {surname}
                      {isLoadingThis ? "…" : ""}
                    </button>
                  );
                })}
              </div>
              <p className={`quick-status${quickError ? " is-error" : ""}`}>
                {quickError ?? "자주 쓰는 성씨 조합을 한 번에 비교할 수 있어요."}
              </p>
            </section>
          ) : null}

          <section className="result-list">
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
                <TdsCard
                  key={`${item.nameHangul}-${item.hanjaPair.join("")}-${index}`}
                >
                  <div className="result-header-row">
                    <span className="score-chip">
                      추천 적합도 {displayScore(item.score)}
                    </span>
                  </div>
                  <p className="pron-emphasis">{pronunciation}</p>
                  <ul className="hanja-detail-list">
                    {hanjaDetails.map((detail, detailIndex) => (
                      <li
                        key={`${detail.hanja}-${detail.reading}-${detailIndex}`}
                        className="hanja-detail-item"
                      >
                        <span className="hanja-char">{detail.hanja}</span>
                        <span className="hanja-reading">{detail.reading}</span>
                        <span className="hanja-meaning">{detail.meaning}</span>
                      </li>
                    ))}
                  </ul>
                  <ul className="reason-list">
                    {item.reasons.slice(0, 3).map((reason, reasonIndex) => (
                      <li key={`${reason}-${reasonIndex}`}>{reason}</li>
                    ))}
                  </ul>
                  <div className="feedback-row">
                    <button
                      type="button"
                      className={`feedback-btn${feedbackVote[itemKey] === "like" ? " is-selected" : ""}`}
                      disabled={feedbackStatus[itemKey] === "pending" || feedbackStatus[itemKey] === "done"}
                      onClick={() => {
                        void handleFeedbackClick(item, "like");
                      }}
                    >
                      좋아요
                    </button>
                    <button
                      type="button"
                      className={`feedback-btn${feedbackVote[itemKey] === "dislike" ? " is-selected" : ""}`}
                      disabled={feedbackStatus[itemKey] === "pending" || feedbackStatus[itemKey] === "done"}
                      onClick={() => {
                        void handleFeedbackClick(item, "dislike");
                      }}
                    >
                      싫어요
                    </button>
                  </div>
                </TdsCard>
              );
            })}
          </section>

          <section className="premium-teaser">
            <h3 className="premium-title">🔒 더 많은 기능을 준비 중이에요</h3>
            <ul className="premium-list">
              <li>좋은 이름 후보 더 보기</li>
              <li>출생 정보 반영한 세부 분석</li>
              <li>이름별 의미/오행 리포트</li>
            </ul>
            {/* <div className="result-actions">
              <TdsPrimaryButton
                onClick={() => {
                  console.log("[premium] 자세히 보기 클릭");
                }}
              >
                자세히 보기
              </TdsPrimaryButton>
            </div> */}
          </section>
        </>
      )}

      <div className="result-actions">
        <TdsSecondaryButton
          onClick={() => {
            reset();
            router.replace("/");
          }}
        >
          다시 입력
        </TdsSecondaryButton>
      </div>
    </TdsScreen>
  );
}
