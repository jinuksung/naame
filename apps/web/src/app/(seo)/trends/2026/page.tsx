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
    question: "2026 최신 이름 트렌드 페이지는 무엇을 보여주나요?",
    answer:
      "2026년 기준으로 자주 찾는 이름 탐색 흐름을 이해하기 위한 소개 페이지입니다. 성씨, 성별, 생년월일을 함께 입력하는 추천 방식과 관련 랜딩 이동 경로를 안내합니다.",
  },
  {
    question: "트렌드 페이지의 이름 목록은 확정 순위인가요?",
    answer:
      "아니요. 이 페이지의 목록은 탐색용 샘플입니다. 실제 이름 선택은 성씨 결합, 가족 선호, 발음 편의성을 함께 확인하며 진행하는 것이 좋습니다.",
  },
  {
    question: "남자/여자 기준으로 나눠서 볼 수 있나요?",
    answer:
      "가능합니다. 남자 이름 추천, 여자 이름 추천 페이지로 이동하면 성별 중심으로 후보를 다시 확인할 수 있습니다.",
  },
  {
    question: "성씨 기준 페이지와 같이 보면 어떤 점이 좋나요?",
    answer:
      "같은 이름도 성씨가 달라지면 부르는 느낌이 달라질 수 있습니다. 성씨 랜딩으로 이동해 결합 느낌을 함께 확인하면 후보를 더 정확히 비교할 수 있습니다.",
  },
  {
    question: "최종 이름은 어떻게 결정하면 좋나요?",
    answer:
      "트렌드 페이지는 시작점으로 활용하고, 가족이 실제로 불러 봤을 때의 편안함과 선호를 중심으로 최종 이름을 정하는 것을 권장합니다.",
  },
];

const relatedLinks: InternalLinkCard[] = [
  {
    href: "/names",
    title: "이름 추천 시작 안내",
    description: "성씨·성별·생년월일 입력 흐름을 확인하고 추천을 시작합니다.",
  },
  {
    href: "/gender/M",
    title: "남자 이름 추천",
    description: "남자 기준 이름 샘플과 관련 페이지를 확인합니다.",
  },
  {
    href: "/gender/F",
    title: "여자 이름 추천",
    description: "여자 기준 이름 샘플과 관련 페이지를 확인합니다.",
  },
  {
    href: "/pretty",
    title: "예쁜 이름 추천",
    description: "발음과 의미를 함께 보기 좋은 이름 랜딩을 확인합니다.",
  },
  {
    href: "/seo",
    title: "SEO 허브",
    description: "성씨별/성별별/가이드 랜딩을 한 번에 탐색합니다.",
  },
];

export async function generateMetadata(): Promise<Metadata> {
  return buildSeoMetadata({
    title: "2026 최신 이름 트렌드 | 네임핏",
    description:
      "2026 최신 이름 트렌드 키워드로 자주 찾는 이름 탐색 흐름을 확인하세요. 성씨, 성별, 생년월일 기반 추천으로 이어지는 내부 링크와 비교 기준을 함께 안내합니다.",
    pathname: "/trends/2026",
  });
}

export default function NameTrends2026Page(): JSX.Element {
  const trendSamples = pickDeterministicNames({
    routeKey: "trends-2026",
    count: 12,
  });

  return (
    <SeoPageShell
      title="2026 최신 이름 트렌드"
      description="2026년 기준 검색 사용자가 자주 찾는 이름 탐색 흐름을 정리한 SEO 랜딩입니다."
    >
      <ParagraphSection
        title="2026 트렌드 키워드로 탐색하는 방법"
        paragraphs={[
          "2026 최신 이름 트렌드 키워드는 이름을 정하기 전에 전체 분위기를 빠르게 파악하려는 사용자에게 자주 사용됩니다. 이 페이지는 단순한 목록 나열보다, 트렌드 키워드에서 실제 추천 흐름으로 자연스럽게 넘어갈 수 있도록 구조를 설계했습니다. 먼저 대표 샘플 이름을 확인하고, 이후 성별 페이지와 성씨 페이지로 확장하면 탐색 기준이 정리됩니다.",
          "실제 추천 단계에서는 성씨, 성별, 생년월일 정보를 함께 입력해 후보를 비교합니다. 트렌드 키워드는 출발점이고, 최종 후보를 정할 때는 가족이 자주 부르는 상황을 기준으로 발음과 사용 편의를 함께 살펴보는 것이 중요합니다. 이 페이지의 내부 링크를 따라 이동하면 비교 기준을 잃지 않고 다음 단계로 이어갈 수 있습니다.",
        ]}
      />

      <NameChipList title="2026 탐색용 이름 샘플" names={trendSamples} />

      <LinkCardGrid title="관련 페이지 이동" links={relatedLinks} />

      <FaqSection items={faqItems} />

      <NoteSection text="트렌드 키워드는 후보 탐색을 돕는 시작점입니다. 최종 이름은 가족의 선호와 실제 사용 느낌을 중심으로 결정해 주세요." />
    </SeoPageShell>
  );
}
