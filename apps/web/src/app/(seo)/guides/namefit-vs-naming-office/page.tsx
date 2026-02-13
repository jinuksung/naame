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
    question: "네임핏과 작명소는 어떤 점이 다른가요?",
    answer:
      "네임핏은 사용자가 직접 입력하고 결과를 비교하는 셀프 탐색형 서비스입니다. 작명소는 상담 과정을 통해 전문가와 함께 의사결정을 진행하는 방식이라는 점에서 접근이 다릅니다.",
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
      "작명소 상담형 방식과 네임핏 셀프 탐색형 방식의 차이를 포지셔닝 관점에서 정리했습니다. 사용자 상황에 맞는 선택 기준과 추천 활용 방법을 확인해 보세요.",
    pathname: "/guides/namefit-vs-naming-office",
  });
}

export default function NamefitVsNamingOfficePage(): JSX.Element {
  return (
    <SeoPageShell
      title="작명소와 네임핏의 차이"
      description="상담형 서비스와 셀프 추천형 서비스의 특징을 중립적으로 비교해 선택 기준을 안내합니다."
    >
      <ParagraphSection
        title="포지셔닝 비교"
        paragraphs={[
          "작명소와 네임핏은 이름을 정하는 과정에서 역할이 다릅니다. 작명소는 상담을 중심으로 진행되어 전문가와 대화를 통해 후보를 좁히는 방식에 가깝습니다. 반면 네임핏은 사용자가 성씨, 성별, 생년월일을 직접 입력하고 결과를 비교하면서 스스로 기준을 정리하는 셀프 탐색형 구조입니다. 두 방식은 경쟁 관계라기보다, 의사결정 스타일에 따라 선택할 수 있는 서로 다른 도구로 이해하는 것이 적절합니다.",
          "시간과 진행 방식도 차이가 있습니다. 네임핏은 원하는 시간에 반복해서 후보를 확인하고 내부 링크를 통해 조건별 페이지를 오가며 검토할 수 있습니다. 상담형 방식은 대화를 통한 해석과 조언이 강점일 수 있습니다. 따라서 사용자는 본인의 선호에 따라 빠른 탐색 중심인지, 상담 중심인지 먼저 정한 뒤 선택하면 됩니다.",
        ]}
      />

      <ParagraphSection
        title="네임핏을 활용하는 방법"
        paragraphs={[
          "네임핏을 사용할 때는 결과를 단일 답안처럼 보지 않고, 비교용 후보 목록으로 활용하는 것이 좋습니다. 먼저 성씨와 성별 조합 페이지에서 후보 흐름을 확인하고, 추천 시작 화면에서 생년월일 정보를 포함해 결과를 받아 보세요. 이후 가족과 함께 발음, 의미, 표기 편의성을 점검하면 선택 기준이 구체화됩니다.",
          "필요하다면 네임핏 결과를 정리한 뒤 추가 상담이나 주변 의견을 참고하는 방법도 가능합니다. 중요한 점은 어떤 방식을 쓰든 최종 이름은 가족이 실제로 만족할 수 있는지 확인하는 과정이라는 점입니다.",
        ]}
      />

      <LinkCardGrid title="관련 페이지" links={relatedLinks} />

      <FaqSection items={faqItems} />

      <NoteSection text="이 문서는 특정 방식을 우열로 판단하지 않습니다. 최종 이름은 가족의 선호와 실제 사용 경험을 중심으로 결정하는 것이 가장 중요합니다." />
    </SeoPageShell>
  );
}
