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
    question: "2026 최신 이름 트렌드 페이지는 무엇을 보여주나요?",
    answer:
      "2026년 기준으로 예비 부모가 많이 찾는 이름 탐색 흐름을 정리합니다. 단순 유행 나열이 아니라, 실제 후보 비교로 넘어가는 방법까지 안내합니다.",
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
      "2026 이름 트렌드 핵심 포인트와 실전 선택 기준을 함께 정리했습니다. 유행을 참고하되 네임핏에서 우리 가족 기준으로 후보를 압축해 보세요.",
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
      description="유행을 참고하되 휩쓸리지 않게, 2026 트렌드를 실사용 기준으로 해석하는 가이드입니다."
    >
      <ParagraphSection
        title="트렌드는 참고, 기준은 필수"
        paragraphs={[
          "트렌드를 보는 목적은 '요즘 인기 이름 따라 하기'가 아니라 현재 감도를 파악하는 데 있습니다. 유행 이름은 첫인상이 좋지만, 우리 성씨와 만나면 느낌이 달라질 수 있습니다. 그래서 트렌드 확인 다음 단계가 더 중요합니다.",
          "권장 순서는 간단합니다. 트렌드 샘플로 방향을 잡고, 성별/성씨 조건으로 좁히고, 마지막에 네임핏에서 실제 입력으로 검증하세요. 이렇게 하면 유행성과 실사용성 사이에서 균형 잡힌 결정을 내릴 수 있습니다.",
        ]}
      />

      <NameChipList title="2026 탐색용 이름 샘플" names={trendSamples} />

      <LinkCardGrid title="관련 페이지 이동" links={relatedLinks} />

      <FaqSection items={faqItems} />

      <NoteSection text="트렌드 키워드는 후보 탐색을 돕는 시작점입니다. 최종 이름은 가족의 선호와 실제 사용 느낌을 중심으로 결정해 주세요." />

      <ServiceEntryCtaSection entryKey="trends-2026" />
    </SeoPageShell>
  );
}
