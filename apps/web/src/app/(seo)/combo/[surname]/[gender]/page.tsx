import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { buildSeoMetadata } from "@/seo/buildMeta";
import { FaqItem } from "@/seo/faqJsonLd";
import { buildComboRelatedLinks } from "@/seo/internalLinks";
import { requireGenderParam, requireValidSurnameParam } from "@/seo/routeParams";
import { pickDeterministicNames } from "@/seo/sampleNames";
import {
  GENDER_PARAMS,
  TOP_SURNAMES,
  genderLabel,
  isIndexableSurname,
  isValidSurnameParam,
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

interface ComboPageProps {
  params: {
    surname: string;
    gender: string;
  };
}

export function generateStaticParams(): Array<{ surname: string; gender: string }> {
  return TOP_SURNAMES.flatMap((surname) =>
    GENDER_PARAMS.map((gender) => ({
      surname,
      gender,
    })),
  );
}

export async function generateMetadata({
  params,
}: ComboPageProps): Promise<Metadata> {
  const surname = params.surname.trim();
  const gender = normalizeGenderParam(params.gender);
  if (!isValidSurnameParam(surname) || !gender) {
    notFound();
  }

  const label = genderLabel(gender);
  return buildSeoMetadata({
    title: `${surname}씨 ${label} 이름 추천 | 네임핏`,
    description: `${surname}씨 ${label} 이름 추천을 위한 실전 가이드입니다. 성씨 결합과 생년월일 기준까지 반영해 네임핏에서 후보를 빠르게 비교해 보세요.`,
    pathname: `/combo/${surname}/${gender}`,
    noIndex: !isIndexableSurname(surname),
  });
}

export default function ComboLandingPage({
  params,
}: ComboPageProps): JSX.Element {
  const surname = requireValidSurnameParam(params.surname);
  const gender = requireGenderParam(params.gender);
  const label = genderLabel(gender);
  const sampleNames = pickDeterministicNames({
    routeKey: "combo",
    surname,
    gender,
    count: 10,
  });

  const faqItems: FaqItem[] = [
    {
      question: `${surname}씨 ${label} 이름 추천 페이지는 어떤 사용자에게 적합한가요?`,
      answer: `${surname}씨 ${label}처럼 조건이 이미 어느 정도 정리된 예비 부모에게 적합합니다. 바로 후보를 좁혀 보고 싶은 경우 가장 효율적인 시작점입니다.`,
    },
    {
      question: "같은 성씨에서 다른 성별도 비교할 수 있나요?",
      answer:
        "네. 같은 성씨의 반대 성별 조합으로 바로 이동할 수 있습니다. 후보 톤 차이를 빠르게 비교할 때 유용합니다.",
    },
    {
      question: "생년월일 입력은 왜 필요한가요?",
      answer:
        "실제 추천에서 후보 설명을 더 구체적으로 읽기 위해 필요합니다. 이 페이지는 조합 기준을 잡고 추천 시작으로 넘어가는 역할을 합니다.",
    },
    {
      question: "샘플 이름은 랜덤인가요?",
      answer:
        "아니요. 성씨+성별 조합 기준으로 고정되어 같은 URL에서는 같은 샘플을 보여줍니다.",
    },
    {
      question: "최종 이름 확정 전에 무엇을 확인해야 하나요?",
      answer:
        "가족이 직접 불러 봤을 때 자연스러운지, 표기와 의미가 모두 납득되는지 확인하세요. 최종 후보는 2~3개로 압축해 비교하는 것이 좋습니다.",
    },
  ];

  return (
    <SeoPageShell
      title={`${surname}씨 ${label} 이름 추천`}
      description={`${surname}씨와 ${label} 조건을 동시에 반영해, 실제 선택에 바로 쓸 수 있는 후보 비교 흐름을 제공합니다.`}
    >
      <ParagraphSection
        title={`${surname}씨 ${label} 조합, 왜 먼저 보는 게 좋을까요?`}
        paragraphs={[
          `${surname}씨 ${label}처럼 조건을 먼저 고정하면 이름 선택이 훨씬 빨라집니다. 성씨와 성별이 정해진 상태에서 비교하면 발음과 분위기 차이가 바로 보이기 때문입니다. 특히 가족 내 의견이 갈릴 때, 이 방식이 합의 속도를 높여 줍니다.`,
          `다음 단계는 네임핏에서 생년월일까지 입력해 후보를 검증하는 것입니다. 추천 결과를 단일 정답이 아니라 비교 도구로 활용하면, 우리 가족에게 맞는 이름을 더 안정적으로 고를 수 있습니다.`,
        ]}
      />

      <NameChipList title={`${surname}씨 ${label} 대표 샘플`} names={sampleNames} />

      <LinkCardGrid title="관련 페이지 이동" links={buildComboRelatedLinks(surname, gender)} />

      <FaqSection items={faqItems} />

      <NoteSection text="조합 페이지는 조건별 비교를 돕는 안내입니다. 최종 이름은 가족이 직접 불러 보며 선호를 확인한 뒤 결정해 주세요." />

      <ServiceEntryCtaSection entryKey={`combo-${surname}-${gender}`} />
    </SeoPageShell>
  );
}
