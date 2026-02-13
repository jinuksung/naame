import Link from "next/link";
import type { Metadata } from "next";
import { buildSeoMetadata } from "@/seo/buildMeta";
import { FaqItem } from "@/seo/faqJsonLd";
import type { InternalLinkCard } from "@/seo/internalLinks";
import { guideLinks } from "@/seo/internalLinks";
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
    question: "이 페이지에서 바로 추천 결과를 받을 수 있나요?",
    answer:
      "이 페이지는 추천 방식과 입력 항목을 설명하는 랜딩입니다. 실제 추천은 버튼을 눌러 입력 화면으로 이동한 뒤 성씨, 성별, 생년월일을 입력하면 확인할 수 있습니다.",
  },
  {
    question: "성씨와 성별을 모두 입력해야 하나요?",
    answer:
      "네임핏 추천은 성씨와 성별 정보를 함께 참고해 후보를 정리합니다. 생년월일 정보까지 더하면 추천 설명을 읽을 때 기준을 더 명확하게 이해할 수 있습니다.",
  },
  {
    question: "생년월일은 어떤 방식으로 반영되나요?",
    answer:
      "생년월일은 이름 후보를 검토할 때 참고 정보로 사용됩니다. 추천 결과를 해석할 때 입력한 정보와 발음, 의미의 조합을 함께 확인하는 흐름으로 안내합니다.",
  },
  {
    question: "추천 기준은 무엇인가요?",
    answer:
      "성씨와의 발음 조합, 이름 구성의 균형, 생년월일 정보 기반의 참고 지표를 함께 보고 후보를 보여줍니다. 특정 결과를 단정하지 않고 비교 가능한 후보를 제시합니다.",
  },
  {
    question: "최종 이름은 어떻게 결정하면 좋을까요?",
    answer:
      "추천 결과를 바탕으로 가족이 자주 불렀을 때의 느낌, 한글·한자 표기 편의성, 장기적인 사용 만족도를 함께 검토해 결정하는 방법을 권장합니다.",
  },
];

const relatedLinks: InternalLinkCard[] = [
  {
    href: "/seo",
    title: "SEO 허브 보기",
    description: "다른 카테고리 랜딩과 성씨/성별 상세 페이지로 이동합니다.",
  },
  {
    href: "/birth",
    title: "생년월일 기반 소개",
    description: "생년월일 정보를 어떤 순서로 참고하는지 별도 설명 페이지에서 확인합니다.",
  },
  {
    href: "/gender/M",
    title: "남자 이름 추천 랜딩",
    description: "남자 이름 중심 샘플과 내부 링크 구조를 확인합니다.",
  },
  {
    href: "/gender/F",
    title: "여자 이름 추천 랜딩",
    description: "여자 이름 중심 샘플과 안내 문구를 확인합니다.",
  },
  {
    href: "/trends/2026",
    title: "2026 최신 이름 트렌드",
    description: "2026년 키워드 기준 탐색 흐름을 확인합니다.",
  },
  {
    href: "/pretty",
    title: "예쁜 이름 추천",
    description: "발음과 의미를 함께 살펴보는 예쁜 이름 페이지로 이동합니다.",
  },
  ...guideLinks,
];

export async function generateMetadata(): Promise<Metadata> {
  return buildSeoMetadata({
    title: "아기 이름 추천 안내 | 네임핏",
    description:
      "성씨, 성별, 생년월일 정보를 바탕으로 네임핏 이름 추천이 진행되는 흐름을 설명합니다. 입력 항목의 의미와 추천 기준을 이해하고 이름 추천을 시작해 보세요.",
    pathname: "/names",
  });
}

export default function NamesLandingPage(): JSX.Element {
  const sampleNames = pickDeterministicNames({
    routeKey: "names",
    count: 10,
  });

  return (
    <SeoPageShell
      title="아기 이름 추천 랜딩"
      description="성씨, 성별, 생년월일 기반 추천 흐름을 이해하고 바로 이름 추천을 시작할 수 있습니다."
    >
      <ParagraphSection
        title="서비스 한 줄 소개"
        paragraphs={[
          "네임핏은 성씨, 성별, 생년월일 정보를 함께 입력해 이름 후보를 정리해 주는 추천 서비스입니다. 사용자는 결과를 단순 점수로만 보는 대신, 어떤 입력값이 어떤 설명으로 이어지는지 읽으면서 후보를 비교할 수 있습니다. 이 랜딩 페이지는 추천 결과를 받기 전에 전체 과정을 빠르게 이해할 수 있도록 구성했습니다.",
          "입력 단계에서는 먼저 성씨와 성별을 정리하고, 생년월일을 입력해 기준 정보를 완성합니다. 이후 추천 화면에서 성씨와의 조합, 발음의 자연스러움, 의미 해석에 참고할 수 있는 설명을 함께 확인합니다. 특정 이름을 강하게 단정하지 않고 여러 후보를 비교하기 쉽게 제시하는 방식이 핵심입니다.",
        ]}
      />

      <ParagraphSection
        title="추천 기준 설명"
        paragraphs={[
          "추천 기준은 성씨와 이름의 연결감, 읽었을 때의 발음 오행 흐름, 생년월일 기반 사주 근사 참고 지표를 함께 고려하는 구조입니다. 예를 들어 같은 이름이라도 성씨가 달라지면 부르는 느낌이 달라질 수 있어 성씨와 이름의 결합을 먼저 확인합니다. 성별 정보는 후보 정리의 기준으로 사용하고, 생년월일은 설명을 읽을 때 참고할 수 있는 추가 조건으로 반영합니다.",
          "결과 해석에서는 발음, 의미, 실제 사용 편의를 균형 있게 확인하는 것이 좋습니다. 추천 리스트는 시작점이고, 최종 이름은 가족이 직접 불러 보면서 편안한지 검토해 결정하는 과정이 중요합니다.",
        ]}
      />

      <NameChipList title="대표 이름 샘플" names={sampleNames} />

      <section className="seo-section">
        <h2 className="seo-h2">추천 시작</h2>
        <p className="seo-paragraph">
          입력 화면으로 이동해 성씨, 성별, 생년월일을 입력하면 추천 결과를 받을 수 있습니다.
        </p>
        <Link href="/" className="seo-cta-button">
          이름 추천 시작
        </Link>
      </section>

      <LinkCardGrid title="관련 페이지" links={relatedLinks} />

      <FaqSection items={faqItems} />

      <NoteSection text="추천 결과는 후보를 비교하기 위한 안내입니다. 최종 선택은 가족의 선호와 실제 사용 환경을 가장 중요하게 두고 결정해 주세요." />
    </SeoPageShell>
  );
}
