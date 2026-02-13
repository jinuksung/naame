import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { buildSeoMetadata } from "@/seo/buildMeta";
import { FaqItem } from "@/seo/faqJsonLd";
import { buildSurnameRelatedLinks, guideLinks } from "@/seo/internalLinks";
import { pickDeterministicNames } from "@/seo/sampleNames";
import { requireValidSurnameParam } from "@/seo/routeParams";
import { TOP_SURNAMES, isIndexableSurname, isValidSurnameParam } from "@/seo/seoConfig";
import {
  FaqSection,
  LinkCardGrid,
  NameChipList,
  NoteSection,
  ParagraphSection,
  SeoPageShell,
} from "@/seo/seoComponents";

interface SurnamePageProps {
  params: {
    surname: string;
  };
}

export function generateStaticParams(): Array<{ surname: string }> {
  return TOP_SURNAMES.map((surname) => ({ surname }));
}

export async function generateMetadata({
  params,
}: SurnamePageProps): Promise<Metadata> {
  const surname = params.surname.trim();
  if (!isValidSurnameParam(surname)) {
    notFound();
  }

  return buildSeoMetadata({
    title: `${surname} 아기 이름 추천 | 네임핏`,
    description: `${surname} 성씨와 어울리는 이름 추천 흐름을 네임핏 랜딩에서 확인하세요. 성별, 생년월일 정보와 함께 이름 후보를 비교하는 방법과 관련 페이지 이동 경로를 안내합니다.`,
    pathname: `/surname/${surname}`,
    noIndex: !isIndexableSurname(surname),
  });
}

export default function SurnameLandingPage({
  params,
}: SurnamePageProps): JSX.Element {
  const surname = requireValidSurnameParam(params.surname);
  const sampleNames = pickDeterministicNames({
    routeKey: "surname",
    surname,
    count: 10,
  });

  const faqItems: FaqItem[] = [
    {
      question: `${surname} 성씨 페이지는 어떤 정보를 제공하나요?`,
      answer: `${surname} 성씨를 기준으로 이름 추천을 읽는 방법, 남아/여아 조합 페이지 이동 링크, 대표 이름 샘플을 제공합니다. 성씨 중심으로 후보를 비교하고 다음 단계로 이동하기 쉽도록 구성했습니다.`,
    },
    {
      question: `${surname} 성씨와 성별 정보를 함께 봐야 하나요?`,
      answer:
        "네. 성씨 페이지는 출발점이며, 성별 조합 페이지로 이동하면 같은 성씨에서 남아/여아 기준을 나눠 더 구체적으로 확인할 수 있습니다.",
    },
    {
      question: "생년월일 정보는 어디서 반영되나요?",
      answer:
        "실제 추천 화면에서 성씨와 성별 입력 후 생년월일 정보를 함께 입력하면, 후보 비교에 필요한 설명을 확인할 수 있습니다.",
    },
    {
      question: "샘플 이름은 매번 바뀌나요?",
      answer:
        "아니요. 이 페이지의 샘플 이름은 성씨 기준으로 고정 규칙에 따라 선정되어 같은 URL에서는 동일한 샘플을 보여줍니다.",
    },
    {
      question: "최종 이름은 어떻게 확정하면 좋을까요?",
      answer:
        "랜딩 페이지와 추천 결과를 참고한 뒤 가족이 실제로 불러 보며 선호도를 확인해 결정하는 방식을 권장합니다.",
    },
  ];

  const relatedLinks = [...buildSurnameRelatedLinks(surname), ...guideLinks];

  return (
    <SeoPageShell
      title={`${surname} 성씨와 어울리는 이름 추천`}
      description={`${surname} 성씨 기준으로 이름 추천을 읽는 방법과 남아/여아 조합 페이지 이동 경로를 함께 안내합니다.`}
    >
      <ParagraphSection
        title={`${surname} 성씨 기준 추천 흐름`}
        paragraphs={[
          `${surname} 성씨 이름 추천 페이지는 성씨를 중심으로 추천 과정을 이해하려는 사용자를 위한 랜딩입니다. 먼저 성씨와 이름의 발음 연결을 확인하고, 같은 성씨에서 성별 기준을 나눠 후보를 비교할 수 있도록 내부 링크를 제공합니다. 성씨 기반으로 출발하면 추천 결과를 읽을 때 어떤 후보가 자연스럽게 느껴지는지 빠르게 정리할 수 있습니다.`,
          `실제 추천 단계에서는 ${surname} 성씨와 함께 성별, 생년월일 정보를 순서대로 입력하면 됩니다. 성씨 페이지에서 미리 후보 분위기를 파악한 뒤 조합 페이지로 이동하면 비교가 더 수월합니다. 특정 후보를 단정하기보다 여러 이름을 나란히 놓고 발음, 의미, 사용 편의를 함께 보는 방식이 실사용에 적합합니다.`,
        ]}
      />

      <NameChipList title={`${surname} 성씨 대표 샘플 이름`} names={sampleNames} />

      <LinkCardGrid title="관련 페이지 이동" links={relatedLinks} />

      <FaqSection items={faqItems} />

      <NoteSection text="추천 결과와 샘플은 후보를 좁히기 위한 참고 자료입니다. 최종 이름은 가족이 직접 발음해 본 느낌과 선호를 중심으로 결정해 주세요." />
    </SeoPageShell>
  );
}
