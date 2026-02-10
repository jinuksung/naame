"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { TdsScreen } from "@/components/tds";
import { fetchFreeRecommendations } from "@/lib/api";
import { buildMockResults } from "@/lib/mock";
import { useRecommendStore } from "@/store/useRecommendStore";

const LOADING_MESSAGES = [
  "인명용 한자 검토 중…",
  "발음 조합 분석 중…",
  "의미 균형 계산 중…",
  "사주 오행 참고 중…"
] as const;

const MIN_LOADING_MS = 1700;
const MESSAGE_ROTATE_MS = 500;

function wait(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

export default function LoadingPage(): JSX.Element {
  const router = useRouter();
  const input = useRecommendStore((state) => state.input);
  const setResults = useRecommendStore((state) => state.setResults);

  const [messageIndex, setMessageIndex] = useState(0);
  const hasInput = input.surnameHangul.trim().length > 0 && input.birth.date.length > 0;

  useEffect(() => {
    if (!hasInput) {
      router.replace("/");
      return;
    }

    let isCancelled = false;
    const rotateTimer = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % LOADING_MESSAGES.length);
    }, MESSAGE_ROTATE_MS);

    const run = async (): Promise<void> => {
      try {
        const requestPromise = fetchFreeRecommendations(input).catch((error) => {
          console.error("[loading] API 실패, mock fallback 사용", error);
          return { results: buildMockResults(input) };
        });

        await wait(MIN_LOADING_MS);
        const response = await requestPromise;
        if (isCancelled) {
          return;
        }
        setResults(response.results.slice(0, 5));
        router.replace("/result");
      } catch (error) {
        console.error("[loading] 예기치 않은 오류, mock fallback 사용", error);
        if (isCancelled) {
          return;
        }
        setResults(buildMockResults(input));
        router.replace("/result");
      }
    };

    void run();

    return () => {
      isCancelled = true;
      clearInterval(rotateTimer);
    };
  }, [hasInput, input, router, setResults]);

  return (
    <TdsScreen title="이름을 추천하고 있어요" description="잠시만 기다려 주세요.">
      <div className="loading-wrap">
        <div className="loading-spinner" aria-label="로딩 중" />
        <p className="loading-text">{LOADING_MESSAGES[messageIndex]}</p>
      </div>
    </TdsScreen>
  );
}
