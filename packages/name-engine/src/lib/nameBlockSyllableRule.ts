const HANGUL_BASE = 0xac00;
const HANGUL_END = 0xd7a3;
const JUNGSEONG_COUNT = 21;
const JONGSEONG_COUNT = 28;

const COMPAT_JUNGSEONG = [
  "ㅏ",
  "ㅐ",
  "ㅑ",
  "ㅒ",
  "ㅓ",
  "ㅔ",
  "ㅕ",
  "ㅖ",
  "ㅗ",
  "ㅘ",
  "ㅙ",
  "ㅚ",
  "ㅛ",
  "ㅜ",
  "ㅝ",
  "ㅞ",
  "ㅟ",
  "ㅠ",
  "ㅡ",
  "ㅢ",
  "ㅣ"
] as const;

const COMPAT_JONGSEONG = [
  "",
  "ㄱ",
  "ㄲ",
  "ㄳ",
  "ㄴ",
  "ㄵ",
  "ㄶ",
  "ㄷ",
  "ㄹ",
  "ㄺ",
  "ㄻ",
  "ㄼ",
  "ㄽ",
  "ㄾ",
  "ㄿ",
  "ㅀ",
  "ㅁ",
  "ㅂ",
  "ㅄ",
  "ㅅ",
  "ㅆ",
  "ㅇ",
  "ㅈ",
  "ㅊ",
  "ㅋ",
  "ㅌ",
  "ㅍ",
  "ㅎ"
] as const;

export interface NameBlockSyllableFeature {
  syllable: string;
  jung: string;
  jong: string | null;
  hasJong: boolean;
}

export interface NameBlockSyllableRuleCandidate {
  nameHangul: string;
  s1: NameBlockSyllableFeature;
  s2: NameBlockSyllableFeature;
}

function analyzeHangulSyllableFeature(char: string): NameBlockSyllableFeature | null {
  const codePoint = char.codePointAt(0);
  if (codePoint === undefined || codePoint < HANGUL_BASE || codePoint > HANGUL_END) {
    return null;
  }

  const syllableIndex = codePoint - HANGUL_BASE;
  const jungIndex = Math.floor((syllableIndex % (JUNGSEONG_COUNT * JONGSEONG_COUNT)) / JONGSEONG_COUNT);
  const jongIndex = syllableIndex % JONGSEONG_COUNT;
  const jung = COMPAT_JUNGSEONG[jungIndex];
  const jong = COMPAT_JONGSEONG[jongIndex];
  if (!jung || jong === undefined) {
    return null;
  }

  return {
    syllable: char,
    jung,
    jong: jong.length > 0 ? jong : null,
    hasJong: jongIndex !== 0,
  };
}

export function analyzeNameBlockSyllableRule(rawName: string): NameBlockSyllableRuleCandidate | null {
  const normalizedName = rawName.trim().normalize("NFC");
  const chars = Array.from(normalizedName);
  if (chars.length !== 2) {
    return null;
  }

  const s1 = analyzeHangulSyllableFeature(chars[0]);
  const s2 = analyzeHangulSyllableFeature(chars[1]);
  if (!s1 || !s2) {
    return null;
  }

  return {
    nameHangul: normalizedName,
    s1,
    s2,
  };
}
