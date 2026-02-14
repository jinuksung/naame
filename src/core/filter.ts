import { BLACKLIST_INITIAL_PATTERNS, BLACKLIST_WORD_PATTERNS } from "./blacklist";
import type { FilterReason, FilterResult, FrequencyProfile, NameCandidate } from "../types";

const HANGUL_TWO_SYLLABLE = /^[가-힣]{2}$/;
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
  "ㅎ"
];

function toInitialConsonants(name: string): string {
  let result = "";
  for (const char of name) {
    const code = char.codePointAt(0);
    if (code === undefined || code < 0xac00 || code > 0xd7a3) {
      continue;
    }
    const choseongIndex = Math.floor((code - 0xac00) / 588);
    result += CHOSEONG[choseongIndex] ?? "";
  }
  return result;
}

function hasBlacklistPattern(name: string): boolean {
  if (BLACKLIST_WORD_PATTERNS.some((pattern) => name.includes(pattern))) {
    return true;
  }

  const initials = toInitialConsonants(name);
  return BLACKLIST_INITIAL_PATTERNS.some((pattern) => initials.includes(pattern));
}

function emptyReasonCounts(): Record<FilterReason, number> {
  return {
    repeated_syllable: 0,
    blacklist: 0,
    invalid_chars: 0,
    obvious_weird: 0
  };
}

export function filterCandidates(
  candidates: NameCandidate[],
  profile: FrequencyProfile,
  sourceTwoSyllableSet: Set<string>
): FilterResult {
  const removedByReason = emptyReasonCounts();
  const kept: NameCandidate[] = [];

  for (const candidate of candidates) {
    const { name } = candidate;
    if (!HANGUL_TWO_SYLLABLE.test(name)) {
      removedByReason.invalid_chars += 1;
      continue;
    }

    if (candidate.features.start === candidate.features.end) {
      removedByReason.repeated_syllable += 1;
      continue;
    }

    if (hasBlacklistPattern(name)) {
      removedByReason.blacklist += 1;
      continue;
    }

    const startPct = profile.startPercentile.get(candidate.features.start) ?? 0;
    const endPct = profile.endPercentile.get(candidate.features.end) ?? 0;
    const isSource = sourceTwoSyllableSet.has(name);
    if (!isSource && startPct < 0.06 && endPct < 0.06) {
      removedByReason.obvious_weird += 1;
      continue;
    }

    kept.push(candidate);
  }

  return {
    kept,
    removedByReason
  };
}
