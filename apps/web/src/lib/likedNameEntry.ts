import type {
  FreeRecommendResultItem,
  PremiumRecommendResultItem,
  RecommendGender
} from "@/types/recommend";
import { buildLikedNameId } from "./likedNameId";
import type { LikedNameEntry, LikedNameSource } from "./likedNamesRepository";

interface BuildCommonLikedEntryInput {
  surnameHangul: string;
  surnameHanja: string;
  gender: RecommendGender;
  nameHangul: string;
  hanjaPair: [string, string];
  readingPair: [string, string];
  meaningPair: [string, string];
  score?: number;
  reason: string;
  source: LikedNameSource;
}

function toShortReason(raw: string): string {
  const trimmed = raw.trim();
  const delimiterIndex = trimmed.indexOf(":");
  if (delimiterIndex < 0) {
    return trimmed;
  }
  return trimmed.slice(delimiterIndex + 1).trim() || trimmed;
}

function normalizePair(values: readonly string[]): [string, string] {
  return [values[0] ?? "", values[1] ?? ""];
}

function normalizeMeaningPair(values: readonly string[]): [string, string] {
  const first = (values[0] ?? "").trim();
  const second = (values[1] ?? "").trim();
  return [first || "뜻 정보 없음", second || "뜻 정보 없음"];
}

function createLikedNameEntry(input: BuildCommonLikedEntryInput): LikedNameEntry {
  const id = buildLikedNameId({
    surnameHanja: input.surnameHanja,
    gender: input.gender,
    nameHangul: input.nameHangul,
    hanjaPair: input.hanjaPair
  });
  const surnameHangul = input.surnameHangul.trim();
  const nameHangul = input.nameHangul.trim();

  return {
    id,
    fullName: `${surnameHangul}${nameHangul}`,
    nameHangul,
    surnameHangul,
    surnameHanja: input.surnameHanja.trim(),
    gender: input.gender,
    hanjaPair: input.hanjaPair,
    readingPair: input.readingPair,
    meaningPair: input.meaningPair,
    score: input.score,
    reason: toShortReason(input.reason),
    createdAt: new Date().toISOString(),
    source: input.source
  };
}

export function buildLikedNameEntryFromFree(params: {
  surnameHangul: string;
  surnameHanja: string;
  gender: RecommendGender;
  item: FreeRecommendResultItem;
}): LikedNameEntry {
  return createLikedNameEntry({
    surnameHangul: params.surnameHangul,
    surnameHanja: params.surnameHanja,
    gender: params.gender,
    nameHangul: params.item.nameHangul,
    hanjaPair: normalizePair(params.item.hanjaPair),
    readingPair: normalizePair(params.item.readingPair),
    meaningPair: normalizeMeaningPair(params.item.meaningKwPair),
    score:
      typeof params.item.score === "number" && Number.isFinite(params.item.score)
        ? params.item.score
        : undefined,
    reason: params.item.reasons[0] ?? "이름 흐름이 안정적인 후보예요.",
    source: "FREE"
  });
}

export function buildLikedNameEntryFromPremium(params: {
  surnameHangul: string;
  surnameHanja: string;
  gender: RecommendGender;
  item: PremiumRecommendResultItem;
}): LikedNameEntry {
  return createLikedNameEntry({
    surnameHangul: params.surnameHangul,
    surnameHanja: params.surnameHanja,
    gender: params.gender,
    nameHangul: params.item.nameHangul,
    hanjaPair: normalizePair(params.item.hanjaPair),
    readingPair: normalizePair(params.item.readingPair),
    meaningPair: normalizeMeaningPair(params.item.meaningKwPair),
    score:
      typeof params.item.sajuScore5 === "number" && Number.isFinite(params.item.sajuScore5)
        ? params.item.sajuScore5
        : undefined,
    reason: params.item.why[0] ?? "사주 흐름을 보완하는 이름이에요.",
    source: "PREMIUM"
  });
}
