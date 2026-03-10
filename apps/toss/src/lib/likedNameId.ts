import type { RecommendGender } from "@/types/recommend";

export interface LikedNameIdInput {
  surnameHanja: string;
  gender: RecommendGender | string;
  nameHangul: string;
  hanjaPair: readonly [string, string] | readonly string[];
}

function normalizeToken(value: string): string {
  return value.trim().normalize("NFC").replace(/\s+/g, "");
}

export function buildLikedNameId(input: LikedNameIdInput): string {
  const firstHanja = input.hanjaPair[0] ?? "";
  const secondHanja = input.hanjaPair[1] ?? "";

  return [
    normalizeToken(input.surnameHanja),
    normalizeToken(String(input.gender)).toUpperCase(),
    normalizeToken(input.nameHangul),
    normalizeToken(firstHanja),
    normalizeToken(secondHanja)
  ].join("|");
}
