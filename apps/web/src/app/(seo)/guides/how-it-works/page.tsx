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
  ServiceEntryCtaSection,
} from "@/seo/seoComponents";

const faqItems: FaqItem[] = [
  {
    question: "네임핏 추천은 어떤 입력값을 사용하나요?",
    answer:
      "성씨, 성별, 생년월일을 기본 입력으로 사용합니다. 입력값을 조합해 후보를 좁히고, 결과를 '왜 이 후보인지' 설명과 함께 보여줍니다.",
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
      "예비 부모를 위한 네임핏 추천 원리 가이드입니다. 입력값이 후보에 어떻게 반영되는지, 결과를 어떻게 읽어야 하는지 쉽게 정리했습니다.",
    pathname: "/guides/how-it-works",
  });
}

export default function HowItWorksGuidePage(): JSX.Element {
  return (
    <SeoPageShell
      title="이름 추천 알고리즘 개요"
      description="복잡한 용어 없이, 예비 부모가 실제 선택에 바로 쓸 수 있는 방식으로 추천 원리를 설명합니다."
    >
      <ParagraphSection
        title="추천은 정답 찾기가 아니라 후보 정리입니다"
        paragraphs={[
          "이름 추천에서 가장 중요한 건 한 번에 정답을 맞히는 게 아니라, 좋은 후보를 빠르게 압축하는 것입니다. 네임핏은 성씨, 성별, 생년월일을 순서대로 반영해 후보를 정리하고, 비교 기준이 보이도록 결과를 구성합니다.",
          "즉 결과는 '이름을 대신 정해주는 답안'이 아니라 '가족이 합리적으로 선택할 수 있는 비교판'입니다. 이 관점으로 보면 결과를 읽는 속도도 빨라지고, 선택에 대한 확신도 높아집니다.",
        ]}
      />

      <ParagraphSection
        title="결과를 읽을 때 놓치지 말아야 할 3가지"
        paragraphs={[
          "첫째, 후보를 2~3개 단위로 비교하세요. 둘째, 성씨와 붙여 여러 번 불러 보세요. 셋째, 의미와 표기 편의성을 함께 확인하세요. 이 3가지만 지켜도 선택 과정이 훨씬 명확해집니다.",
          "한 번의 추천 결과로 바로 확정하기보다, 필요하면 성씨/성별 페이지를 오가며 관점을 바꿔 보는 것이 좋습니다. 관점이 달라지면 후보 장단점이 더 분명하게 보입니다.",
        ]}
      />

      <LinkCardGrid title="관련 페이지" links={relatedLinks} />

      <FaqSection items={faqItems} />

      <NoteSection text="추천 알고리즘은 후보를 정리해 주는 도구입니다. 최종 이름은 가족이 직접 검토하고 선호를 맞춰 결정하는 것이 가장 중요합니다." />

      <ServiceEntryCtaSection entryKey="guide-how-it-works" />
    </SeoPageShell>
  );
}
