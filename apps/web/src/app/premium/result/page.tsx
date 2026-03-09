"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, PrimaryButton, Screen, SecondaryButton } from "@/components/ui";
import { PremiumResultShareCard } from "@/components/share/PremiumResultShareCard";
import { addNameBlockSyllableRule, submitNameFeedback } from "@/lib/api";
import { syncFeedbackStatus, syncFeedbackVote } from "@/lib/feedbackState";
import { buildLikedNameEntryFromPremium } from "@/lib/likedNameEntry";
import {
  buildLocalQuickPremiumPayload,
  resolvePremiumLoadingPath
} from "@/lib/localQuickPremium";
import { sharePremiumResultCard } from "@/lib/share/shareResultCardImage";
import { isLocalAdminToolsEnabled } from "@namefit/engine/lib/localAdminVisibility";
import { ToggleLikedError, useLikedNamesStore } from "@/store/useLikedNamesStore";
import { usePremiumRecommendStore } from "@/store/usePremiumRecommendStore";
import {
  PremiumRecommendResultItem,
  PremiumRecommendSummary,
  RecommendElement
} from "@/types/recommend";

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
  return normalized.length > 0 ? normalized : "의미 미상";
}

function buildNameKey(item: Pick<PremiumRecommendResultItem, "nameHangul" | "hanjaPair">): string {
  return `${item.nameHangul}:${item.hanjaPair[0]}${item.hanjaPair[1]}`;
}

function formatDisplayName(surnameHangul: string, nameHangul: string): string {
  const normalizedSurnameHangul = surnameHangul.trim();
  return normalizedSurnameHangul.length > 0
    ? `${normalizedSurnameHangul}${nameHangul}`
    : nameHangul;
}

function toElementKo(element: RecommendElement): string {
  return ELEMENT_LABELS_KO[element] ?? element;
}

function getWeakTopElements(summary: PremiumRecommendSummary): RecommendElement[] {
  const compat = summary as PremiumRecommendSummary & {
    weakTop2?: RecommendElement[];
  };
  if (Array.isArray(compat.weakTop3)) {
    return compat.weakTop3;
  }
  if (Array.isArray(compat.weakTop2)) {
    return compat.weakTop2;
  }
  return [];
}

function ThumbUpIcon(): JSX.Element {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className="nf-feedback-icon"
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
      className="nf-feedback-icon"
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
  const setInput = usePremiumRecommendStore((state) => state.setInput);
  const surnameHangul = usePremiumRecommendStore((state) => state.surnameHangul);
  const summary = usePremiumRecommendStore((state) => state.summary);
  const results = usePremiumRecommendStore((state) => state.results);
  const setResults = usePremiumRecommendStore((state) => state.setResults);
  const reset = usePremiumRecommendStore((state) => state.reset);
  const likedNames = useLikedNamesStore((state) => state.likedNames);
  const hydrateLikedNames = useLikedNamesStore((state) => state.hydrate);
  const toggleLiked = useLikedNamesStore((state) => state.toggleLiked);
  const hasDbLikeSent = useLikedNamesStore((state) => state.hasDbLikeSent);
  const markDbLikeSent = useLikedNamesStore((state) => state.markDbLikeSent);
  const [localAdminEnabled, setLocalAdminEnabled] = useState(false);
  const [syllableRuleActionStatus, setSyllableRuleActionStatus] = useState<
    Record<string, "idle" | "pending" | "done" | "error">
  >({});
  const [feedbackStatus, setFeedbackStatus] = useState<
    Record<string, "idle" | "pending" | "done">
  >({});
  const [feedbackVote, setFeedbackVote] = useState<
    Record<string, "like" | "dislike" | undefined>
  >({});
  const [likedToast, setLikedToast] = useState<string | null>(null);
  const [likePendingIds, setLikePendingIds] = useState<Record<string, boolean>>({});
  const [sharingCardId, setSharingCardId] = useState<string | null>(null);
  const [expandedCardId, setExpandedCardId] = useState<string | null>(null);
  const shareCardRefs = useRef<Record<string, HTMLDivElement | null>>({});

  useEffect(() => {
    if (!summary) {
      router.replace("/premium");
    }
  }, [router, summary]);

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

  const top5 = useMemo(() => results.slice(0, 5), [results]);
  const top5Keys = useMemo(() => top5.map((item) => buildNameKey(item)), [top5]);
  const likedIdSet = useMemo(() => new Set(likedNames.map((entry) => entry.id)), [likedNames]);
  const premiumLoadingPath =
    typeof window === "undefined"
      ? "/premium/loading"
      : resolvePremiumLoadingPath(window.location.pathname);

  useEffect(() => {
    hydrateLikedNames();
  }, [hydrateLikedNames]);

  useEffect(() => {
    setFeedbackStatus((prev) => syncFeedbackStatus(prev, top5Keys));
    setFeedbackVote((prev) => syncFeedbackVote(prev, top5Keys));
  }, [top5Keys]);

  useEffect(() => {
    setExpandedCardId((prev) => {
      if (top5.length === 0) {
        return null;
      }
      if (prev && top5Keys.includes(prev)) {
        return prev;
      }
      return top5Keys[0] ?? null;
    });
  }, [top5, top5Keys]);

  useEffect(() => {
    if (!likedToast) {
      return;
    }
    const timer = window.setTimeout(() => {
      setLikedToast(null);
    }, 2200);
    return () => {
      window.clearTimeout(timer);
    };
  }, [likedToast]);

  if (!summary) {
    return <></>;
  }
  const weakTopElements = getWeakTopElements(summary);
  const hasFeedbackContext = surnameHangul.trim().length > 0 && input.surnameHanja.trim().length > 0;

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

  const handleLocalQuickStart = (): void => {
    const payload = buildLocalQuickPremiumPayload();
    setInput(payload.input);
    setResults([]);
    router.push(premiumLoadingPath);
  };

  const handleLikeToggle = async (item: PremiumRecommendResultItem): Promise<void> => {
    const entry = buildLikedNameEntryFromPremium({
      surnameHangul,
      surnameHanja: input.surnameHanja,
      gender: input.gender,
      item
    });
    const likedId = entry.id;
    if (likePendingIds[likedId]) {
      return;
    }

    try {
      const toggleResult = toggleLiked(entry);
      if (toggleResult === "removed") {
        setLikedToast("내가 찜한 이름에서 제거됐어요");
        return;
      }
      setLikedToast("내가 찜한 이름에 저장됐어요");
    } catch (error) {
      if (error instanceof ToggleLikedError && error.code === "max_limit_reached") {
        setLikedToast("찜한 이름은 최대 10개까지 저장할 수 있어요.");
        return;
      }
      console.error("[premium-result] liked toggle failed", error);
      setLikedToast("저장 공간 문제로 찜을 저장하지 못했어요.");
      return;
    }

    if (!hasFeedbackContext || hasDbLikeSent(likedId)) {
      return;
    }

    setLikePendingIds((prev) => ({ ...prev, [likedId]: true }));
    try {
      await submitNameFeedback({
        surnameHangul,
        surnameHanja: input.surnameHanja,
        nameHangul: item.nameHangul,
        hanjaPair: item.hanjaPair,
        vote: "like"
      });
      try {
        markDbLikeSent(likedId);
      } catch (markError) {
        console.error("[premium-result] mark db-like flag failed", markError);
      }
    } catch (error) {
      console.error("[premium-result] feedback submit failed", error);
      try {
        toggleLiked(entry);
      } catch (rollbackError) {
        console.error("[premium-result] liked rollback failed", rollbackError);
      }
      setLikedToast("저장에 실패했어요. 다시 시도해 주세요.");
    } finally {
      setLikePendingIds((prev) => {
        const next = { ...prev };
        delete next[likedId];
        return next;
      });
    }
  };

  const handleDislikeClick = async (item: PremiumRecommendResultItem): Promise<void> => {
    const key = buildNameKey(item);
    if (!hasFeedbackContext || feedbackStatus[key] === "pending" || feedbackStatus[key] === "done") {
      return;
    }

    setFeedbackStatus((prev) => ({ ...prev, [key]: "pending" }));
    setFeedbackVote((prev) => ({ ...prev, [key]: "dislike" }));
    try {
      await submitNameFeedback({
        surnameHangul,
        surnameHanja: input.surnameHanja,
        nameHangul: item.nameHangul,
        hanjaPair: item.hanjaPair,
        vote: "dislike"
      });
      setFeedbackStatus((prev) => ({ ...prev, [key]: "done" }));
    } catch (error) {
      console.error("[premium-result] feedback submit failed", error);
      setFeedbackStatus((prev) => ({ ...prev, [key]: "idle" }));
      setFeedbackVote((prev) => ({ ...prev, [key]: undefined }));
    }
  };

  const handleShareCard = async (
    itemKey: string,
    displayName: string
  ): Promise<void> => {
    if (sharingCardId) {
      return;
    }
    const shareNode = shareCardRefs.current[itemKey];
    if (!shareNode) {
      setLikedToast("공유 카드를 준비하지 못했어요.");
      return;
    }

    setSharingCardId(itemKey);
    try {
      await sharePremiumResultCard(shareNode, displayName);
    } catch (error) {
      console.error("[premium-result] share failed", error);
      setLikedToast("공유에 실패했어요. 다시 시도해 주세요.");
    } finally {
      setSharingCardId(null);
    }
  };

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
          부족 TOP{weakTopElements.length > 0 ? weakTopElements.length : 3}:{" "}
          {weakTopElements.map((element) => toElementKo(element)).join(" / ")}
        </p>

        <ul className="nf-premium-dist-list">
          {summary.distStatus.map((item) => {
            const isWeak = weakTopElements.includes(item.element);
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

      <p className="nf-premium-notice">사주 보완 점수 순서대로 상위 5개를 보여드려요.</p>

      {top5.length === 0 ? (
        <div className="nf-result-actions">
          <p className="nf-description">추천 결과가 비어 있어요. 다시 시도해 주세요.</p>
          <PrimaryButton
            onClick={() => {
              router.replace(premiumLoadingPath);
            }}
          >
            다시 분석하기
          </PrimaryButton>
        </div>
      ) : (
        <section className="nf-result-list">
          {top5.map((item, index) => {
            const itemKey = buildNameKey(item);
            const likedEntry = buildLikedNameEntryFromPremium({
              surnameHangul,
              surnameHanja: input.surnameHanja,
              gender: input.gender,
              item
            });
            const likedId = likedEntry.id;
            const isLiked = likedIdSet.has(likedId);
            const isExpanded = expandedCardId === itemKey;
            const displayName = formatDisplayName(surnameHangul, item.nameHangul);
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
              <Card key={itemKey}>
                <button
                  type="button"
                  className={`nf-premium-toggle${isExpanded ? " is-expanded" : ""}`}
                  onClick={() => {
                    setExpandedCardId(itemKey);
                  }}
                >
                  <div className="nf-result-header-row">
                    {index === 0 ? (
                      <span className="nf-top-rank-badge">가장 잘 맞는 이름</span>
                    ) : null}
                    <span className="nf-score-chip">#{item.rank}</span>
                  </div>
                  <p className="nf-pron-emphasis">{displayName}</p>
                </button>
                <ul className="nf-hanja-detail-list">
                  {hanjaDetails.map((detail, detailIndex) => (
                    <li
                      key={`${itemKey}-${detail.hanja}-${detail.reading}-${detailIndex}`}
                      className="nf-hanja-detail-item"
                    >
                      <span className="nf-hanja-char">{detail.hanja}</span>
                      <span className="nf-hanja-reading">{detail.reading}</span>
                      <span className="nf-hanja-meaning">{detail.meaning}</span>
                    </li>
                  ))}
                </ul>

                {isExpanded ? (
                  <section className="nf-premium-report-panel">
                    <p className="nf-premium-report-summary">{item.report.summary}</p>
                    <ul className="nf-reason-list">
                      {item.report.bullets.slice(0, 4).map((reason, reasonIndex) => (
                        <li key={`${itemKey}-report-${reasonIndex}`}>{reason}</li>
                      ))}
                    </ul>
                    <div className="nf-premium-ageband-list">
                      {item.report.ageBands.map((band) => (
                        <article key={`${itemKey}-${band.key}`} className="nf-premium-ageband-card">
                          <h4>{band.label}</h4>
                          <p>{band.lines[0]}</p>
                          <p>{band.lines[1]}</p>
                        </article>
                      ))}
                    </div>
                  </section>
                ) : null}

                <div className="nf-feedback-row is-split">
                  <button
                    type="button"
                    className={`nf-feedback-btn is-like${isLiked ? " is-selected" : ""}`}
                    disabled={!hasFeedbackContext || Boolean(likePendingIds[likedId])}
                    onClick={() => {
                      void handleLikeToggle(item);
                    }}
                  >
                    <span className="nf-feedback-content">
                      <ThumbUpIcon />
                      <span>{isLiked ? "찜해제" : "좋아요"}</span>
                    </span>
                  </button>
                  <button
                    type="button"
                    className={`nf-feedback-btn is-dislike${feedbackVote[itemKey] === "dislike" ? " is-selected" : ""}`}
                    disabled={
                      !hasFeedbackContext ||
                      feedbackStatus[itemKey] === "pending" ||
                      feedbackStatus[itemKey] === "done"
                    }
                    onClick={() => {
                      void handleDislikeClick(item);
                    }}
                  >
                    <span className="nf-feedback-content">
                      <ThumbDownIcon />
                      <span>싫어요</span>
                    </span>
                  </button>
                </div>
                <div className="nf-share-row">
                  <button
                    type="button"
                    className="nf-feedback-btn is-share"
                    disabled={sharingCardId !== null}
                    onClick={() => {
                      void handleShareCard(itemKey, displayName);
                    }}
                  >
                    공유하기
                  </button>
                </div>

                {localAdminEnabled ? (
                  <div className="nf-local-admin-name-row">
                    <button
                      type="button"
                      className={`nf-local-admin-btn nf-local-admin-btn-minimal${
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

                <div
                  className="nf-share-render-host"
                  aria-hidden="true"
                  ref={(node) => {
                    shareCardRefs.current[itemKey] = node;
                  }}
                >
                  <PremiumResultShareCard
                    displayName={displayName}
                    hanjaPair={item.hanjaPair}
                    readingPair={item.readingPair}
                    report={item.report}
                  />
                </div>
              </Card>
            );
          })}
        </section>
      )}

      <div className="nf-result-actions">
        <SecondaryButton
          onClick={() => {
            router.push("/liked?mode=premium");
          }}
        >
          찜한 이름 보기
        </SecondaryButton>
        {localAdminEnabled ? (
          <div className="nf-local-admin-name-row">
            <button
              type="button"
              className="nf-local-admin-btn nf-local-admin-btn-minimal"
              onClick={handleLocalQuickStart}
            >
              로컬 자동 입력으로 바로 조회
            </button>
          </div>
        ) : null}
        <PrimaryButton
          onClick={() => {
            reset();
            router.replace("/premium");
          }}
        >
          다시 입력
        </PrimaryButton>
        {likedToast ? <p className="nf-liked-toast">{likedToast}</p> : null}
      </div>
    </Screen>
  );
}
