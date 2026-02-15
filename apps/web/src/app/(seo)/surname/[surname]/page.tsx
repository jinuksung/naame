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
  ServiceEntryCtaSection,
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
    title: `${surname}씨 이름 추천 | 네임핏`,
    description: `${surname} 성씨 이름 추천이 막막한 예비 부모를 위한 가이드입니다. 성별·생년월일 기준을 함께 확인하고 네임핏에서 후보를 빠르게 비교해 보세요.`,
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
      answer: `${surname} 성씨 기준으로 이름 후보를 좁히는 방법을 안내합니다. 대표 샘플, 남아/여아 조합 링크, 추천 시작 동선을 한 번에 확인할 수 있습니다.`,
    },
    {
      question: `${surname} 성씨와 성별 정보를 함께 봐야 하나요?`,
      answer:
        "네. 같은 이름도 성별 기준에 따라 느낌과 선호가 달라집니다. 성씨 페이지에서 출발해 성별 조합으로 좁히면 결정 속도가 훨씬 빨라집니다.",
    },
    {
      question: "생년월일 정보는 어디서 반영되나요?",
      answer:
        "네임핏 추천 시작 화면에서 반영됩니다. 성씨와 성별을 먼저 정한 뒤 생년월일을 입력하면, 후보별 설명을 더 선명하게 비교할 수 있습니다.",
    },
    {
      question: "샘플 이름은 매번 바뀌나요?",
      answer:
        "아니요. 같은 URL에서는 동일한 샘플을 보여 줍니다. 다시 방문해도 같은 기준으로 후보를 비교할 수 있습니다.",
    },
    {
      question: "최종 이름은 어떻게 확정하면 좋을까요?",
      answer:
        "후보를 2~3개로 압축한 뒤 가족이 직접 불러 보며 결정하는 방식을 권장합니다. 발음 편안함, 의미 납득도, 표기 편의성을 함께 확인하세요.",
    },
  ];

  const relatedLinks = [...buildSurnameRelatedLinks(surname), ...guideLinks];

  return (
    <SeoPageShell
      title={`${surname} 성씨와 어울리는 이름 추천`}
      description={`${surname} 성씨에서 시작해 우리 가족에게 맞는 이름 후보를 빠르게 정리할 수 있도록 실전 기준을 안내합니다.`}
    >
      <ParagraphSection
        title={`${surname} 성씨, 먼저 무엇부터 보면 좋을까요?`}
        paragraphs={[
          `${surname} 성씨로 시작하는 이름 추천에서 가장 중요한 건 '많이 보는 것'보다 '빨리 좁히는 것'입니다. 먼저 성과 이름이 붙었을 때 부르기 편한지를 확인하세요. 그다음 남아/여아 기준으로 나눠 보면 후보가 훨씬 선명해집니다.`,
          `이후 네임핏에서 성씨·성별·생년월일을 입력하면 실제 비교 가능한 후보를 바로 확인할 수 있습니다. 핵심은 한 번에 정답을 찾는 것이 아니라, 가족이 납득할 수 있는 2~3개 후보를 만드는 것입니다.`,
        ]}
      />

      <NameChipList title={`${surname} 성씨 대표 샘플 이름`} names={sampleNames} />

      <LinkCardGrid title="관련 페이지 이동" links={relatedLinks} />

      <FaqSection items={faqItems} />

      <NoteSection text="추천 결과와 샘플은 후보를 좁히기 위한 참고 자료입니다. 최종 이름은 가족이 직접 발음해 본 느낌과 선호를 중심으로 결정해 주세요." />

      <ServiceEntryCtaSection entryKey={`surname-${surname}`} />
    </SeoPageShell>
  );
}
