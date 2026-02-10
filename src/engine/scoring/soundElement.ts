import { FiveElement, SoundElementScoreResult } from "../../types";

const HANGUL_START = 0xac00;
const HANGUL_END = 0xd7a3;

const WOOD_INITIALS = new Set([0, 1, 15]); // ㄱㄲㅋ
const FIRE_INITIALS = new Set([2, 3, 4, 16]); // ㄴㄷㄸㅌ
const EARTH_INITIALS = new Set([11, 18]); // ㅇㅎ
const METAL_INITIALS = new Set([5]); // ㄹ
const WATER_INITIALS = new Set([6, 7, 8, 17]); // ㅁㅂㅃㅍ

function clampScore(score: number): number {
  return Math.max(0, Math.min(100, score));
}

function isHangulSyllable(ch: string): boolean {
  const code = ch.charCodeAt(0);
  return code >= HANGUL_START && code <= HANGUL_END;
}

function getInitialIndex(syllable: string): number {
  const code = syllable.charCodeAt(0);
  return Math.floor((code - HANGUL_START) / 588);
}

function initialToElement(initialIndex: number): FiveElement {
  if (WOOD_INITIALS.has(initialIndex)) {
    return "WOOD";
  }
  if (FIRE_INITIALS.has(initialIndex)) {
    return "FIRE";
  }
  if (EARTH_INITIALS.has(initialIndex)) {
    return "EARTH";
  }
  if (METAL_INITIALS.has(initialIndex)) {
    return "METAL";
  }
  if (WATER_INITIALS.has(initialIndex)) {
    return "WATER";
  }
  return "WATER";
}

export function scoreSoundElement(nameHangul: string): SoundElementScoreResult {
  const reasons: string[] = [];
  const elements: FiveElement[] = [];

  for (const ch of [...nameHangul].filter(isHangulSyllable)) {
    elements.push(initialToElement(getInitialIndex(ch)));
  }

  let score = 80;

  const uniqueElements = Array.from(new Set(elements));
  const uniqueElementCount = uniqueElements.length;

  if (uniqueElementCount >= 2) {
    score += 10;
    reasons.push(`초성 오행 분산 2개 이상 (${uniqueElementCount})`);
  }
  if (uniqueElementCount >= 3) {
    score += 5;
    reasons.push(`초성 오행 분산 3개 이상 (${uniqueElementCount})`);
  }
  if (uniqueElementCount === 0) {
    reasons.push("한글 음절이 없어 기본 점수 적용");
  }

  return {
    score: clampScore(score),
    reasons,
    elements,
    uniqueElementCount
  };
}
