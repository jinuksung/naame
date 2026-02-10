"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { TdsCard, TdsPrimaryButton, TdsScreen, TdsSecondaryButton } from "@/components/tds";
import { useRecommendStore } from "@/store/useRecommendStore";

export default function ResultPage(): JSX.Element {
  const router = useRouter();
  const input = useRecommendStore((state) => state.input);
  const results = useRecommendStore((state) => state.results);
  const reset = useRecommendStore((state) => state.reset);

  const hasInput = input.surnameHangul.trim().length > 0 && input.birth.date.length > 0;

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
    <TdsScreen title="추천 이름 TOP 5" description="입력한 정보를 바탕으로 추천했어요">
      {top5.length === 0 ? (
        <div className="result-actions">
          <p className="tds-description">추천 결과가 비어 있어요. 다시 시도해 주세요.</p>
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
            {top5.map((item, index) => (
              <TdsCard key={`${item.nameHangul}-${item.hanjaPair.join("")}-${index}`}>
                <h2 className="name-title">{item.nameHangul}</h2>
                <p className="hanja-sub">{item.hanjaPair[0]} {item.hanjaPair[1]}</p>
                <ul className="reason-list">
                  {item.reasons.slice(0, 3).map((reason, reasonIndex) => (
                    <li key={`${reason}-${reasonIndex}`}>{reason}</li>
                  ))}
                </ul>
              </TdsCard>
            ))}
          </section>

          <section className="premium-teaser">
            <h3 className="premium-title">🔒 더 많은 이름과 자세한 분석이 있어요</h3>
            <ul className="premium-list">
              <li>후보 25개 더 보기</li>
              <li>출생시간 포함 사주 분석</li>
              <li>이름별 의미/오행 리포트</li>
            </ul>
            <div className="result-actions">
              <TdsPrimaryButton
                onClick={() => {
                  console.log("[premium] 자세히 보기 클릭");
                }}
              >
                자세히 보기
              </TdsPrimaryButton>
            </div>
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
