export const SITE_NAME = "네임핏";

function resolveSiteUrl(raw?: string): string {
  const fallback = "http://localhost:3000";
  if (!raw || raw.trim().length === 0) {
    return fallback;
  }
  return raw.replace(/\/+$/, "");
}

export const SITE_URL = resolveSiteUrl(process.env.NEXT_PUBLIC_SITE_URL);

export const TOP_SURNAMES = [
  "김",
  "이",
  "박",
  "최",
  "정",
  "강",
  "조",
  "윤",
  "장",
  "임",
  "오",
  "한",
  "신",
  "서",
  "권",
  "황",
  "안",
  "송",
  "전",
  "홍",
  "유",
] as const;

export const GENDER_PARAMS = ["M", "F"] as const;
export type NormalizedGender = (typeof GENDER_PARAMS)[number];

const GENDER_ALIAS_MAP: Record<string, NormalizedGender> = {
  m: "M",
  male: "M",
  boy: "M",
  남: "M",
  남자: "M",
  f: "F",
  female: "F",
  girl: "F",
  여: "F",
  여자: "F",
};

const SURNAME_PATTERN = /^[가-힣]{1,2}$/;
const INDEXABLE_SURNAME_SET = new Set<string>(TOP_SURNAMES);

export const SEO_STATIC_PATHS = [
  "/seo",
  "/names",
  "/birth",
  "/guides/how-it-works",
  "/guides/namefit-vs-naming-office",
] as const;

export function isValidSurnameParam(surname: string): boolean {
  return SURNAME_PATTERN.test(surname.trim());
}

export function normalizeGenderParam(gender: string): NormalizedGender | null {
  const normalized = gender.trim().toLowerCase();
  return GENDER_ALIAS_MAP[normalized] ?? null;
}

export function genderLabel(gender: NormalizedGender): string {
  return gender === "M" ? "남아" : "여아";
}

export function isIndexableSurname(surname: string): boolean {
  return INDEXABLE_SURNAME_SET.has(surname.trim());
}

export function normalizePathname(pathname: string): string {
  if (!pathname.startsWith("/")) {
    return `/${pathname}`;
  }
  return pathname;
}

export function absoluteUrl(pathname: string): string {
  return new URL(normalizePathname(pathname), SITE_URL).toString();
}
