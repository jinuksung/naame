import { NormalizedGender, genderLabel } from "./seoConfig";

export interface InternalLinkCard {
  href: string;
  title: string;
  description: string;
}

export const seoHubCategoryLinks: InternalLinkCard[] = [
  {
    href: "/names",
    title: "이름 추천 안내",
    description: "성씨, 성별, 생년월일 입력으로 추천이 진행되는 기본 흐름을 확인합니다.",
  },
  {
    href: "/birth",
    title: "생년월일 기반 작명",
    description: "출생일을 바탕으로 이름 후보를 정리하는 과정과 활용 팁을 소개합니다.",
  },
  {
    href: "/gender/M",
    title: "남아 이름 추천",
    description: "남아 이름 추천 페이지로 이동해 예시 후보를 확인합니다.",
  },
  {
    href: "/gender/F",
    title: "여아 이름 추천",
    description: "여아 이름 추천 페이지로 이동해 예시 후보를 확인합니다.",
  },
];

export const guideLinks: InternalLinkCard[] = [
  {
    href: "/guides/how-it-works",
    title: "추천 알고리즘 개요",
    description: "추천이 어떤 입력값을 참고해 후보를 고르는지 쉬운 언어로 설명합니다.",
  },
  {
    href: "/guides/namefit-vs-naming-office",
    title: "작명소와의 차이",
    description: "상담형 서비스와 셀프 추천형 서비스의 차이를 비교해 정리합니다.",
  },
];

export function buildSurnameRelatedLinks(surname: string): InternalLinkCard[] {
  const encodedSurname = encodeURIComponent(surname);
  return [
    {
      href: `/combo/${encodedSurname}/M`,
      title: `${surname} 성 + 남아 추천`,
      description: `${surname} 성씨 기준으로 남아 이름 추천 흐름을 확인합니다.`,
    },
    {
      href: `/combo/${encodedSurname}/F`,
      title: `${surname} 성 + 여아 추천`,
      description: `${surname} 성씨 기준으로 여아 이름 추천 흐름을 확인합니다.`,
    },
    {
      href: `/surname/${encodedSurname}`,
      title: `${surname} 성씨 추천 허브`,
      description: `${surname} 성씨와 어울리는 이름 선택 포인트를 한 번에 확인합니다.`,
    },
    {
      href: "/seo",
      title: "SEO 허브로 돌아가기",
      description: "다른 성씨/카테고리 랜딩 페이지로 빠르게 이동합니다.",
    },
  ];
}

export function buildGenderRelatedLinks(gender: NormalizedGender): InternalLinkCard[] {
  const opposite = gender === "M" ? "F" : "M";
  return [
    {
      href: `/gender/${opposite}`,
      title: `${genderLabel(opposite)} 추천도 보기`,
      description: "다른 성별 기준 페이지에서 구성 방식과 샘플을 비교할 수 있습니다.",
    },
    {
      href: "/names",
      title: "입력 흐름 전체 보기",
      description: "성씨, 성별, 생년월일을 함께 사용하는 전체 추천 과정을 확인합니다.",
    },
    {
      href: "/birth",
      title: "생년월일 기준 설명 보기",
      description: "출생 정보가 후보 정리에 어떻게 쓰이는지 자세히 안내합니다.",
    },
    {
      href: "/guides/how-it-works",
      title: "추천 방식 가이드",
      description: "추천 알고리즘이 어떤 순서로 후보를 좁히는지 확인합니다.",
    },
  ];
}

export function buildComboRelatedLinks(
  surname: string,
  gender: NormalizedGender,
): InternalLinkCard[] {
  const opposite = gender === "M" ? "F" : "M";
  const encodedSurname = encodeURIComponent(surname);
  return [
    {
      href: `/combo/${encodedSurname}/${opposite}`,
      title: `${surname} 성 ${genderLabel(opposite)} 페이지`,
      description: `같은 성씨에서 다른 성별 기준의 추천 흐름을 함께 비교합니다.`,
    },
    {
      href: `/surname/${encodedSurname}`,
      title: `${surname} 성씨 추천 페이지`,
      description: "성씨 중심으로 정리된 설명과 예시를 함께 확인합니다.",
    },
    {
      href: `/gender/${gender}`,
      title: `${genderLabel(gender)} 추천 허브`,
      description: "성별 중심 페이지에서 대표 후보를 확인합니다.",
    },
    {
      href: "/seo",
      title: "전체 카테고리 보기",
      description: "SEO 허브에서 다른 가이드/카테고리로 이동합니다.",
    },
  ];
}
