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
  addNameBlockSyllableRule,
  addNameToBlacklist,
  fetchFreeRecommendations,
  fetchSurnameHanjaOptions,
  markHanjaAsNotInmyong,
  submitNameFeedback,
} from "@/lib/api";
import { syncFeedbackStatus, syncFeedbackVote } from "@/lib/feedbackState";
import { isLocalAdminToolsEnabled } from "@namefit/engine/lib/localAdminVisibility";
import {
  buildQuickExploreSeed,
  buildQuickSurnameCandidates,
  isQuickComboEnabled,
  pickPreferredSurnameHanja,
} from "@/lib/quickCombo";
import { genderOptions, useRecommendStore } from "@/store/useRecommendStore";
import type {
  FreeRecommendInput,
  FreeRecommendResultItem,
  RecommendGender,
} from "@/types/recommend";

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

function buildNameKey(
  item: Pick<FreeRecommendResultItem, "nameHangul" | "hanjaPair">,
): string {
  return `${item.nameHangul}:${item.hanjaPair[0]}${item.hanjaPair[1]}`;
}

function splitReasonLabel(reason: string): { label: string; body: string } {
  const delimiterIndex = reason.indexOf(":");
  if (delimiterIndex < 0) {
    return { label: "", body: reason.trim() };
  }

  const label = reason.slice(0, delimiterIndex).trim();
  const body = reason.slice(delimiterIndex + 1).trim();
  return { label, body };
}

function ThumbUpIcon(): JSX.Element {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className="feedback-icon"
      aria-hidden="true"
      focusable="false"
    >
      <path
        d="M7 11v9M7 20H4a1 1 0 0 1-1-1v-6a1 1 0 0 1 1-1h3m0 8h8.36a2 2 0 0 0 1.96-1.62l1.2-6A2 2 0 0 0 16.56 10H13V6.5A2.5 2.5 0 0 0 10.5 4L7 11Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ThumbDownIcon(): JSX.Element {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className="feedback-icon"
      aria-hidden="true"
      focusable="false"
    >
      <path
        d="M7 13V4M7 4H4a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h3m0-8h8.36a2 2 0 0 1 1.96 1.62l1.2 6A2 2 0 0 1 16.56 14H13v3.5A2.5 2.5 0 0 1 10.5 20L7 13Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function ResultPage(): JSX.Element {
  const router = useRouter();
  const input = useRecommendStore((state) => state.input);
  const results = useRecommendStore((state) => state.results);
  const hasHydrated = useRecommendStore((state) => state.hasHydrated);
  const setInput = useRecommendStore((state) => state.setInput);
  const setResults = useRecommendStore((state) => state.setResults);
  const reset = useRecommendStore((state) => state.reset);
  const [feedbackStatus, setFeedbackStatus] = useState<
    Record<string, "idle" | "pending" | "done">
  >({});
  const [feedbackVote, setFeedbackVote] = useState<
    Record<string, "like" | "dislike" | undefined>
  >({});
  const [quickGender, setQuickGender] = useState<RecommendGender>(input.gender);
  const [quickLoadingKey, setQuickLoadingKey] = useState<string | null>(null);
  const [quickError, setQuickError] = useState<string | null>(null);
  const [surnameHanjaCache, setSurnameHanjaCache] = useState<
    Record<string, string>
  >({});
  const [localAdminEnabled, setLocalAdminEnabled] = useState(false);
  const [hanjaActionStatus, setHanjaActionStatus] = useState<
    Record<string, "idle" | "pending" | "done" | "error">
  >({});
  const [nameActionStatus, setNameActionStatus] = useState<
    Record<string, "idle" | "pending" | "done" | "error">
  >({});
  const [syllableRuleActionStatus, setSyllableRuleActionStatus] = useState<
    Record<string, "idle" | "pending" | "done" | "error">
  >({});
  const quickExploreCounterRef = useRef(0);

  const hasInput =
    input.surnameHangul.trim().length > 0 &&
    input.surnameHanja.trim().length > 0;

  useEffect(() => {
    if (!hasHydrated) {
      return;
    }

    if (!hasInput) {
      router.replace("/feature/recommend");
    }
  }, [hasHydrated, hasInput, router]);

  const top5 = useMemo(() => results.slice(0, 5), [results]);
  const top5Keys = useMemo(
    () => top5.map((item) => buildNameKey(item)),
    [top5],
  );
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

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }
    setLocalAdminEnabled(
      isLocalAdminToolsEnabled({
        hostname: window.location.hostname,
      }),
    );
  }, []);

  if (!hasHydrated || !hasInput) {
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

  const handleQuickComboClick = async (
    surnameHangul: string,
  ): Promise<void> => {
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
        const optionsResponse =
          await fetchSurnameHanjaOptions(normalizedSurname);
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
        gender: quickGender,
        exploreSeed: buildQuickExploreSeed(
          (quickExploreCounterRef.current += 1),
        ),
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

  const handleSetNotInmyong = async (hanjaChar: string): Promise<void> => {
    const key = hanjaChar.trim();
    if (!key) {
      return;
    }
    if (hanjaActionStatus[key] === "pending" || hanjaActionStatus[key] === "done") {
      return;
    }
    setHanjaActionStatus((prev) => ({ ...prev, [key]: "pending" }));
    try {
      await markHanjaAsNotInmyong(key);
      setHanjaActionStatus((prev) => ({ ...prev, [key]: "done" }));
    } catch (error) {
      console.error("[result] mark not-inmyong failed", error);
      setHanjaActionStatus((prev) => ({ ...prev, [key]: "error" }));
    }
  };

  const handleBlacklistName = async (
    item: Pick<FreeRecommendResultItem, "nameHangul" | "hanjaPair">,
  ): Promise<void> => {
    const key = buildNameKey(item);
    if (nameActionStatus[key] === "pending" || nameActionStatus[key] === "done") {
      return;
    }
    setNameActionStatus((prev) => ({ ...prev, [key]: "pending" }));
    try {
      await addNameToBlacklist(item.nameHangul);
      setNameActionStatus((prev) => ({ ...prev, [key]: "done" }));
    } catch (error) {
      console.error("[result] blacklist update failed", error);
      setNameActionStatus((prev) => ({ ...prev, [key]: "error" }));
    }
  };

  const handleAddSyllableRule = async (
    item: Pick<FreeRecommendResultItem, "nameHangul" | "hanjaPair">,
  ): Promise<void> => {
    const key = buildNameKey(item);
    if (
      syllableRuleActionStatus[key] === "pending" ||
      syllableRuleActionStatus[key] === "done"
    ) {
      return;
    }
    setSyllableRuleActionStatus((prev) => ({ ...prev, [key]: "pending" }));
    try {
      await addNameBlockSyllableRule(item.nameHangul);
      setSyllableRuleActionStatus((prev) => ({ ...prev, [key]: "done" }));
    } catch (error) {
      console.error("[result] syllable-rule update failed", error);
      setSyllableRuleActionStatus((prev) => ({ ...prev, [key]: "error" }));
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
                  성씨와 이름 느낌만 바꿔서 결과를 빠르게 넘겨보고, 안 예쁜 이름은
                  바로 싫어요를 눌러 정리하세요.
                </p>
              </div>
              <div
                className="quick-gender-row"
                role="tablist"
                aria-label="빠른 조합 이름 느낌"
              >
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
                  const isSelected =
                    surname === input.surnameHangul.trim() &&
                    quickGender === input.gender;
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
                {quickError ??
                  "자주 쓰는 성씨 조합을 한 번에 비교할 수 있어요."}
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
                  meaning: displayMeaning(item.meaningKwPair[0]),
                },
                {
                  hanja: item.hanjaPair[1],
                  reading: item.readingPair[1],
                  meaning: displayMeaning(item.meaningKwPair[1]),
                },
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
                        {localAdminEnabled ? (
                          <button
                            type="button"
                            className={`local-admin-btn${hanjaActionStatus[detail.hanja] === "done" ? " is-done" : ""}`}
                            disabled={hanjaActionStatus[detail.hanja] === "pending"}
                            onClick={() => {
                              void handleSetNotInmyong(detail.hanja);
                            }}
                          >
                            한자 로컬 관리 · 비인명용 처리
                          </button>
                        ) : null}
                      </li>
                    ))}
                  </ul>
                  <ul className="reason-list">
                    {item.reasons.slice(0, 3).map((reason, reasonIndex) => {
                      const { label, body } = splitReasonLabel(reason);
                      if (!label) {
                        return (
                          <li key={`${reason}-${reasonIndex}`}>{reason}</li>
                        );
                      }

                      return (
                        <li key={`${reason}-${reasonIndex}`}>
                          <strong className="reason-label">{label}:</strong>{" "}
                          {body}
                        </li>
                      );
                    })}
                  </ul>
                  <div className="feedback-row is-split">
                    <button
                      type="button"
                      className={`feedback-btn is-like${feedbackVote[itemKey] === "like" ? " is-selected" : ""}`}
                      disabled={
                        feedbackStatus[itemKey] === "pending" ||
                        feedbackStatus[itemKey] === "done"
                      }
                      onClick={() => {
                        void handleFeedbackClick(item, "like");
                      }}
                    >
                      <span className="feedback-content">
                        <ThumbUpIcon />
                        <span>좋아요</span>
                      </span>
                    </button>
                    <button
                      type="button"
                      className={`feedback-btn is-dislike${feedbackVote[itemKey] === "dislike" ? " is-selected" : ""}`}
                      disabled={
                        feedbackStatus[itemKey] === "pending" ||
                        feedbackStatus[itemKey] === "done"
                      }
                      onClick={() => {
                        void handleFeedbackClick(item, "dislike");
                      }}
                    >
                      <span className="feedback-content">
                        <ThumbDownIcon />
                        <span>싫어요</span>
                      </span>
                    </button>
                  </div>
                  {localAdminEnabled ? (
                    <div className="local-admin-name-row">
                      <button
                        type="button"
                        className={`local-admin-btn${nameActionStatus[itemKey] === "done" ? " is-done" : ""}`}
                        disabled={nameActionStatus[itemKey] === "pending"}
                        onClick={() => {
                          void handleBlacklistName(item);
                        }}
                      >
                        이름 블랙리스트 처리
                      </button>
                      <button
                        type="button"
                        className={`local-admin-btn${
                          syllableRuleActionStatus[itemKey] === "done"
                            ? " is-done"
                            : syllableRuleActionStatus[itemKey] === "error"
                              ? " is-error"
                              : ""
                        }`}
                        disabled={syllableRuleActionStatus[itemKey] === "pending"}
                        onClick={() => {
                          void handleAddSyllableRule(item);
                        }}
                      >
                        음절패턴 차단
                      </button>
                    </div>
                  ) : null}
                </TdsCard>
              );
            })}
          </section>

          <section className="tds-premium-teaser">
            <h3 className="tds-premium-title">유료 모드도 곧 오픈해요 ✨</h3>
            <ul className="tds-premium-list">
              <li>추천 이름 수를 20개로 확대</li>
              <li>사주를 반영한 맞춤 결과 제공</li>
              <li>이름 의미 심층 분석 리포트 제공</li>
              <li>동일 이름의 다양한 한자 조합 제공</li>
            </ul>
          </section>
        </>
      )}

      <div className="result-actions">
        <TdsSecondaryButton
          onClick={() => {
            reset();
            router.replace("/feature/recommend");
          }}
        >
          다시 입력
        </TdsSecondaryButton>
      </div>
    </TdsScreen>
  );
}
