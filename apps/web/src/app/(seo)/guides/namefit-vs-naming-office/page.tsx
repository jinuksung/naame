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
    question: "네임핏과 작명소는 어떤 점이 다른가요?",
    answer:
      "네임핏은 사용자가 직접 기준을 입력하고 빠르게 후보를 비교하는 셀프 탐색형입니다. 작명소는 상담을 중심으로 전문가와 함께 결정하는 방식이라는 점에서 출발 방식이 다릅니다.",
  },
  {
    question: "어떤 방식이 더 좋다고 볼 수 있나요?",
    answer:
      "우열보다는 상황에 맞는 선택이 중요합니다. 빠르게 여러 후보를 비교하고 싶다면 네임핏이, 상담 중심 진행을 선호하면 작명소 방식이 더 맞을 수 있습니다.",
  },
  {
    question: "네임핏만으로도 이름을 정할 수 있나요?",
    answer:
      "가능하지만 권장 방식은 후보를 비교한 뒤 가족의 선호와 사용성을 함께 검토해 결정하는 것입니다. 필요하면 추가 상담이나 주변 의견을 참고해도 좋습니다.",
  },
  {
    question: "작명소를 비판하는 페이지인가요?",
    answer:
      "아닙니다. 이 페이지는 두 방식의 포지셔닝 차이를 설명하는 안내 문서입니다. 사용자 상황에 따라 선택지가 달라질 수 있다는 점을 중립적으로 정리합니다.",
  },
  {
    question: "추천 결과를 믿고 바로 확정해도 되나요?",
    answer:
      "추천은 비교를 돕는 자료입니다. 최종 이름은 가족의 합의, 발음 만족도, 생활 속 사용 편의를 함께 점검한 뒤 확정하는 것이 좋습니다.",
  },
];

const relatedLinks: InternalLinkCard[] = [
  {
    href: "/names",
    title: "이름 추천 안내",
    description: "네임핏 기본 흐름과 입력 방법을 확인하고 실제 추천으로 이동합니다.",
  },
  {
    href: "/guides/how-it-works",
    title: "추천 알고리즘 개요",
    description: "입력값이 후보 정리에 어떻게 반영되는지 단계별로 확인합니다.",
  },
  {
    href: "/seo",
    title: "SEO 허브",
    description: "성씨별/성별별 랜딩으로 이동해 조건별 페이지를 비교합니다.",
  },
  {
    href: "/birth",
    title: "생년월일 기반 소개",
    description: "생년월일 정보를 참고하는 방법을 별도 랜딩에서 확인합니다.",
  },
];

export async function generateMetadata(): Promise<Metadata> {
  return buildSeoMetadata({
    title: "작명소와 네임핏의 차이 | 네임핏",
    description:
      "작명소와 네임핏의 차이를 예비 부모 관점에서 비교한 가이드입니다. 우리 가족에게 맞는 의사결정 방식과 추천 활용법을 확인해 보세요.",
    pathname: "/guides/namefit-vs-naming-office",
  });
}

export default function NamefitVsNamingOfficePage(): JSX.Element {
  return (
    <SeoPageShell
      title="작명소와 네임핏의 차이"
      description="어떤 방식이 더 맞는지 빠르게 판단할 수 있도록, 상담형과 셀프형의 차이를 실사용 기준으로 정리했습니다."
    >
      <ParagraphSection
        title="둘 중 무엇이 더 좋냐보다, 우리 상황에 맞는가가 중요합니다"
        paragraphs={[
          "작명소와 네임핏은 같은 목적을 향하지만 과정이 다릅니다. 작명소는 상담을 통해 방향을 잡고, 네임핏은 스스로 조건을 입력해 빠르게 비교합니다. 즉 핵심 차이는 정답의 질보다 의사결정 방식에 있습니다.",
          "빠르게 후보를 넓게 보고 싶은 가족에게는 셀프 탐색형이 유리하고, 대화 중심 해석이 필요한 가족에게는 상담형이 맞을 수 있습니다. 어느 쪽이 우월하다는 결론보다, 현재 가족의 상황과 의사결정 속도에 맞추는 것이 현실적입니다.",
        ]}
      />

      <ParagraphSection
        title="네임핏을 더 잘 쓰는 3단계"
        paragraphs={[
          "1단계는 성씨·성별 기준으로 후보 흐름을 확인하는 것입니다. 2단계는 네임핏에서 실제 입력 후 2~3개 후보를 압축하는 것입니다. 3단계는 가족이 직접 불러 보며 최종 합의하는 것입니다.",
          "필요하면 이 결과를 바탕으로 추가 상담을 받는 것도 가능합니다. 중요한 건 어떤 도구를 쓰든 최종 기준은 가족의 실사용 만족도라는 점입니다.",
        ]}
      />

      <LinkCardGrid title="관련 페이지" links={relatedLinks} />

      <FaqSection items={faqItems} />

      <NoteSection text="이 문서는 특정 방식을 우열로 판단하지 않습니다. 최종 이름은 가족의 선호와 실제 사용 경험을 중심으로 결정하는 것이 가장 중요합니다." />

      <ServiceEntryCtaSection entryKey="guide-namefit-vs-naming-office" />
    </SeoPageShell>
  );
}
