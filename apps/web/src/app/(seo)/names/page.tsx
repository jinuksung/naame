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
  ServiceEntryCtaSection,
} from "@/seo/seoComponents";

const faqItems: FaqItem[] = [
  {
    question: "이 페이지에서 바로 추천 결과를 받을 수 있나요?",
    answer:
      "이 페이지는 추천을 시작하기 전에 기준을 잡는 안내 페이지입니다. 하단의 네임핏 시작 버튼으로 이동하면 성씨, 성별, 생년월일을 입력해 바로 결과를 확인할 수 있습니다.",
  },
  {
    question: "성씨와 성별을 모두 입력해야 하나요?",
    answer:
      "가능하면 함께 입력하는 것이 좋습니다. 같은 이름도 성씨와 성별이 달라지면 체감이 달라지기 때문에, 조건을 명확히 넣을수록 후보 비교가 정확해집니다.",
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
      "예비 부모를 위한 아기 이름 추천 가이드입니다. 성씨, 성별, 생년월일 기준을 빠르게 정리하고 네임핏에서 바로 후보 비교를 시작해 보세요.",
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
      description="예비 부모가 이름 후보를 막막함 없이 좁힐 수 있도록, 추천 기준과 시작 순서를 한 번에 안내합니다."
    >
      <ParagraphSection
        title="이름 고르기, 왜 이렇게 어려울까요?"
        paragraphs={[
          "예비 부모가 이름을 정할 때 가장 많이 하는 실수는 '예쁜 후보를 많이 모으는 것'에만 집중하는 것입니다. 실제로는 후보 수보다 기준이 더 중요합니다. 어떤 이름이 우리 성씨와 잘 어울리는지, 가족이 부르기 편한지, 의미가 납득되는지를 먼저 정해야 결정이 빨라집니다.",
          "네임핏은 이 기준 정리를 돕기 위해 설계되었습니다. 성씨, 성별, 생년월일을 함께 입력하면 후보를 비교 가능한 형태로 보여주고, 왜 그런 후보가 나왔는지 이해할 수 있게 안내합니다. 즉, 한 번에 정답을 찍는 방식이 아니라 '설명 가능한 선택'을 만드는 흐름입니다.",
        ]}
      />

      <ParagraphSection
        title="후보를 줄이는 실전 3단계"
        paragraphs={[
          "1단계는 성씨와 이름의 연결감 확인입니다. 같은 이름도 성이 바뀌면 느낌이 크게 달라집니다. 2단계는 성별과 발음 리듬 점검입니다. 실제로 자주 부를 때 어색하지 않은지를 확인해야 합니다. 3단계는 생년월일 기준을 참고해 설명을 읽고, 최종 비교 후보를 2~3개로 압축하는 것입니다.",
          "최종 결정 전에는 가족이 직접 소리 내어 불러 보세요. 발음, 의미, 표기 편의성까지 같이 보면 후회 가능성이 줄어듭니다. 추천은 출발점이고, 좋은 결정은 비교와 합의에서 완성됩니다.",
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

      <ServiceEntryCtaSection entryKey="names" />
    </SeoPageShell>
  );
}
