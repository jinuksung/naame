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
    title: `${surname} 성 ${label} 이름 추천 | 네임핏`,
    description: `${surname} 성과 ${label} 기준으로 이름 후보를 비교하는 네임핏 랜딩입니다. 성씨 결합, 생년월일 입력 흐름, 관련 내부 링크를 통해 추천 단계를 자연스럽게 이어갈 수 있습니다.`,
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
      question: `${surname} 성 ${label} 페이지는 어떤 사용자에게 적합한가요?`,
      answer: `${surname} 성씨와 ${label} 기준을 동시에 보고 싶은 사용자에게 적합합니다. 성씨와 성별을 함께 고정한 상태에서 후보를 이해하고 내부 링크로 다른 조합과 비교할 수 있습니다.`,
    },
    {
      question: "같은 성씨에서 다른 성별도 비교할 수 있나요?",
      answer:
        "네. 페이지 하단 링크에서 같은 성씨의 다른 성별 페이지로 바로 이동할 수 있습니다. 조합별 설명과 샘플을 나란히 확인하기 좋습니다.",
    },
    {
      question: "생년월일 입력은 왜 필요한가요?",
      answer:
        "실제 추천 화면에서는 생년월일 정보를 함께 입력해 후보 설명을 더 구체적으로 읽을 수 있습니다. 이 페이지는 조합 이해와 링크 탐색을 돕는 소개 역할입니다.",
    },
    {
      question: "샘플 이름은 랜덤인가요?",
      answer:
        "아니요. 샘플은 성씨+성별 조합을 기준으로 고정 규칙으로 선정되어 동일 URL에서 항상 같은 예시를 확인할 수 있습니다.",
    },
    {
      question: "최종 이름 확정 전에 무엇을 확인해야 하나요?",
      answer:
        "가족이 실제로 불러 보았을 때의 편안함, 표기 편의성, 생활 속 사용감을 함께 체크해 최종 결정을 내리는 것을 권장합니다.",
    },
  ];

  return (
    <SeoPageShell
      title={`${surname} 성 + ${label} 이름 추천`}
      description={`${surname} 성씨와 ${label} 기준을 함께 고려한 추천 흐름과 대표 샘플을 확인할 수 있습니다.`}
    >
      <ParagraphSection
        title={`${surname} 성 ${label} 조합 추천 흐름`}
        paragraphs={[
          `${surname} 성과 ${label} 조합 페이지는 조건을 좁혀서 이름 후보를 비교하려는 사용자에게 맞춘 랜딩입니다. 성씨와 성별을 동시에 고정하면 추천 설명을 읽을 때 기준이 명확해져 후보를 빠르게 정리할 수 있습니다. 페이지에서 제공하는 샘플은 조합 기준으로 고정되어 있어 다시 방문해도 동일한 목록을 바탕으로 비교를 이어갈 수 있습니다.`,
          `실제 추천 단계에서는 이 조합 정보를 바탕으로 생년월일을 입력해 결과 설명을 함께 확인합니다. 성씨와 성별을 먼저 확정하고 생년월일을 추가하면 추천 내용을 이해하기 쉬워집니다. 또한 같은 성씨의 반대 성별 페이지, 성씨 허브, 성별 허브로 이동할 수 있어 조합을 확장하면서 후보를 검토하기에 유리합니다.`,
        ]}
      />

      <NameChipList title={`${surname} 성 ${label} 대표 샘플`} names={sampleNames} />

      <LinkCardGrid title="관련 페이지 이동" links={buildComboRelatedLinks(surname, gender)} />

      <FaqSection items={faqItems} />

      <NoteSection text="조합 페이지는 조건별 비교를 돕는 안내입니다. 최종 이름은 가족이 직접 불러 보며 선호를 확인한 뒤 결정해 주세요." />
    </SeoPageShell>
  );
}
