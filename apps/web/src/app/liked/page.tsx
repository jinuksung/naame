"use client";

import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Card, PrimaryButton, Screen } from "@/components/ui";
import type { LikedNameEntry } from "@/lib/likedNamesRepository";
import { ToggleLikedError, useLikedNamesStore } from "@/store/useLikedNamesStore";

function formatSavedAt(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "저장 시각 확인 불가";
  }
  return new Intl.DateTimeFormat("ko-KR", {
    dateStyle: "short",
    timeStyle: "short"
  }).format(date);
}

function displayMeaning(meaning: string | undefined): string {
  const normalized = (meaning ?? "").trim();
  return normalized.length > 0 ? normalized : "뜻 정보 없음";
}

function hasMeaning(value: string | undefined): boolean {
  return (value ?? "").trim().length > 0;
}

function normalizeHanjaChar(value: string): string {
  return Array.from(value.trim().normalize("NFC")).slice(0, 1).join("");
}

interface HanjaMeaningResponse {
  meanings?: Record<string, string>;
}

function LikedPageContent(): JSX.Element {
  const router = useRouter();
  const searchParams = useSearchParams();
  const likedNames = useLikedNamesStore((state) => state.likedNames);
  const hasHydrated = useLikedNamesStore((state) => state.hasHydrated);
  const hydrate = useLikedNamesStore((state) => state.hydrate);
  const removeLiked = useLikedNamesStore((state) => state.removeLiked);
  const upsertLiked = useLikedNamesStore((state) => state.upsertLiked);
  const [toast, setToast] = useState<string | null>(null);
  const requestedCharsRef = useRef(new Set<string>());

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  useEffect(() => {
    if (!toast) {
      return;
    }
    const timer = window.setTimeout(() => {
      setToast(null);
    }, 2200);
    return () => {
      window.clearTimeout(timer);
    };
  }, [toast]);

  const sortedLikedNames = useMemo(
    () =>
      [...likedNames].sort(
        (left, right) => Date.parse(right.createdAt) - Date.parse(left.createdAt)
      ),
    [likedNames]
  );
  const mode = searchParams.get("mode");
  const backPath = mode === "premium" ? "/premium" : "/free";

  useEffect(() => {
    if (!hasHydrated) {
      return;
    }
    const missingMeaningEntries = likedNames.filter(
      (entry) => !hasMeaning(entry.meaningPair?.[0]) || !hasMeaning(entry.meaningPair?.[1])
    );
    if (missingMeaningEntries.length === 0) {
      return;
    }

    const requestedChars = Array.from(
      new Set(
        missingMeaningEntries
          .flatMap((entry) => entry.hanjaPair)
          .map((char) => normalizeHanjaChar(char))
          .filter((char) => char.length > 0 && !requestedCharsRef.current.has(char))
      )
    );
    if (requestedChars.length === 0) {
      return;
    }
    for (const char of requestedChars) {
      requestedCharsRef.current.add(char);
    }

    const abortController = new AbortController();
    let keepRequestedChars = false;
    const query = new URLSearchParams({
      chars: requestedChars.join(",")
    });

    const applyResolvedMeanings = (
      entry: LikedNameEntry,
      meanings: Record<string, string>
    ): LikedNameEntry | null => {
      const firstExisting = entry.meaningPair?.[0];
      const secondExisting = entry.meaningPair?.[1];
      const firstHanja = normalizeHanjaChar(entry.hanjaPair[0]);
      const secondHanja = normalizeHanjaChar(entry.hanjaPair[1]);
      const firstResolved = hasMeaning(firstExisting)
        ? firstExisting?.trim()
        : meanings[firstHanja]?.trim();
      const secondResolved = hasMeaning(secondExisting)
        ? secondExisting?.trim()
        : meanings[secondHanja]?.trim();
      if (!firstResolved || !secondResolved) {
        return null;
      }
      if (entry.meaningPair?.[0] === firstResolved && entry.meaningPair?.[1] === secondResolved) {
        return null;
      }
      return {
        ...entry,
        meaningPair: [firstResolved, secondResolved]
      };
    };

    (async () => {
      try {
        const response = await fetch(`/api/hanja/meanings?${query.toString()}`, {
          method: "GET",
          cache: "no-store",
          signal: abortController.signal
        });
        if (!response.ok) {
          return;
        }
        keepRequestedChars = true;
        const payload = (await response.json()) as HanjaMeaningResponse;
        const meanings = payload.meanings ?? {};
        for (const entry of missingMeaningEntries) {
          const nextEntry = applyResolvedMeanings(entry, meanings);
          if (!nextEntry) {
            continue;
          }
          try {
            upsertLiked(nextEntry);
          } catch (error) {
            console.error("[liked] failed to backfill meaning pair", error);
            break;
          }
        }
      } catch (error) {
        if (abortController.signal.aborted) {
          return;
        }
        console.error("[liked] meaning lookup failed", error);
      } finally {
        if (keepRequestedChars) {
          return;
        }
        for (const char of requestedChars) {
          requestedCharsRef.current.delete(char);
        }
      }
    })();

    return () => {
      abortController.abort();
    };
  }, [hasHydrated, likedNames, upsertLiked]);

  if (!hasHydrated) {
    return <></>;
  }

  return (
    <Screen title="찜한 이름">
      {sortedLikedNames.length === 0 ? (
        <section className="nf-liked-empty">
          <p className="nf-description">아직 저장한 이름이 없어요.</p>
          <p className="nf-description">결과 화면에서 좋아요를 눌러 찜해 보세요.</p>
        </section>
      ) : (
        <section className="nf-liked-list">
          {sortedLikedNames.map((entry) => (
            <Card key={entry.id}>
              <strong className="nf-pron-emphasis">{entry.fullName}</strong>
              <ul className="nf-hanja-detail-list">
                <li className="nf-hanja-detail-item">
                  <span className="nf-hanja-char">{entry.hanjaPair[0]}</span>
                  <span className="nf-hanja-reading">{entry.readingPair[0]}</span>
                  <span className="nf-hanja-meaning">
                    {displayMeaning(entry.meaningPair?.[0])}
                  </span>
                </li>
                <li className="nf-hanja-detail-item">
                  <span className="nf-hanja-char">{entry.hanjaPair[1]}</span>
                  <span className="nf-hanja-reading">{entry.readingPair[1]}</span>
                  <span className="nf-hanja-meaning">
                    {displayMeaning(entry.meaningPair?.[1])}
                  </span>
                </li>
              </ul>
              <p className="nf-liked-saved-at">저장 시각 {formatSavedAt(entry.createdAt)}</p>
              <div className="nf-share-row">
                <button
                  type="button"
                  className="nf-feedback-btn is-share"
                  onClick={() => {
                    try {
                      removeLiked(entry.id);
                      setToast("내가 찜한 이름에서 제거됐어요");
                    } catch (error) {
                      if (error instanceof ToggleLikedError) {
                        setToast("저장 공간 문제로 찜 해제를 완료하지 못했어요.");
                        return;
                      }
                      setToast("찜 해제를 완료하지 못했어요.");
                    }
                  }}
                >
                  찜 해제
                </button>
              </div>
            </Card>
          ))}
        </section>
      )}

      <div className="nf-result-actions">
        <PrimaryButton
          onClick={() => {
            router.replace(backPath);
          }}
        >
          돌아가기
        </PrimaryButton>
        {toast ? <p className="nf-liked-toast">{toast}</p> : null}
      </div>
    </Screen>
  );
}

export default function LikedPage(): JSX.Element {
  return (
    <Suspense fallback={<></>}>
      <LikedPageContent />
    </Suspense>
  );
}
