"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Screen } from "@/components/ui";
import { fetchPremiumRecommendations } from "@/lib/api";
import { usePremiumRecommendStore } from "@/store/usePremiumRecommendStore";

const LOADING_MESSAGES = [
  "만세력(절기) 기준으로 4주8자 계산 중…",
  "사주 오행 분포 분석 중…",
  "부족 오행 보완 점수 산정 중…"
] as const;

const MIN_LOADING_MS = 1700;
const MESSAGE_ROTATE_MS = 500;

function wait(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

export default function PremiumLoadingPage(): JSX.Element {
  const router = useRouter();
  const input = usePremiumRecommendStore((state) => state.input);
  const setSummary = usePremiumRecommendStore((state) => state.setSummary);
  const setResults = usePremiumRecommendStore((state) => state.setResults);

  const [messageIndex, setMessageIndex] = useState(0);
  const hasInput =
    input.birth.date.trim().length > 0 &&
    input.surnameHanja.trim().length > 0;

  useEffect(() => {
    if (!hasInput) {
      router.replace("/premium");
      return;
    }

    let isCancelled = false;
    const rotateTimer = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % LOADING_MESSAGES.length);
    }, MESSAGE_ROTATE_MS);

    const run = async (): Promise<void> => {
      try {
        const requestPromise = fetchPremiumRecommendations(input);
        await wait(MIN_LOADING_MS);
        const response = await requestPromise;
        if (isCancelled) {
          return;
        }
        setSummary(response.summary);
        setResults(response.results);
        router.replace("/premium/result");
      } catch (error) {
        console.error("[premium/loading] 추천 호출 실패", error);
        if (isCancelled) {
          return;
        }
        setSummary(null);
        setResults([]);
        router.replace("/premium");
      }
    };

    void run();

    return () => {
      isCancelled = true;
      clearInterval(rotateTimer);
    };
  }, [hasInput, input, router, setResults, setSummary]);

  return (
    <Screen title="사주 기반으로 분석하고 있어요" description="잠시만 기다려 주세요.">
      <div className="nf-loading-wrap">
        <div className="nf-loading-spinner" aria-label="로딩 중" />
        <p className="nf-loading-text">{LOADING_MESSAGES[messageIndex]}</p>
      </div>
    </Screen>
  );
}
