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
} from "@/seo/seoComponents";

const faqItems: FaqItem[] = [
  {
    question: "SEO 랜딩 페이지는 어떤 정보를 중심으로 구성되나요?",
    answer:
      "네임핏 랜딩 페이지는 성씨, 성별, 생년월일 기반 추천 흐름을 중심으로 설명합니다. 입력값이 어떻게 이름 후보 정리에 반영되는지 이해하기 쉽게 안내하고, 관련 가이드로 연결해 탐색을 돕습니다.",
  },
  {
    question: "허브 페이지에서 바로 추천을 시작할 수 있나요?",
    answer:
      "가능합니다. 허브에서 일반 이름 추천 페이지나 성씨·성별 세부 페이지로 이동한 뒤, 실제 추천 화면으로 연결되는 링크를 통해 바로 추천을 시작할 수 있습니다.",
  },
  {
    question: "성씨별 페이지는 모두 같은 내용을 보여주나요?",
    answer:
      "기본 구조는 같지만 성씨마다 설명 문장과 예시 이름이 달라집니다. 예시는 고정된 규칙으로 뽑아 매번 같은 URL에서 동일한 샘플을 확인할 수 있습니다.",
  },
  {
    question: "가이드 페이지는 무엇을 알려주나요?",
    answer:
      "추천 방식의 개요와 서비스 포지셔닝 정보를 제공합니다. 과장 표현 없이 실제 사용 흐름, 입력값 활용 방법, 선택 시 참고할 점을 중심으로 정리합니다.",
  },
  {
    question: "랜딩 페이지 정보만으로 이름을 확정해도 되나요?",
    answer:
      "랜딩 페이지는 비교와 탐색을 돕는 안내 자료입니다. 최종 결정은 가족의 선호, 발음 만족도, 일상 사용 편의성을 함께 고려해 정하는 것을 권장합니다.",
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
      description="성씨, 성별, 생년월일 기반 추천 랜딩을 한 곳에서 확인하고 원하는 경로로 바로 이동하세요."
    >
      <ParagraphSection
        title="허브 이용 안내"
        paragraphs={[
          "이 페이지는 네임핏의 검색용 랜딩을 한 번에 탐색할 수 있도록 구성한 허브입니다. 이름 추천을 처음 접하는 사용자도 어떤 페이지부터 보면 되는지 바로 판단할 수 있도록 카테고리를 단순하게 나눴습니다. 성씨 중심 페이지에서는 특정 성씨와 어울리는 이름 후보를 확인하고, 성별 페이지에서는 남자·여자 기준의 대표 샘플을 비교할 수 있습니다.",
          "또한 생년월일 기반 설명 페이지와 가이드 문서를 함께 배치해 입력값의 의미를 이해한 뒤 추천을 시작할 수 있도록 했습니다. 각 페이지는 서로 내부 링크로 연결되어 있어 한 번 방문한 뒤에도 다음 단계로 자연스럽게 이동할 수 있습니다. 실제 추천이 필요하면 일반 이름 추천 페이지로 이동해 성씨, 성별, 생년월일을 입력하고 결과를 확인하면 됩니다.",
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
    </SeoPageShell>
  );
}
