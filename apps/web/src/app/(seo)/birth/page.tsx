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
  ServiceEntryCtaSection,
} from "@/seo/seoComponents";

const faqItems: FaqItem[] = [
  {
    question: "생년월일만으로 이름이 결정되나요?",
    answer:
      "아니요. 생년월일은 중요한 참고 기준이지만 단독 기준은 아닙니다. 성씨, 성별, 발음, 실제 사용 편의성과 함께 볼 때 후보 선택이 더 안정적입니다.",
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
    title: "남자 이름 추천",
    description: "남자 기준 이름 샘플과 관련 링크를 확인합니다.",
  },
  {
    href: "/gender/F",
    title: "여자 이름 추천",
    description: "여자 기준 이름 샘플과 관련 링크를 확인합니다.",
  },
  {
    href: "/trends/2026",
    title: "2026 최신 이름 트렌드",
    description: "2026년 키워드 기반 탐색 흐름을 확인합니다.",
  },
  {
    href: "/pretty",
    title: "예쁜 이름 추천",
    description: "예쁜 이름 키워드로 시작하는 비교 흐름을 확인합니다.",
  },
  ...guideLinks,
];

export async function generateMetadata(): Promise<Metadata> {
  return buildSeoMetadata({
    title: "생년월일 기반 이름 추천 소개 | 네임핏",
    description:
      "생년월일을 이름 선택에 어떻게 활용해야 하는지 예비 부모 관점에서 정리한 가이드입니다. 네임핏에서 성씨·성별과 함께 후보를 비교해 보세요.",
    pathname: "/birth",
  });
}

export default function BirthLandingPage(): JSX.Element {
  return (
    <SeoPageShell
      title="생년월일 기반 이름 추천 소개"
      description="생년월일을 참고할 때 놓치기 쉬운 포인트와 실전 적용 순서를 예비 부모 눈높이로 안내합니다."
    >
      <ParagraphSection
        title="생년월일, 왜 참고해야 할까요?"
        paragraphs={[
          "예비 부모가 이름을 정할 때 생년월일을 확인하는 이유는 기준을 더 분명히 하기 위해서입니다. 다만 생년월일 하나에만 의존하면 오히려 선택이 좁아지거나 과해질 수 있습니다. 핵심은 생년월일을 '보조 기준'으로 쓰는 것입니다.",
          "좋은 이름은 여러 요소의 균형에서 나옵니다. 성씨와의 결합, 실제 발음, 의미 해석, 가족 선호를 함께 보고, 생년월일은 후보 우선순위를 조정하는 기준으로 활용해야 실사용 만족도가 높습니다.",
        ]}
      />

      <ParagraphSection
        title="실전 적용: 3단계 확인법"
        paragraphs={[
          "첫째, 성씨+성별 기준으로 1차 후보를 잡으세요. 둘째, 생년월일 기반 설명을 참고해 우선순위를 조정하세요. 셋째, 최종 2~3개 후보를 가족이 직접 불러 보고 결정하세요. 이 순서를 지키면 감정 소모를 줄이고 빠르게 합의할 수 있습니다.",
          "중요한 건 '완벽한 한 이름'을 찾기보다 '우리 가족에게 가장 잘 맞는 이름'을 찾는 태도입니다. 생년월일 정보는 그 결정을 돕는 나침반 역할을 할 때 가장 효과적입니다.",
        ]}
      />

      <LinkCardGrid title="관련 페이지" links={relatedLinks} />

      <FaqSection items={faqItems} />

      <NoteSection text="생년월일 기반 설명은 추천을 돕는 참고 정보입니다. 최종 이름은 가족이 직접 불러 보고 선호를 확인한 뒤 결정하는 과정을 권장합니다." />

      <ServiceEntryCtaSection entryKey="birth" />
    </SeoPageShell>
  );
}
