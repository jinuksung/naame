import type { Metadata } from "next";
import { buildSeoMetadata } from "@/seo/buildMeta";
import { FaqItem } from "@/seo/faqJsonLd";
import type { InternalLinkCard } from "@/seo/internalLinks";
import {
  FaqSection,
  LinkCardGrid,
  NoteSection,
  ParagraphSection,
  SeoPageShell,
} from "@/seo/seoComponents";

const faqItems: FaqItem[] = [
  {
    question: "네임핏 추천은 어떤 입력값을 사용하나요?",
    answer:
      "성씨, 성별, 생년월일 정보를 기본 입력값으로 사용합니다. 입력값을 조합해 이름 후보를 정리하고, 결과 페이지에서 비교 가능한 설명을 함께 제공합니다.",
  },
  {
    question: "추천 알고리즘은 복잡한가요?",
    answer:
      "내부 계산은 단계별로 구성되어 있지만 사용자는 단순한 흐름으로 이용할 수 있습니다. 입력 후 후보를 확인하고 발음·의미·사용 편의를 중심으로 비교하면 됩니다.",
  },
  {
    question: "결과는 자동으로 확정된 답인가요?",
    answer:
      "아니요. 결과는 후보 정리를 위한 안내입니다. 추천 목록을 바탕으로 가족이 선호와 사용성을 확인해 최종 이름을 선택하는 방식입니다.",
  },
  {
    question: "성씨 페이지와 성별 페이지는 왜 분리되어 있나요?",
    answer:
      "검색 사용자가 원하는 진입점이 다르기 때문입니다. 성씨 중심 탐색과 성별 중심 탐색을 분리해 시작점을 명확히 하고 내부 링크로 연결합니다.",
  },
  {
    question: "추천 해석이 어려우면 어떻게 하나요?",
    answer:
      "가이드 페이지와 FAQ를 먼저 확인하고, 이후 추천 화면에서 후보를 2~3개씩 묶어 비교해 보세요. 기준을 나눠 읽으면 선택 과정이 쉬워집니다.",
  },
];

const relatedLinks: InternalLinkCard[] = [
  {
    href: "/names",
    title: "이름 추천 안내",
    description: "입력 흐름과 추천 기준을 먼저 이해한 뒤 실제 추천으로 이동합니다.",
  },
  {
    href: "/birth",
    title: "생년월일 기반 소개",
    description: "생년월일 정보를 추천 해석에 참고하는 방법을 확인합니다.",
  },
  {
    href: "/guides/namefit-vs-naming-office",
    title: "작명소와의 차이",
    description: "서비스 포지셔닝 관점에서 네임핏의 사용 방식 차이를 확인합니다.",
  },
  {
    href: "/seo",
    title: "SEO 허브",
    description: "성씨별/성별별 랜딩과 가이드 페이지를 한 번에 이동합니다.",
  },
];

export async function generateMetadata(): Promise<Metadata> {
  return buildSeoMetadata({
    title: "이름 추천 알고리즘 개요 | 네임핏",
    description:
      "네임핏 이름 추천이 성씨, 성별, 생년월일 정보를 어떻게 활용하는지 단계별로 설명합니다. 추천 결과를 읽는 순서와 실사용 중심의 해석 방법을 쉽게 확인해 보세요.",
    pathname: "/guides/how-it-works",
  });
}

export default function HowItWorksGuidePage(): JSX.Element {
  return (
    <SeoPageShell
      title="이름 추천 알고리즘 개요"
      description="네임핏이 입력값을 바탕으로 이름 후보를 정리하는 흐름을 쉬운 말로 안내합니다."
    >
      <ParagraphSection
        title="추천 단계 한눈에 보기"
        paragraphs={[
          "네임핏 추천은 성씨, 성별, 생년월일 정보를 순서대로 받아 이름 후보를 정리합니다. 첫 단계에서는 성씨와 이름의 발음 연결을 먼저 확인해 부를 때 자연스러운 후보를 모읍니다. 다음으로 성별 기준을 반영해 비교 대상을 정돈하고, 생년월일 정보는 설명을 읽을 때 참고할 수 있는 보조 기준으로 더해집니다. 이 과정을 통해 사용자는 한 번에 너무 많은 후보를 보지 않고, 조건에 맞는 이름부터 확인할 수 있습니다.",
          "추천 화면에서는 결과를 단정적으로 제시하기보다 비교 가능한 형태로 보여줍니다. 사용자는 후보별 발음 느낌, 의미 해석, 일상 사용 편의를 함께 살피면서 가족 기준에 맞는 이름을 고를 수 있습니다. 즉 알고리즘은 정답을 강요하기보다 검토 순서를 정리해 주는 도구로 작동하며, 최종 선택은 사용자 판단을 중심에 둡니다.",
        ]}
      />

      <ParagraphSection
        title="결과를 읽는 실전 팁"
        paragraphs={[
          "추천 결과를 볼 때는 먼저 2~3개 후보를 묶어 읽는 방식을 권장합니다. 한 번에 모든 후보를 판단하려 하면 기준이 흐려지기 쉽기 때문입니다. 성씨와 결합했을 때 발음이 편한지, 한글/한자 표기가 일상에서 쓰기 쉬운지, 가족이 같은 느낌을 받는지를 차례로 확인하면 결정 과정이 안정적입니다.",
          "또한 한 번의 추천으로 바로 확정하기보다, 내부 링크를 통해 성씨 페이지와 성별 페이지를 함께 비교하는 것이 좋습니다. 같은 기준이라도 페이지를 바꿔 읽으면 후보를 보는 관점이 달라져 최종 선택의 근거를 더 명확히 만들 수 있습니다.",
        ]}
      />

      <LinkCardGrid title="관련 페이지" links={relatedLinks} />

      <FaqSection items={faqItems} />

      <NoteSection text="추천 알고리즘은 후보를 정리해 주는 도구입니다. 최종 이름은 가족이 직접 검토하고 선호를 맞춰 결정하는 것이 가장 중요합니다." />
    </SeoPageShell>
  );
}
