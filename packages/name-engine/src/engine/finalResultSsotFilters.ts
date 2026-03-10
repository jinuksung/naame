import { getBlacklistInitialSet, getBlacklistWordSet, hasNameBlockSyllableRuleMatch } from "../../../../src/core/blacklist";
import { getNamePoolSyllablePositionRules } from "../../../../src/core/namePoolSyllablePositionRules";
import type { Gender, PoolTier } from "../types";

const HANGUL_BASE = 0xac00;
const HANGUL_END = 0xd7a3;
const CHOSEONG = [
  "ㄱ",
  "ㄲ",
  "ㄴ",
  "ㄷ",
  "ㄸ",
  "ㄹ",
  "ㅁ",
  "ㅂ",
  "ㅃ",
  "ㅅ",
  "ㅆ",
  "ㅇ",
  "ㅈ",
  "ㅉ",
  "ㅊ",
  "ㅋ",
  "ㅌ",
  "ㅍ",
  "ㅎ",
] as const;

export type FinalResultSsotFilterReason =
  | "blacklist_word"
  | "blacklist_initials"
  | "name_block_syllable_rule"
  | "name_pool_syllable_position_rule";

export interface FinalResultSsotFilterInput {
  nameHangul: string;
  requestGender: Gender;
  poolTier: PoolTier;
}

export interface FinalResultSsotFilterResult {
  blocked: boolean;
  reason: FinalResultSsotFilterReason | null;
}

function toInitialConsonants(name: string): string {
  let out = "";
  for (const char of name.normalize("NFC")) {
    const code = char.codePointAt(0);
    if (code === undefined || code < HANGUL_BASE || code > HANGUL_END) {
      continue;
    }
    const choseongIndex = Math.floor((code - HANGUL_BASE) / 588);
    out += CHOSEONG[choseongIndex] ?? "";
  }
  return out;
}

function matchesBlacklistWord(name: string): boolean {
  return getBlacklistWordSet().has(name);
}

function matchesBlacklistInitials(name: string): boolean {
  const initials = toInitialConsonants(name);
  if (!initials) {
    return false;
  }
  const patterns = getBlacklistInitialSet();
  for (const pattern of patterns) {
    if (initials.includes(pattern)) {
      return true;
    }
  }
  return false;
}

function resolveAllowedRuleGenders(requestGender: Gender): Set<string> {
  if (requestGender === "MALE") {
    return new Set(["ALL", "M"]);
  }
  if (requestGender === "FEMALE") {
    return new Set(["ALL", "F"]);
  }
  return new Set(["ALL", "M", "F"]);
}

function matchesNamePoolSyllablePositionRuleAtRuntime(
  nameHangul: string,
  requestGender: Gender,
  poolTier: PoolTier,
): boolean {
  const chars = Array.from(nameHangul.trim().normalize("NFC"));
  if (chars.length !== 2) {
    return false;
  }
  const [s1, s2] = chars;
  const allowedRuleGenders = resolveAllowedRuleGenders(requestGender);

  for (const rule of getNamePoolSyllablePositionRules()) {
    if (rule.enabled === false) {
      continue;
    }

    const ruleGender = String((rule as { gender?: unknown }).gender ?? "ALL")
      .trim()
      .toUpperCase();
    if (!allowedRuleGenders.has(ruleGender)) {
      continue;
    }

    const tierScope = String((rule as { tierScope?: unknown }).tierScope ?? "ALL")
      .trim()
      .toUpperCase();
    if (tierScope === "NON_A" && poolTier === "A") {
      continue;
    }

    const blockedPosition = String((rule as { blockedPosition?: unknown }).blockedPosition ?? "")
      .trim()
      .toUpperCase();
    const syllable = String((rule as { syllable?: unknown }).syllable ?? "").trim().normalize("NFC");
    if (!syllable) {
      continue;
    }

    const target = blockedPosition === "END" ? s2 : s1;
    if (target === syllable) {
      return true;
    }
  }

  return false;
}

export function shouldBlockFinalResultName(
  input: FinalResultSsotFilterInput,
): FinalResultSsotFilterResult {
  const nameHangul = input.nameHangul.trim().normalize("NFC");

  if (matchesBlacklistWord(nameHangul)) {
    return { blocked: true, reason: "blacklist_word" };
  }

  if (matchesBlacklistInitials(nameHangul)) {
    return { blocked: true, reason: "blacklist_initials" };
  }

  if (hasNameBlockSyllableRuleMatch(nameHangul)) {
    return { blocked: true, reason: "name_block_syllable_rule" };
  }

  if (matchesNamePoolSyllablePositionRuleAtRuntime(nameHangul, input.requestGender, input.poolTier)) {
    return { blocked: true, reason: "name_pool_syllable_position_rule" };
  }

  return { blocked: false, reason: null };
}
