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
    description: `${label} 이름 추천 흐름을 네임핏 랜딩에서 확인하세요. 성씨와 생년월일 정보를 함께 입력해 이름 후보를 비교하는 방법과 관련 상세 페이지 이동 경로를 안내합니다.`,
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
      answer: `${label} 기준의 대표 이름 샘플, 성씨 결합 페이지로 가는 내부 링크, 추천을 읽는 순서를 제공합니다. 성별 기준으로 먼저 후보군을 이해하고 성씨 페이지로 확장할 수 있습니다.`,
    },
    {
      question: "성씨 정보 없이도 이 페이지를 참고할 수 있나요?",
      answer:
        "가능합니다. 다만 실제 추천에서는 성씨 입력이 함께 필요하므로, 페이지 하단의 성씨 관련 링크를 통해 조합 페이지를 함께 보는 것이 좋습니다.",
    },
    {
      question: "추천 샘플은 어떤 기준으로 선택되나요?",
      answer:
        "샘플은 성별 기준 이름 풀에서 고정 규칙으로 선정됩니다. 같은 페이지를 다시 방문해도 동일한 샘플을 확인할 수 있어 비교에 유리합니다.",
    },
    {
      question: "생년월일 정보는 어디에서 입력하나요?",
      answer:
        "생년월일은 실제 추천 시작 페이지에서 입력합니다. 이 페이지에서는 성별 기준 이해를 돕고 관련 페이지로 연결하는 역할을 합니다.",
    },
    {
      question: "최종 선택 시 어떤 점을 확인하면 좋나요?",
      answer:
        "가족이 자주 부를 때의 발음 편안함, 표기 편의성, 가족 선호를 함께 살펴 최종 후보를 정리하는 방법을 권장합니다.",
    },
  ];

  return (
    <SeoPageShell
      title={`${label} 이름 추천 랜딩`}
      description={`${label} 기준으로 이름 추천 흐름을 확인하고 성씨 조합 페이지로 이동할 수 있습니다.`}
    >
      <ParagraphSection
        title={`${label} 추천을 읽는 기준`}
        paragraphs={[
          `${label} 이름 추천 페이지는 성별 기준으로 후보군을 먼저 파악하려는 사용자를 위한 랜딩입니다. 성별 기준을 먼저 확인하면 이름의 톤과 발음 분위기를 빠르게 정리할 수 있고, 이후 성씨 조합 페이지에서 더 구체적인 후보 비교를 진행하기 쉽습니다. 이 페이지는 성별 중심 정보를 제공하면서도 다음 탐색 단계로 연결되는 링크 구조를 함께 제공합니다.`,
          `실제 추천을 받을 때는 성별만 입력하는 것이 아니라 성씨와 생년월일 정보까지 함께 입력해 결과를 확인합니다. 성별 페이지는 출발점이고, 성씨 조합 페이지와 추천 시작 화면으로 이어지는 동선을 통해 사용자 스스로 기준을 확장할 수 있도록 설계했습니다. 특정 이름을 확정하기보다 여러 후보를 비교해 가족이 납득할 수 있는 선택을 돕는 것이 목적입니다.`,
        ]}
      />

      <NameChipList title={`${label} 대표 샘플 이름`} names={sampleNames} />

      <LinkCardGrid title="관련 페이지 이동" links={buildGenderRelatedLinks(gender)} />

      <FaqSection items={faqItems} />

      <NoteSection text="성별 랜딩은 후보 탐색을 위한 시작점입니다. 최종 이름은 성씨 결합, 실제 발음, 가족의 선호를 함께 확인한 뒤 결정해 주세요." />
    </SeoPageShell>
  );
}
