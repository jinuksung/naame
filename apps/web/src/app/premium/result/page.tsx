"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, PrimaryButton, Screen, SecondaryButton } from "@/components/ui";
import { addNameBlockSyllableRule, submitNameFeedback } from "@/lib/api";
import { buildLikedNameEntryFromPremium } from "@/lib/likedNameEntry";
import {
  buildLocalQuickPremiumPayload,
  resolvePremiumLoadingPath
} from "@/lib/localQuickPremium";
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
  const [likedToast, setLikedToast] = useState<string | null>(null);
  const [likePendingIds, setLikePendingIds] = useState<Record<string, boolean>>({});

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

  const top20 = useMemo(() => results.slice(0, 20), [results]);
  const likedIdSet = useMemo(() => new Set(likedNames.map((entry) => entry.id)), [likedNames]);
  const premiumLoadingPath =
    typeof window === "undefined"
      ? "/premium/loading"
      : resolvePremiumLoadingPath(window.location.pathname);

  useEffect(() => {
    hydrateLikedNames();
  }, [hydrateLikedNames]);

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

    if (hasDbLikeSent(likedId) || !surnameHangul.trim() || !input.surnameHanja.trim()) {
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

      <p className="nf-premium-notice">
        추천 정렬은 사주 점수 기준이며 발음 점수는 참고용입니다.
      </p>

      {top20.length === 0 ? (
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
          {top20.map((item, index) => {
            const likedEntry = buildLikedNameEntryFromPremium({
              surnameHangul,
              surnameHanja: input.surnameHanja,
              gender: input.gender,
              item
            });
            const likedId = likedEntry.id;
            const isLiked = likedIdSet.has(likedId);

            return (
              <Card key={buildNameKey(item)}>
              <div className="nf-premium-card-head">
                <strong className="nf-pron-emphasis">
                  {formatDisplayName(surnameHangul, item.nameHangul)}
                </strong>
                <div className="nf-rank-meta">
                  {index === 0 ? (
                    <span className="nf-top-rank-badge">가장 잘 맞는 이름</span>
                  ) : null}
                  <span className="nf-score-chip">#{item.rank}</span>
                </div>
              </div>
              <p className="nf-premium-hanja">
                {item.hanjaPair[0]}({item.readingPair[0]}) · {item.hanjaPair[1]}({item.readingPair[1]})
              </p>
              <p className="nf-premium-star">사주 보완 ⭐ {item.sajuScore5.toFixed(1)}</p>
              <p className="nf-premium-star">발음 조화 ⭐ {item.soundScore5.toFixed(1)}</p>
              <ul className="nf-reason-list">
                {item.why.slice(0, 3).map((reason, index) => (
                  <li key={`${buildNameKey(item)}-${index}`}>{reason}</li>
                ))}
              </ul>
              <div className="nf-feedback-row is-single">
                <button
                  type="button"
                  className={`nf-feedback-btn is-like${isLiked ? " is-selected" : ""}`}
                  disabled={Boolean(likePendingIds[likedId])}
                  onClick={() => {
                    void handleLikeToggle(item);
                  }}
                >
                  <span className="nf-feedback-content">
                    <span>{isLiked ? "찜해제" : "좋아요"}</span>
                  </span>
                </button>
              </div>
              {localAdminEnabled ? (
                <div className="nf-local-admin-name-row">
                  <button
                    type="button"
                    className={`nf-local-admin-btn nf-local-admin-btn-minimal${
                      syllableRuleActionStatus[buildNameKey(item)] === "done"
                        ? " is-done"
                        : syllableRuleActionStatus[buildNameKey(item)] === "error"
                          ? " is-error"
                          : ""
                    }`}
                    disabled={syllableRuleActionStatus[buildNameKey(item)] === "pending"}
                    onClick={() => {
                      void handleAddSyllableRule(item);
                    }}
                  >
                    음절패턴 차단
                  </button>
                </div>
              ) : null}
              </Card>
            );
          })}
        </section>
      )}

      <p className="nf-premium-free-note">현재 한시적 무료로 제공 중입니다.</p>

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
