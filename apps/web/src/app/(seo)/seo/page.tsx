import Link from "next/link";
import type { Metadata } from "next";
import { buildSeoMetadata } from "@/seo/buildMeta";
import { FaqItem } from "@/seo/faqJsonLd";
import { guideLinks, seoHubCategoryLinks } from "@/seo/internalLinks";
import { TOP_SURNAMES } from "@/seo/seoConfig";
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
    question: "SEO 랜딩 페이지는 어떤 정보를 중심으로 구성되나요?",
    answer:
      "예비 부모가 검색으로 처음 들어왔을 때 바로 다음 행동을 정할 수 있도록 구성했습니다. 키워드별 안내, 조건별 페이지, 추천 시작 링크를 한 화면에서 연결합니다.",
  },
  {
    question: "허브 페이지에서 바로 추천을 시작할 수 있나요?",
    answer:
      "가능합니다. 바로 추천을 시작해도 되고, 1~2개 가이드를 먼저 읽고 기준을 정한 뒤 시작해도 됩니다. 빠른 시작과 정보 탐색 두 경로를 모두 제공합니다.",
  },
  {
    question: "성씨별 페이지는 모두 같은 내용을 보여주나요?",
    answer:
      "구조는 동일하지만 성씨별 예시와 문맥이 달라집니다. 같은 성씨 안에서 남아/여아 조합을 비교하기 쉽게 설계했습니다.",
  },
  {
    question: "가이드 페이지는 무엇을 알려주나요?",
    answer:
      "좋은 이름을 고를 때 흔히 막히는 지점, 기준을 세우는 방법, 추천 결과를 읽는 순서를 안내합니다. 핵심은 '감'이 아니라 '비교 기준'을 만드는 것입니다.",
  },
  {
    question: "랜딩 페이지 정보만으로 이름을 확정해도 되나요?",
    answer:
      "권장하지 않습니다. 랜딩은 후보를 좁히는 출발점이고, 최종 결정은 가족이 실제로 불러 보며 발음, 의미, 사용 편의성을 함께 확인해 정하는 것이 안전합니다.",
  },
];

export async function generateMetadata(): Promise<Metadata> {
  return buildSeoMetadata({
    title: "이름 추천 SEO 허브 | 네임핏",
    description:
      "네임핏 SEO 허브에서 성씨별, 성별별, 생년월일 기반 이름 추천 페이지와 가이드를 한 번에 확인하세요. 입력 흐름과 관련 링크를 따라 원하는 추천 경로를 빠르게 찾을 수 있습니다.",
    pathname: "/seo",
  });
}

export default function SeoHubPage(): JSX.Element {
  const popularSurnames = TOP_SURNAMES.slice(0, 20);
  const keywordLinks = [
    { href: "/trends/2026", label: "2026 최신 이름 트렌드" },
    { href: "/gender/M", label: "남자 이름 추천" },
    { href: "/gender/F", label: "여자 이름 추천" },
    { href: "/pretty", label: "예쁜 이름 추천" },
  ];

  return (
    <SeoPageShell
      title="이름 추천 SEO 허브"
      description="검색으로 들어온 예비 부모가 바로 기준을 잡고 네임핏 추천으로 이동할 수 있도록 만든 시작 허브입니다."
    >
      <ParagraphSection
        title="처음 3분, 이렇게 시작하세요"
        paragraphs={[
          "이름을 지을 때 가장 어려운 순간은 '어디서부터 봐야 할지' 모를 때입니다. 이 허브는 그 고민을 줄이기 위해 만들었습니다. 예쁜 이름, 최신 트렌드, 성씨별·성별 기준, 추천 원리까지 필요한 정보를 한 번에 정리해 두었습니다.",
          "권장 순서는 간단합니다. 먼저 관심 키워드 페이지에서 후보 감을 잡고, 그다음 성씨/성별 페이지에서 조건을 좁히세요. 마지막으로 네임핏 추천에서 실제 입력을 진행하면, 후보를 단순 나열이 아니라 비교 가능한 기준으로 확인할 수 있습니다.",
        ]}
      />

      <section className="seo-section">
        <h2 className="seo-h2">주요 검색 키워드 페이지</h2>
        <ul className="seo-surname-list">
          {keywordLinks.map((item) => (
            <li key={item.label}>
              <Link className="seo-surname-link" href={item.href}>
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <LinkCardGrid title="카테고리 바로가기" links={seoHubCategoryLinks} />

      <section className="seo-section">
        <h2 className="seo-h2">인기 성씨 페이지</h2>
        <ul className="seo-surname-list">
          {popularSurnames.map((surname) => (
            <li key={surname}>
              <Link className="seo-surname-link" href={`/surname/${encodeURIComponent(surname)}`}>
                {surname} 성씨 이름 추천
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <LinkCardGrid title="가이드 문서" links={guideLinks} />

      <FaqSection items={faqItems} />

      <NoteSection text="이름 추천 결과는 후보를 정리하는 참고 자료로 활용해 주세요. 최종 선택은 가족이 실제로 자주 부를 때의 느낌과 선호를 함께 고려하는 것이 좋습니다." />

      <ServiceEntryCtaSection entryKey="seo-hub" />
    </SeoPageShell>
  );
}
