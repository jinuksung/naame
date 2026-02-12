"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  TdsCard,
  TdsPrimaryButton,
  TdsScreen,
  TdsSecondaryButton,
} from "@/components/tds";
import { useRecommendStore } from "@/store/useRecommendStore";

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

export default function ResultPage(): JSX.Element {
  const router = useRouter();
  const input = useRecommendStore((state) => state.input);
  const results = useRecommendStore((state) => state.results);
  const reset = useRecommendStore((state) => state.reset);

  const hasInput =
    input.surnameHangul.trim().length > 0 &&
    input.surnameHanja.trim().length > 0 &&
    input.birth.date.length > 0;

  useEffect(() => {
    if (!hasInput) {
      router.replace("/");
    }
  }, [hasInput, router]);

  if (!hasInput) {
    return <></>;
  }

  const top5 = results.slice(0, 5);

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
          <section className="result-list">
            {top5.map((item, index) => {
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
