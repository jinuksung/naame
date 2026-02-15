import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { buildSeoMetadata } from "@/seo/buildMeta";
import { FaqItem } from "@/seo/faqJsonLd";
import { buildGenderRelatedLinks } from "@/seo/internalLinks";
import { requireGenderParam } from "@/seo/routeParams";
import { pickDeterministicNames } from "@/seo/sampleNames";
import {
  GENDER_PARAMS,
  genderLabel,
  normalizeGenderParam,
} from "@/seo/seoConfig";
import {
  FaqSection,
  LinkCardGrid,
  NameChipList,
  NoteSection,
  ParagraphSection,
  SeoPageShell,
  ServiceEntryCtaSection,
} from "@/seo/seoComponents";

interface GenderPageProps {
  params: {
    gender: string;
  };
}

export function generateStaticParams(): Array<{ gender: string }> {
  return GENDER_PARAMS.map((gender) => ({ gender }));
}

export async function generateMetadata({
  params,
}: GenderPageProps): Promise<Metadata> {
  const normalizedGender = normalizeGenderParam(params.gender);
  if (!normalizedGender) {
    notFound();
  }

  const label = genderLabel(normalizedGender);

  return buildSeoMetadata({
    title: `${label} 이름 추천 | 네임핏`,
    description: `${label} 이름 추천이 막막한 예비 부모를 위한 가이드입니다. 성씨·생년월일 기준까지 연결해 네임핏에서 후보를 빠르게 비교해 보세요.`,
    pathname: `/gender/${normalizedGender}`,
  });
}

export default function GenderLandingPage({
  params,
}: GenderPageProps): JSX.Element {
  const gender = requireGenderParam(params.gender);
  const label = genderLabel(gender);
  const sampleNames = pickDeterministicNames({
    routeKey: "gender",
    gender,
    count: 10,
  });

  const faqItems: FaqItem[] = [
    {
      question: `${label} 추천 페이지에서는 무엇을 볼 수 있나요?`,
      answer: `${label} 기준의 대표 샘플과 다음 단계 동선을 확인할 수 있습니다. 성별 기준으로 출발해 성씨 조합까지 확장하면 후보 압축이 쉬워집니다.`,
    },
    {
      question: "성씨 정보 없이도 이 페이지를 참고할 수 있나요?",
      answer:
        "가능합니다. 다만 최종 결정 품질을 높이려면 성씨를 함께 보는 것이 좋습니다. 실제 추천 단계에서는 성씨 입력까지 포함해 확인하세요.",
    },
    {
      question: "추천 샘플은 어떤 기준으로 선택되나요?",
      answer:
        "성별 기준 이름 풀에서 고정 규칙으로 선택됩니다. 같은 페이지에서는 같은 샘플이 유지되어 재방문 비교에 유리합니다.",
    },
    {
      question: "생년월일 정보는 어디에서 입력하나요?",
      answer:
        "네임핏 추천 시작 화면에서 입력합니다. 이 페이지는 성별 기준을 먼저 정리하고, 실제 입력 단계로 자연스럽게 넘어가게 돕습니다.",
    },
    {
      question: "최종 선택 시 어떤 점을 확인하면 좋나요?",
      answer:
        "가족이 자주 부를 때 편한지, 성씨와 붙였을 때 어색하지 않은지, 의미가 납득되는지를 함께 확인하세요.",
    },
  ];

  return (
    <SeoPageShell
      title={`${label} 이름 추천 랜딩`}
      description={`${label} 기준으로 빠르게 후보를 정리하고, 성씨 조합·추천 시작까지 이어지는 실전 흐름을 안내합니다.`}
    >
      <ParagraphSection
        title={`${label} 이름 추천, 이렇게 보면 결정이 빨라집니다`}
        paragraphs={[
          `${label} 이름 추천에서 흔한 실수는 분위기만 보고 바로 확정하는 것입니다. 먼저 성별 기준으로 톤을 잡고, 그다음 성씨 조합으로 좁히는 순서가 효율적입니다. 이렇게 보면 후보를 빠르게 압축할 수 있습니다.`,
          `최종 비교는 네임핏에서 성씨·성별·생년월일을 함께 입력해 진행하세요. 결과를 단일 답안으로 보기보다 후보 비교판으로 읽으면 가족 합의가 훨씬 쉬워집니다.`,
        ]}
      />

      <NameChipList title={`${label} 대표 샘플 이름`} names={sampleNames} />

      <LinkCardGrid title="관련 페이지 이동" links={buildGenderRelatedLinks(gender)} />

      <FaqSection items={faqItems} />

      <NoteSection text="성별 랜딩은 후보 탐색을 위한 시작점입니다. 최종 이름은 성씨 결합, 실제 발음, 가족의 선호를 함께 확인한 뒤 결정해 주세요." />

      <ServiceEntryCtaSection entryKey={`gender-${gender}`} />
    </SeoPageShell>
  );
}
