import { PriorIndex } from "./buildNamePrior";

export type PriorGate =
  | "PASS"
  | "FAIL_SYLLABLE"
  | "FAIL_BLACKLIST"
  | "FAIL_PATTERN";

export interface PriorGateResult {
  gate: PriorGate;
  reasons: string[];
  penalty01: number;
}

export interface PriorGateOptions {
  strict?: boolean;
  blacklist?: Set<string>;
}

const TWO_SYLLABLE_HANGUL_PATTERN = /^[가-힣]{2}$/;
const SUFFIX_DO_PATTERN = /도$/;

export const DEFAULT_NAME_BLACKLIST = new Set<string>([
  "가지",
  "가나",
  "고지",
  "규도",
  "가가",
  "다다",
]);

function clamp01(value: number): number {
  return Math.max(0, Math.min(1, value));
}

export function isTwoSyllableHangulName(name: string): boolean {
  return TWO_SYLLABLE_HANGUL_PATTERN.test(name);
}

export function evaluateNamePriorGate(
  name2: string,
  priorIndex: PriorIndex,
  options: PriorGateOptions = {},
): PriorGateResult {
  const strict = options.strict ?? true;
  const blacklist = options.blacklist ?? DEFAULT_NAME_BLACKLIST;
  const reasons: string[] = [];
  let penalty01 = 0;

  if (!isTwoSyllableHangulName(name2)) {
    return {
      gate: "FAIL_PATTERN",
      penalty01: 1,
      reasons: ["2글자 한글 이름 패턴이 아님"],
    };
  }

  const s1 = name2[0];
  const s2 = name2[1];
  const allSyllables = priorIndex.syllableSetByGender.ALL;

  if (blacklist.has(name2)) {
    reasons.push("blacklist 일치");
    return {
      gate: "FAIL_BLACKLIST",
      penalty01: 1,
      reasons,
    };
  }

  if (allSyllables.size === 0) {
    return {
      gate: "PASS",
      penalty01: 0,
      reasons: ["prior whitelist 데이터 비어 gate 생략"],
    };
  }

  const hasS1 = allSyllables.has(s1);
  const hasS2 = allSyllables.has(s2);

  if (strict) {
    if (!hasS1 || !hasS2) {
      reasons.push(
        `strict whitelist 불충족 (${s1}:${hasS1 ? "OK" : "X"}, ${s2}:${hasS2 ? "OK" : "X"})`,
      );
      return {
        gate: "FAIL_SYLLABLE",
        penalty01: 1,
        reasons,
      };
    }
  } else {
    if (!hasS1 && !hasS2) {
      reasons.push(`relaxed whitelist 불충족 (${s1}, ${s2} 모두 미등록)`);
      return {
        gate: "FAIL_SYLLABLE",
        penalty01: 1,
        reasons,
      };
    }
    if (!hasS1 || !hasS2) {
      penalty01 += 0.2;
      reasons.push("relaxed whitelist 통과(한 음절 미등록) 감점");
    }
  }

  if (s1 === s2) {
    penalty01 += 0.12;
    reasons.push("동일 음절 반복 패턴 감점");
  }

  const knownBigram = priorIndex.bigramSetByGender.ALL.has(name2);
  if (SUFFIX_DO_PATTERN.test(name2) && !knownBigram) {
    penalty01 += 0.1;
    reasons.push("비상위권 '~도' 패턴 감점");
  }

  return {
    gate: "PASS",
    penalty01: clamp01(penalty01),
    reasons,
  };
}
