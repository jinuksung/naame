import type { Metadata } from "next";
import { buildSeoMetadata } from "@/seo/buildMeta";
import { FaqItem } from "@/seo/faqJsonLd";
import type { InternalLinkCard } from "@/seo/internalLinks";
import { guideLinks } from "@/seo/internalLinks";
import {
  FaqSection,
  LinkCardGrid,
  NoteSection,
  ParagraphSection,
  SeoPageShell,
} from "@/seo/seoComponents";

const faqItems: FaqItem[] = [
  {
    question: "생년월일만으로 이름이 결정되나요?",
    answer:
      "아니요. 생년월일은 참고 정보이며 성씨, 성별, 발음 흐름과 함께 확인해야 합니다. 네임핏은 여러 조건을 함께 살펴 후보를 정리하는 방식으로 안내합니다.",
  },
  {
    question: "출생시간을 모르면 추천을 못 받나요?",
    answer:
      "출생시간이 없어도 기본 추천은 가능합니다. 다만 사용자가 추가 정보를 알고 있다면 설명을 더 세밀하게 읽는 데 도움이 될 수 있습니다.",
  },
  {
    question: "생년월일 기반 추천은 어떤 순서로 보나요?",
    answer:
      "먼저 성씨와 성별 기준으로 후보를 좁히고, 생년월일 정보를 참고해 설명을 함께 읽습니다. 이후 가족이 발음과 의미를 비교해 후보를 추리는 방식이 자연스럽습니다.",
  },
  {
    question: "이 페이지에서 실제 입력을 받나요?",
    answer:
      "이 페이지는 소개 중심 랜딩이므로 입력 폼은 없습니다. 실제 입력은 추천 시작 페이지에서 진행할 수 있습니다.",
  },
  {
    question: "최종 결정 시 무엇을 더 확인해야 하나요?",
    answer:
      "호칭 습관, 가족 간 선호도, 실사용 시 발음 편의성을 함께 확인해 최종 결정을 내리는 것을 권장합니다.",
  },
];

const relatedLinks: InternalLinkCard[] = [
  {
    href: "/names",
    title: "이름 추천 시작 안내",
    description: "성씨/성별/생년월일 입력 흐름을 설명하는 기본 랜딩으로 이동합니다.",
  },
  {
    href: "/seo",
    title: "SEO 허브",
    description: "성씨별, 성별별, 가이드 페이지를 한 번에 탐색할 수 있습니다.",
  },
  {
    href: "/gender/M",
    title: "남아 추천 페이지",
    description: "남아 기준 이름 샘플과 관련 링크를 확인합니다.",
  },
  {
    href: "/gender/F",
    title: "여아 추천 페이지",
    description: "여아 기준 이름 샘플과 관련 링크를 확인합니다.",
  },
  ...guideLinks,
];

export async function generateMetadata(): Promise<Metadata> {
  return buildSeoMetadata({
    title: "생년월일 기반 이름 추천 소개 | 네임핏",
    description:
      "생년월일 정보를 참고해 이름 후보를 정리하는 과정을 네임핏 방식으로 설명합니다. 성씨와 성별 정보와 함께 읽는 추천 흐름을 확인하고 실제 추천으로 연결해 보세요.",
    pathname: "/birth",
  });
}

export default function BirthLandingPage(): JSX.Element {
  return (
    <SeoPageShell
      title="생년월일 기반 이름 추천 소개"
      description="생년월일 정보가 이름 후보 설명에 어떻게 반영되는지, 실제 입력 전 이해하기 쉽게 정리했습니다."
    >
      <ParagraphSection
        title="생년월일 정보를 보는 이유"
        paragraphs={[
          "이름을 정할 때 생년월일은 가족이 자주 확인하는 기준 중 하나입니다. 네임핏은 생년월일을 단독으로 해석하는 방식이 아니라 성씨, 성별, 발음과 함께 읽을 수 있는 참고 정보로 배치합니다. 이렇게 하면 입력값의 역할이 과도하게 커지지 않고, 실제로 비교 가능한 이름 후보를 안정적으로 확인할 수 있습니다.",
          "예를 들어 같은 성씨와 같은 이름 후보라도 가족이 중요하게 생각하는 기준에 따라 판단이 달라질 수 있습니다. 생년월일 기반 정보는 그 판단을 보조하는 역할을 하며, 최종 결정은 가족의 선호와 생활 속 사용성을 중심으로 진행하는 것이 좋습니다.",
        ]}
      />

      <ParagraphSection
        title="추천 화면에서 읽는 방법"
        paragraphs={[
          "실제 추천 화면에서는 먼저 성씨와 성별을 기준으로 후보를 확인하고, 생년월일 기반 설명을 보조 정보로 읽는 순서를 권장합니다. 이 순서를 지키면 이름을 부를 때의 자연스러움과 의미 해석을 함께 검토하기 쉬워집니다. 한 번에 하나의 후보를 확정하기보다 여러 후보를 나란히 비교하는 접근이 유용합니다.",
          "또한 추천 결과를 가족과 함께 읽으면서 실제 호칭 상황을 가정해 보는 것이 도움이 됩니다. 발음이 자연스러운지, 표기가 편한지, 장기적으로 쓰기 부담이 없는지를 체크하면 후보를 좁히는 과정이 명확해집니다.",
        ]}
      />

      <LinkCardGrid title="관련 페이지" links={relatedLinks} />

      <FaqSection items={faqItems} />

      <NoteSection text="생년월일 기반 설명은 추천을 돕는 참고 정보입니다. 최종 이름은 가족이 직접 불러 보고 선호를 확인한 뒤 결정하는 과정을 권장합니다." />
    </SeoPageShell>
  );
}
