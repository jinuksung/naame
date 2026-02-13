import type { Metadata } from "next";
import { buildSeoMetadata } from "@/seo/buildMeta";
import { FaqItem } from "@/seo/faqJsonLd";
import type { InternalLinkCard } from "@/seo/internalLinks";
import { pickDeterministicNames } from "@/seo/sampleNames";
import {
  FaqSection,
  LinkCardGrid,
  NameChipList,
  NoteSection,
  ParagraphSection,
  SeoPageShell,
} from "@/seo/seoComponents";

const faqItems: FaqItem[] = [
  {
    question: "예쁜 이름 추천 페이지는 어떤 기준으로 보나요?",
    answer:
      "예쁜 이름 추천은 발음의 자연스러움, 의미 해석, 일상 사용 편의를 함께 보며 후보를 비교하는 방식으로 안내합니다. 특정 기준 하나로 확정하기보다 균형 있게 검토하는 것이 핵심입니다.",
  },
  {
    question: "남자/여자 구분 없이 볼 수 있나요?",
    answer:
      "이 페이지는 전체 탐색용으로 구성되어 성별 구분 없이 볼 수 있습니다. 필요하면 남자 이름 추천, 여자 이름 추천 페이지로 이동해 성별 기준을 추가로 확인할 수 있습니다.",
  },
  {
    question: "성씨와 함께 확인하는 게 왜 중요한가요?",
    answer:
      "같은 이름도 성씨에 따라 부르는 느낌이 달라질 수 있기 때문입니다. 성씨 페이지와 조합 페이지를 함께 보면 실사용 관점에서 후보를 더 정확히 비교할 수 있습니다.",
  },
  {
    question: "예쁜 이름 샘플은 매번 바뀌나요?",
    answer:
      "아니요. 샘플은 고정 규칙으로 선정되어 같은 URL에서 동일한 예시를 확인할 수 있습니다. 페이지를 다시 방문해도 비교 기준을 유지할 수 있습니다.",
  },
  {
    question: "최종 이름 결정 시 가장 중요한 점은 무엇인가요?",
    answer:
      "가족이 실제로 불러 보았을 때 편안한지, 표기와 호칭이 일상에서 자연스러운지 확인하는 과정이 가장 중요합니다.",
  },
];

const relatedLinks: InternalLinkCard[] = [
  {
    href: "/names",
    title: "이름 추천 시작 안내",
    description: "성씨, 성별, 생년월일 입력 흐름을 확인하고 실제 추천으로 이동합니다.",
  },
  {
    href: "/gender/M",
    title: "남자 이름 추천",
    description: "남자 기준으로 이름 후보를 더 구체적으로 확인합니다.",
  },
  {
    href: "/gender/F",
    title: "여자 이름 추천",
    description: "여자 기준으로 이름 후보를 더 구체적으로 확인합니다.",
  },
  {
    href: "/trends/2026",
    title: "2026 최신 이름 트렌드",
    description: "2026년 키워드 중심 탐색 페이지에서 흐름을 비교합니다.",
  },
  {
    href: "/seo",
    title: "SEO 허브",
    description: "성씨별, 성별별, 가이드 랜딩으로 빠르게 이동합니다.",
  },
];

export async function generateMetadata(): Promise<Metadata> {
  return buildSeoMetadata({
    title: "예쁜 이름 추천 | 네임핏",
    description:
      "예쁜 이름 추천 키워드로 발음과 의미를 함께 비교해 보세요. 성씨, 성별, 생년월일 기반 추천으로 이어지는 내부 링크와 탐색 흐름을 네임핏 랜딩에서 안내합니다.",
    pathname: "/pretty",
  });
}

export default function PrettyNamesPage(): JSX.Element {
  const prettySamples = pickDeterministicNames({
    routeKey: "pretty",
    count: 12,
  });

  return (
    <SeoPageShell
      title="예쁜 이름 추천"
      description="발음과 의미를 함께 보며 예쁜 이름 후보를 비교할 수 있는 SEO 랜딩 페이지입니다."
    >
      <ParagraphSection
        title="예쁜 이름을 찾을 때의 기본 흐름"
        paragraphs={[
          "예쁜 이름 추천 키워드는 이름의 느낌을 먼저 살펴보고 싶은 사용자에게 자주 쓰입니다. 다만 느낌만으로 바로 확정하기보다 성씨 결합, 발음 자연스러움, 일상 사용 편의를 함께 보면 실제 만족도가 높아집니다. 이 페이지는 검색 유입 사용자가 그 흐름을 이해하고 다음 단계로 이동할 수 있도록 구성했습니다.",
          "먼저 샘플 이름으로 분위기를 파악한 뒤, 남자/여자 페이지나 성씨 조합 페이지로 이동해 조건을 좁혀 보세요. 마지막에는 성씨, 성별, 생년월일을 입력하는 추천 화면으로 이어지며, 비교 가능한 후보를 확인할 수 있습니다. 이렇게 단계적으로 탐색하면 가족이 납득할 수 있는 기준으로 최종 후보를 정리하기 쉽습니다.",
        ]}
      />

      <NameChipList title="예쁜 이름 탐색 샘플" names={prettySamples} />

      <LinkCardGrid title="관련 페이지 이동" links={relatedLinks} />

      <FaqSection items={faqItems} />

      <NoteSection text="예쁜 이름 추천은 후보 탐색을 위한 안내입니다. 최종 이름은 가족의 선호와 실제 사용감을 기준으로 신중히 결정해 주세요." />
    </SeoPageShell>
  );
}
