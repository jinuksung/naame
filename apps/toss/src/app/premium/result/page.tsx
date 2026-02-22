"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { TdsCard, TdsPrimaryButton, TdsScreen } from "@/components/tds";
import {
  addNameBlockSyllableRule,
  addNameToBlacklist,
  fetchPremiumRecommendations,
  markHanjaAsNotInmyong,
  submitNameFeedback
} from "@/lib/api";
import { syncFeedbackStatus, syncFeedbackVote } from "@/lib/feedbackState";
import {
  buildLocalQuickPremiumPayload,
  resolvePremiumLoadingPath
} from "@/lib/localQuickPremium";
import { isLocalAdminToolsEnabled } from "@namefit/engine/lib/localAdminVisibility";
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

function displayMeaning(meaning: string): string {
  const normalized = meaning.trim();
  return normalized.length > 0 ? normalized : "뜻 정보 없음";
}

function buildNameKey(item: Pick<PremiumRecommendResultItem, "nameHangul" | "hanjaPair">): string {
  return `${item.nameHangul}:${item.hanjaPair[0]}${item.hanjaPair[1]}`;
}

function toElementKo(element: RecommendElement): string {
  return ELEMENT_LABELS_KO[element] ?? element;
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

export default function PremiumResultPage(): JSX.Element {
  const router = useRouter();
  const input = usePremiumRecommendStore((state) => state.input);
  const surnameHangul = usePremiumRecommendStore((state) => state.surnameHangul);
  const setInput = usePremiumRecommendStore((state) => state.setInput);
  const setStoredSurnameHangul = usePremiumRecommendStore((state) => state.setSurnameHangul);
  const summary = usePremiumRecommendStore((state) => state.summary);
  const results = usePremiumRecommendStore((state) => state.results);
  const setSummary = usePremiumRecommendStore((state) => state.setSummary);
  const setResults = usePremiumRecommendStore((state) => state.setResults);
  const hasHydrated = usePremiumRecommendStore((state) => state.hasHydrated);
  const reset = usePremiumRecommendStore((state) => state.reset);
  const [feedbackStatus, setFeedbackStatus] = useState<
    Record<string, "idle" | "pending" | "done">
  >({});
  const [feedbackVote, setFeedbackVote] = useState<
    Record<string, "like" | "dislike" | undefined>
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
  const [localQuickStatus, setLocalQuickStatus] = useState<"idle" | "pending" | "error">("idle");

  useEffect(() => {
    if (!hasHydrated) {
      return;
    }
    if (!summary) {
      router.replace("/premium");
    }
  }, [hasHydrated, router, summary]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }
    setLocalAdminEnabled(
      isLocalAdminToolsEnabled({
        hostname: window.location.hostname
      })
    );
  }, []);

  const top20 = useMemo(() => results.slice(0, 20), [results]);
  const top20Keys = useMemo(() => top20.map((item) => buildNameKey(item)), [top20]);
  const hasFeedbackContext =
    surnameHangul.trim().length > 0 && input.surnameHanja.trim().length > 0;
  const premiumLoadingPath =
    typeof window === "undefined"
      ? "/premium/loading"
      : resolvePremiumLoadingPath(window.location.pathname);

  useEffect(() => {
    setFeedbackStatus((prev) => syncFeedbackStatus(prev, top20Keys));
    setFeedbackVote((prev) => syncFeedbackVote(prev, top20Keys));
  }, [top20Keys]);

  if (!hasHydrated || !summary) {
    return <></>;
  }

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
      console.error("[premium-result] mark not-inmyong failed", error);
      setHanjaActionStatus((prev) => ({ ...prev, [key]: "error" }));
    }
  };

  const handleBlacklistName = async (
    item: Pick<PremiumRecommendResultItem, "nameHangul" | "hanjaPair">
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
      console.error("[premium-result] blacklist update failed", error);
      setNameActionStatus((prev) => ({ ...prev, [key]: "error" }));
    }
  };

  const handleAddSyllableRule = async (
    item: Pick<PremiumRecommendResultItem, "nameHangul" | "hanjaPair">
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
      console.error("[premium-result] syllable-rule update failed", error);
      setSyllableRuleActionStatus((prev) => ({ ...prev, [key]: "error" }));
    }
  };

  const handleFeedbackClick = async (
    item: PremiumRecommendResultItem,
    vote: "like" | "dislike"
  ): Promise<void> => {
    if (!hasFeedbackContext) {
      return;
    }

    const key = buildNameKey(item);
    if (feedbackStatus[key] === "pending" || feedbackStatus[key] === "done") {
      return;
    }

    setFeedbackStatus((prev) => ({ ...prev, [key]: "pending" }));
    setFeedbackVote((prev) => ({ ...prev, [key]: vote }));
    try {
      await submitNameFeedback({
        surnameHangul,
        surnameHanja: input.surnameHanja,
        nameHangul: item.nameHangul,
        hanjaPair: item.hanjaPair,
        vote
      });
      setFeedbackStatus((prev) => ({ ...prev, [key]: "done" }));
    } catch (error) {
      console.error("[premium-result] feedback submit failed", error);
      setFeedbackStatus((prev) => ({ ...prev, [key]: "idle" }));
      setFeedbackVote((prev) => ({ ...prev, [key]: undefined }));
    }
  };

  const handleLocalQuickStart = async (): Promise<void> => {
    if (localQuickStatus === "pending") {
      return;
    }

    setLocalQuickStatus("pending");
    const payload = buildLocalQuickPremiumPayload();
    setInput(payload.input);
    setStoredSurnameHangul(payload.surnameHangul);
    try {
      const response = await fetchPremiumRecommendations(payload.input);
      setSummary(response.summary);
      setResults(response.results);
      setLocalQuickStatus("idle");
    } catch (error) {
      console.error("[premium-result] local quick premium refresh failed", error);
      setLocalQuickStatus("error");
    }
  };

  return (
    <TdsScreen title="프리미엄 추천 결과" description="사주 점수를 우선으로 정렬했습니다.">
      <section className="tds-premium-summary">
        <div className="tds-premium-summary-head">
          <h2 className="tds-premium-summary-title">4주8자</h2>
          {!summary.hasHourPillar ? (
            <span className="tds-premium-badge">시주 미반영</span>
          ) : null}
        </div>
        <div className="tds-premium-pillars">
          <span className="tds-premium-pillar">년주 {summary.pillars.year.hangul}</span>
          <span className="tds-premium-pillar">월주 {summary.pillars.month.hangul}</span>
          <span className="tds-premium-pillar">일주 {summary.pillars.day.hangul}</span>
          {summary.pillars.hour ? (
            <span className="tds-premium-pillar">시주 {summary.pillars.hour.hangul}</span>
          ) : null}
        </div>

        <p className="tds-premium-summary-line">{summary.oneLineSummary}</p>
        <p className="tds-premium-weak">
          부족 TOP2: {summary.weakTop2.map((element) => toElementKo(element)).join(" / ")}
        </p>

        <ul className="tds-premium-dist-list">
          {summary.distStatus.map((item) => {
            const isWeak = summary.weakTop2.includes(item.element);
            return (
              <li
                key={item.element}
                className={`tds-premium-dist-item${isWeak ? " is-weak" : ""}`}
              >
                <span className="tds-premium-dist-element">{toElementKo(item.element)}</span>
                <span className="tds-premium-dist-percent">{item.percent.toFixed(1)}%</span>
                <span className="tds-premium-dist-status">
                  {STATUS_LABELS_KO[item.status]}
                </span>
              </li>
            );
          })}
        </ul>
      </section>

      <p className="tds-premium-notice">
        추천 정렬은 사주 점수 기준이며 발음 점수는 참고용입니다.
      </p>

      {top20.length === 0 ? (
        <div className="result-actions">
          <p className="tds-description">추천 결과가 비어 있어요. 다시 시도해 주세요.</p>
          <TdsPrimaryButton
            onClick={() => {
              router.replace(premiumLoadingPath);
            }}
          >
            다시 분석하기
          </TdsPrimaryButton>
        </div>
      ) : (
        <section className="result-list">
          {top20.map((item) => {
            const itemKey = buildNameKey(item);
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
              <TdsCard key={itemKey}>
                <div className="result-header-row">
                  <span className="score-chip">#{item.rank}</span>
                </div>
                <p className="pron-emphasis">{item.nameHangul}</p>
                <ul className="hanja-detail-list">
                  {hanjaDetails.map((detail, detailIndex) => (
                    <li
                      key={`${buildNameKey(item)}-${detail.hanja}-${detail.reading}-${detailIndex}`}
                      className="hanja-detail-item"
                    >
                      <span className="hanja-char">{detail.hanja}</span>
                      <span className="hanja-reading">{detail.reading}</span>
                      <span className="hanja-meaning">{detail.meaning}</span>
                      {localAdminEnabled ? (
                        <button
                          type="button"
                          className={`local-admin-btn local-admin-btn-minimal${
                            hanjaActionStatus[detail.hanja] === "done"
                              ? " is-done"
                              : hanjaActionStatus[detail.hanja] === "error"
                                ? " is-error"
                                : ""
                          }`}
                          disabled={hanjaActionStatus[detail.hanja] === "pending"}
                          onClick={() => {
                            void handleSetNotInmyong(detail.hanja);
                          }}
                        >
                          비인명용 처리
                        </button>
                      ) : null}
                    </li>
                  ))}
                </ul>
                <p className="tds-premium-star">사주 보완 ⭐ {item.sajuScore5.toFixed(1)}</p>
                <p className="tds-premium-star">발음 조화 ⭐ {item.soundScore5.toFixed(1)}</p>
                <ul className="reason-list">
                  {item.why.slice(0, 2).map((reason, index) => (
                    <li key={`${itemKey}-${index}`}>{reason}</li>
                  ))}
                </ul>
                <div className="feedback-row is-split">
                  <button
                    type="button"
                    className={`feedback-btn is-like${feedbackVote[itemKey] === "like" ? " is-selected" : ""}`}
                    disabled={
                      !hasFeedbackContext ||
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
                      !hasFeedbackContext ||
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
                      className={`local-admin-btn local-admin-btn-minimal${
                        nameActionStatus[itemKey] === "done"
                          ? " is-done"
                          : nameActionStatus[itemKey] === "error"
                            ? " is-error"
                            : ""
                      }`}
                      disabled={nameActionStatus[itemKey] === "pending"}
                      onClick={() => {
                        void handleBlacklistName(item);
                      }}
                    >
                      이름 블랙리스트
                    </button>
                    <button
                      type="button"
                      className={`local-admin-btn local-admin-btn-minimal${
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
      )}

      <p className="tds-premium-free-note">현재 한시적 무료로 제공 중입니다.</p>

      <div className="result-actions">
        {localAdminEnabled ? (
          <div className="local-admin-name-row">
            <button
              type="button"
              className={`local-admin-btn local-admin-btn-minimal${
                localQuickStatus === "error" ? " is-error" : ""
              }`}
              disabled={localQuickStatus === "pending"}
              onClick={() => {
                void handleLocalQuickStart();
              }}
            >
              {localQuickStatus === "pending"
                ? "로컬 자동 입력 조회 중…"
                : localQuickStatus === "error"
                  ? "로컬 자동 입력 재시도"
                  : "로컬 자동 입력으로 바로 조회"}
            </button>
          </div>
        ) : null}
        <TdsPrimaryButton
          onClick={() => {
            reset();
            router.replace("/premium");
          }}
        >
          다시 입력
        </TdsPrimaryButton>
      </div>
    </TdsScreen>
  );
}
