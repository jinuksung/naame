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
  ServiceEntryCtaSection,
} from "@/seo/seoComponents";

const faqItems: FaqItem[] = [
  {
    question: "예쁜 이름 추천 페이지는 어떤 기준으로 보나요?",
    answer:
      "예쁜 느낌만 보지 않고 발음, 의미, 실사용 편의를 함께 보는 기준으로 안내합니다. 핵심은 '첫인상'과 '평생 사용성'의 균형입니다.",
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
      "예비 부모를 위한 예쁜 이름 가이드입니다. 감성만이 아니라 성씨 조합, 의미, 사용성까지 함께 비교해 네임핏에서 후보를 정리해 보세요.",
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
      description="예쁜 이름을 찾되, 실제로 오래 쓰기 좋은 이름을 고를 수 있도록 비교 기준을 정리한 가이드입니다."
    >
      <ParagraphSection
        title="예쁜 이름, 느낌만으로 고르면 왜 후회할까?"
        paragraphs={[
          "많은 부모가 '예쁜 이름'을 검색하면서 시작하지만, 마지막 결정에서 다시 막힙니다. 이유는 간단합니다. 예쁨은 출발점이지, 결정 기준이 아니기 때문입니다. 실제로는 성씨와의 조합, 매일 부를 때의 리듬, 뜻의 납득 가능성이 함께 맞아야 만족도가 높습니다.",
          "좋은 방법은 먼저 분위기 후보를 넓게 보고, 그다음 기준으로 좁히는 것입니다. 감성으로 시작하되 기준으로 끝내야 합니다. 이 페이지는 그 과정을 빠르게 정리하고 바로 추천으로 연결되도록 설계했습니다.",
        ]}
      />

      <NameChipList title="예쁜 이름 탐색 샘플" names={prettySamples} />

      <LinkCardGrid title="관련 페이지 이동" links={relatedLinks} />

      <FaqSection items={faqItems} />

      <NoteSection text="예쁜 이름 추천은 후보 탐색을 위한 안내입니다. 최종 이름은 가족의 선호와 실제 사용감을 기준으로 신중히 결정해 주세요." />

      <ServiceEntryCtaSection entryKey="pretty" />
    </SeoPageShell>
  );
}
