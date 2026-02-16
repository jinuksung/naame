const HANGUL_BASE = 0xac00;
const HANGUL_END = 0xd7a3;
const MODERN_CHOSEONG_START = 0x1100;
const MODERN_CHOSEONG_END = 0x1112;
const MODERN_JUNGSEONG_START = 0x1161;
const MODERN_JUNGSEONG_END = 0x1175;
const MODERN_JONGSEONG_START = 0x11a8;
const MODERN_JONGSEONG_END = 0x11c2;

const COMPAT_CHOSEONG = [
  "ㄱ", "ㄲ", "ㄴ", "ㄷ", "ㄸ", "ㄹ", "ㅁ", "ㅂ", "ㅃ", "ㅅ",
  "ㅆ", "ㅇ", "ㅈ", "ㅉ", "ㅊ", "ㅋ", "ㅌ", "ㅍ", "ㅎ"
];

const COMPAT_JUNGSEONG = [
  "ㅏ", "ㅐ", "ㅑ", "ㅒ", "ㅓ", "ㅔ", "ㅕ", "ㅖ", "ㅗ", "ㅘ", "ㅙ",
  "ㅚ", "ㅛ", "ㅜ", "ㅝ", "ㅞ", "ㅟ", "ㅠ", "ㅡ", "ㅢ", "ㅣ"
];

const COMPAT_JONGSEONG = [
  "", "ㄱ", "ㄲ", "ㄳ", "ㄴ", "ㄵ", "ㄶ", "ㄷ", "ㄹ", "ㄺ", "ㄻ",
  "ㄼ", "ㄽ", "ㄾ", "ㄿ", "ㅀ", "ㅁ", "ㅂ", "ㅄ", "ㅅ", "ㅆ", "ㅇ",
  "ㅈ", "ㅊ", "ㅋ", "ㅌ", "ㅍ", "ㅎ"
];

const CHOSEONG_TO_INDEX = new Map(COMPAT_CHOSEONG.map((char, index) => [char, index]));
const JUNGSEONG_TO_INDEX = new Map(COMPAT_JUNGSEONG.map((char, index) => [char, index]));
const JONGSEONG_TO_INDEX = new Map(COMPAT_JONGSEONG.map((char, index) => [char, index]));

const COMBINED_JUNGSEONG = new Map([
  ["ㅗㅏ", "ㅘ"],
  ["ㅗㅐ", "ㅙ"],
  ["ㅗㅣ", "ㅚ"],
  ["ㅜㅓ", "ㅝ"],
  ["ㅜㅔ", "ㅞ"],
  ["ㅜㅣ", "ㅟ"],
  ["ㅡㅣ", "ㅢ"]
]);

const COMBINED_JONGSEONG = new Map([
  ["ㄱㅅ", "ㄳ"],
  ["ㄴㅈ", "ㄵ"],
  ["ㄴㅎ", "ㄶ"],
  ["ㄹㄱ", "ㄺ"],
  ["ㄹㅁ", "ㄻ"],
  ["ㄹㅂ", "ㄼ"],
  ["ㄹㅅ", "ㄽ"],
  ["ㄹㅌ", "ㄾ"],
  ["ㄹㅍ", "ㄿ"],
  ["ㄹㅎ", "ㅀ"],
  ["ㅂㅅ", "ㅄ"]
]);

function isCompatibilityChoseong(char: string): boolean {
  return CHOSEONG_TO_INDEX.has(char);
}

function isCompatibilityJungseong(char: string): boolean {
  return JUNGSEONG_TO_INDEX.has(char);
}

function isCompatibilityJongseong(char: string): boolean {
  const index = JONGSEONG_TO_INDEX.get(char);
  return typeof index === "number" && index > 0;
}

function toCompatibilityJamo(text: string): string[] {
  const converted: string[] = [];

  for (const char of Array.from(text)) {
    const codePoint = char.codePointAt(0);
    if (typeof codePoint !== "number") {
      continue;
    }

    if (codePoint >= HANGUL_BASE && codePoint <= HANGUL_END) {
      const syllableIndex = codePoint - HANGUL_BASE;
      const choseongIndex = Math.floor(syllableIndex / 588);
      const jungseongIndex = Math.floor((syllableIndex % 588) / 28);
      const jongseongIndex = syllableIndex % 28;

      converted.push(COMPAT_CHOSEONG[choseongIndex]);
      converted.push(COMPAT_JUNGSEONG[jungseongIndex]);
      if (jongseongIndex > 0) {
        converted.push(COMPAT_JONGSEONG[jongseongIndex]);
      }
      continue;
    }

    if (codePoint >= MODERN_CHOSEONG_START && codePoint <= MODERN_CHOSEONG_END) {
      converted.push(COMPAT_CHOSEONG[codePoint - MODERN_CHOSEONG_START]);
      continue;
    }

    if (codePoint >= MODERN_JUNGSEONG_START && codePoint <= MODERN_JUNGSEONG_END) {
      converted.push(COMPAT_JUNGSEONG[codePoint - MODERN_JUNGSEONG_START]);
      continue;
    }

    if (codePoint >= MODERN_JONGSEONG_START && codePoint <= MODERN_JONGSEONG_END) {
      converted.push(COMPAT_JONGSEONG[codePoint - MODERN_JONGSEONG_START + 1]);
      continue;
    }

    converted.push(char);
  }

  return converted;
}

function composeSyllable(choseong: string, jungseong: string, jongseong: string): string | null {
  const l = CHOSEONG_TO_INDEX.get(choseong);
  const v = JUNGSEONG_TO_INDEX.get(jungseong);
  const t = JONGSEONG_TO_INDEX.get(jongseong);

  if (typeof l !== "number" || typeof v !== "number" || typeof t !== "number") {
    return null;
  }

  const codePoint = HANGUL_BASE + (l * 21 + v) * 28 + t;
  return String.fromCodePoint(codePoint);
}

function composeCompatibilityJamo(chars: string[]): string {
  const output: string[] = [];

  let i = 0;
  while (i < chars.length) {
    const choseong = chars[i];
    const next = chars[i + 1];

    if (!isCompatibilityChoseong(choseong) || !isCompatibilityJungseong(next)) {
      output.push(choseong);
      i += 1;
      continue;
    }

    let jungseong = next;
    let cursor = i + 2;

    if (isCompatibilityJungseong(chars[cursor])) {
      const combined = COMBINED_JUNGSEONG.get(`${jungseong}${chars[cursor]}`);
      if (combined) {
        jungseong = combined;
        cursor += 1;
      }
    }

    let jongseong = "";
    const c1 = chars[cursor];
    const c2 = chars[cursor + 1];
    const c3 = chars[cursor + 2];

    if (isCompatibilityJongseong(c1)) {
      if (isCompatibilityJongseong(c2)) {
        const combined = COMBINED_JONGSEONG.get(`${c1}${c2}`);
        if (combined && !isCompatibilityJungseong(c3)) {
          jongseong = combined;
          cursor += 2;
        } else if (!isCompatibilityJungseong(c2)) {
          jongseong = c1;
          cursor += 1;
        }
      } else if (!isCompatibilityJungseong(c2)) {
        jongseong = c1;
        cursor += 1;
      }
    }

    const syllable = composeSyllable(choseong, jungseong, jongseong);
    if (syllable) {
      output.push(syllable);
    } else {
      output.push(choseong, jungseong);
      if (jongseong) {
        output.push(jongseong);
      }
    }

    i = cursor;
  }

  return output.join("");
}

export function normalizeHangulReading(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) {
    return "";
  }

  const compatChars = toCompatibilityJamo(trimmed.normalize("NFC"));
  return composeCompatibilityJamo(compatChars).normalize("NFC");
}

export function normalizeHangulReadingWithLimit(value: string, maxChars: number): string {
  const normalized = normalizeHangulReading(value);
  if (!Number.isFinite(maxChars) || maxChars < 1) {
    return normalized;
  }

  return Array.from(normalized).slice(0, Math.floor(maxChars)).join("");
}
