import { FiveElement, SajuElementVector } from "../../types";

const HANGUL_START = 0xac00;
const HANGUL_END = 0xd7a3;
const ELEMENTS: FiveElement[] = ["WOOD", "FIRE", "EARTH", "METAL", "WATER"];
const TARGET_SAJU_VALUE = 20;

export type ElementSynergyMatrix = Record<FiveElement, Record<FiveElement, number>>;

export interface SurnameInfluenceConfig {
  weightBaseName: number;
  weightSurnameSynergy: number;
  weightSurnamePronFlow: number;
  weightBalance3: number;
  beamTopK: number;
  elementSynergyMatrix: ElementSynergyMatrix;
}

export interface SurnameSynergyInput {
  surnameElement?: FiveElement;
  char1Element?: FiveElement;
  char2Element?: FiveElement;
  config: SurnameInfluenceConfig;
}

export interface Balance3Input {
  surnameElement?: FiveElement;
  char1Element?: FiveElement;
  char2Element?: FiveElement;
  sajuVector?: SajuElementVector;
  config: SurnameInfluenceConfig;
}

export interface ScoreDetail {
  score: number;
  reasons: string[];
}

function clamp01(value: number): number {
  return Math.max(0, Math.min(1, value));
}

function parseNumberEnv(value: string | undefined, fallback: number): number {
  if (!value) {
    return fallback;
  }
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) {
    return fallback;
  }
  return parsed;
}

function parseIntegerEnv(value: string | undefined, fallback: number): number {
  if (!value) {
    return fallback;
  }
  const parsed = Math.floor(Number(value));
  if (!Number.isFinite(parsed)) {
    return fallback;
  }
  return parsed;
}

function createElementSynergyMatrix(
  generateScore: number,
  sameScore: number,
  overcomeScore: number
): ElementSynergyMatrix {
  const matrix: ElementSynergyMatrix = {
    WOOD: { WOOD: 0, FIRE: 0, EARTH: 0, METAL: 0, WATER: 0 },
    FIRE: { WOOD: 0, FIRE: 0, EARTH: 0, METAL: 0, WATER: 0 },
    EARTH: { WOOD: 0, FIRE: 0, EARTH: 0, METAL: 0, WATER: 0 },
    METAL: { WOOD: 0, FIRE: 0, EARTH: 0, METAL: 0, WATER: 0 },
    WATER: { WOOD: 0, FIRE: 0, EARTH: 0, METAL: 0, WATER: 0 }
  };

  for (const element of ELEMENTS) {
    matrix[element][element] = sameScore;
  }

  const generatePairs: Array<[FiveElement, FiveElement]> = [
    ["WOOD", "FIRE"],
    ["FIRE", "EARTH"],
    ["EARTH", "METAL"],
    ["METAL", "WATER"],
    ["WATER", "WOOD"]
  ];
  for (const [a, b] of generatePairs) {
    matrix[a][b] = generateScore;
  }

  const overcomePairs: Array<[FiveElement, FiveElement]> = [
    ["WOOD", "EARTH"],
    ["EARTH", "WATER"],
    ["WATER", "FIRE"],
    ["FIRE", "METAL"],
    ["METAL", "WOOD"]
  ];
  for (const [a, b] of overcomePairs) {
    matrix[a][b] = overcomeScore;
  }

  return matrix;
}

function matrixRange(matrix: ElementSynergyMatrix): { min: number; max: number } {
  let min = Number.POSITIVE_INFINITY;
  let max = Number.NEGATIVE_INFINITY;

  for (const rowKey of ELEMENTS) {
    for (const colKey of ELEMENTS) {
      const value = matrix[rowKey][colKey];
      if (value < min) {
        min = value;
      }
      if (value > max) {
        max = value;
      }
    }
  }

  if (!Number.isFinite(min) || !Number.isFinite(max)) {
    return { min: -1, max: 1 };
  }
  if (min === max) {
    return { min: min - 1, max: max + 1 };
  }
  return { min, max };
}

function normalize(value: number, min: number, max: number): number {
  if (!Number.isFinite(value) || !Number.isFinite(min) || !Number.isFinite(max) || max <= min) {
    return 0.5;
  }
  return clamp01((value - min) / (max - min));
}

function isHangulSyllable(ch: string): boolean {
  const code = ch.charCodeAt(0);
  return code >= HANGUL_START && code <= HANGUL_END;
}

function getInitialIndex(syllable: string): number {
  const code = syllable.charCodeAt(0);
  return Math.floor((code - HANGUL_START) / 588);
}

function getVowelIndex(syllable: string): number {
  const code = syllable.charCodeAt(0);
  return Math.floor(((code - HANGUL_START) % 588) / 28);
}

function getFinalIndex(syllable: string): number {
  const code = syllable.charCodeAt(0);
  return (code - HANGUL_START) % 28;
}

function toScoreDetail(score: number, reasons: string[]): ScoreDetail {
  return {
    score: clamp01(score),
    reasons
  };
}

export const DEFAULT_SURNAME_INFLUENCE_CONFIG: SurnameInfluenceConfig = {
  weightBaseName: 0.55,
  weightSurnameSynergy: 0.3,
  weightSurnamePronFlow: 0.1,
  weightBalance3: 0.05,
  beamTopK: 30,
  elementSynergyMatrix: createElementSynergyMatrix(1, 0.2, -1)
};

export function resolveSurnameInfluenceConfig(): SurnameInfluenceConfig {
  const generateScore = parseNumberEnv(
    process.env.SURNAME_ELEMENT_GENERATE_SCORE,
    1
  );
  const sameScore = parseNumberEnv(
    process.env.SURNAME_ELEMENT_SAME_SCORE,
    0.2
  );
  const overcomeScore = parseNumberEnv(
    process.env.SURNAME_ELEMENT_OVERCOME_SCORE,
    -1
  );

  const matrix = createElementSynergyMatrix(generateScore, sameScore, overcomeScore);

  return {
    weightBaseName: clamp01(parseNumberEnv(process.env.SURNAME_WEIGHT_BASE, 0.55)),
    weightSurnameSynergy: clamp01(parseNumberEnv(process.env.SURNAME_WEIGHT_SYNERGY, 0.3)),
    weightSurnamePronFlow: clamp01(parseNumberEnv(process.env.SURNAME_WEIGHT_PRON_FLOW, 0.1)),
    weightBalance3: clamp01(parseNumberEnv(process.env.SURNAME_WEIGHT_BALANCE3, 0.05)),
    beamTopK: Math.max(5, parseIntegerEnv(process.env.SURNAME_BEAM_TOP_K, 30)),
    elementSynergyMatrix: matrix
  };
}

export function elementSynergy(
  elementA: FiveElement,
  elementB: FiveElement,
  matrix: ElementSynergyMatrix
): number {
  return matrix[elementA][elementB];
}

export function scoreSurnameSynergy(input: SurnameSynergyInput): ScoreDetail {
  const reasons: string[] = [];
  const matrix = input.config.elementSynergyMatrix;
  const relations: number[] = [];

  if (input.surnameElement && input.char1Element) {
    const score = elementSynergy(input.surnameElement, input.char1Element, matrix);
    relations.push(score);
    reasons.push(`s->c1=${score.toFixed(2)}`);
  }

  if (input.surnameElement && input.char2Element) {
    const score = elementSynergy(input.surnameElement, input.char2Element, matrix);
    relations.push(score);
    reasons.push(`s->c2=${score.toFixed(2)}`);
  }

  if (input.char1Element && input.char2Element) {
    const score = elementSynergy(input.char1Element, input.char2Element, matrix);
    relations.push(score);
    reasons.push(`c1->c2=${score.toFixed(2)}`);
  }

  if (relations.length === 0) {
    return {
      score: 0.5,
      reasons: ["오행 정보 부족으로 중립 점수"]
    };
  }

  const { min, max } = matrixRange(matrix);
  const sum = relations.reduce((acc, value) => acc + value, 0);
  const normalized = normalize(sum, min * relations.length, max * relations.length);

  return toScoreDetail(normalized, reasons);
}

export function scoreBalance3(input: Balance3Input): ScoreDetail {
  const reasons: string[] = [];
  const elements = [input.surnameElement, input.char1Element, input.char2Element].filter(
    (value): value is FiveElement => Boolean(value)
  );

  if (elements.length < 2) {
    return {
      score: 0.5,
      reasons: ["3글자 오행 정보 부족으로 중립 점수"]
    };
  }

  const counts = new Map<FiveElement, number>();
  for (const element of elements) {
    counts.set(element, (counts.get(element) ?? 0) + 1);
  }

  const uniqueCount = counts.size;
  const maxCount = Math.max(...Array.from(counts.values()));
  const diversityScore = (uniqueCount - 1) / 2;
  const concentrationPenalty = (maxCount - 1) / (elements.length - 1);

  let score = clamp01(diversityScore * 0.65 + (1 - concentrationPenalty) * 0.35);
  reasons.push(`unique=${uniqueCount} maxCount=${maxCount}`);

  if (input.sajuVector) {
    const deficits = ELEMENTS.map((element) => ({
      element,
      deficit: TARGET_SAJU_VALUE - input.sajuVector![element]
    })).sort((a, b) => b.deficit - a.deficit);

    const mostLacking = deficits[0];
    if (mostLacking && mostLacking.deficit > 0) {
      if (counts.has(mostLacking.element)) {
        score = clamp01(score + 0.12);
        reasons.push(`부족 오행(${mostLacking.element}) 보강 +0.12`);
      } else {
        score = clamp01(score - 0.05);
        reasons.push(`부족 오행(${mostLacking.element}) 미보강 -0.05`);
      }
    }
  }

  return toScoreDetail(score, reasons);
}

export function scoreSurnamePronunciationFlow(
  surnameReading: string,
  nameReading2: string
): ScoreDetail {
  const reasons: string[] = [];
  const surnameSyllables = Array.from(surnameReading).filter(isHangulSyllable);
  const nameSyllables = Array.from(nameReading2).filter(isHangulSyllable);

  if (surnameSyllables.length === 0 || nameSyllables.length === 0) {
    return {
      score: 0.5,
      reasons: ["발음 정보 부족으로 중립 점수"]
    };
  }

  const surnameLast = surnameSyllables[surnameSyllables.length - 1];
  const nameFirst = nameSyllables[0];
  const nameSecond = nameSyllables[1] ?? "";

  let score = 0.78;

  if (surnameLast === nameFirst) {
    score -= 0.35;
    reasons.push("성 끝 음절과 이름 첫 음절 동일 감점");
  }

  if (nameSecond && surnameLast === nameSecond) {
    score -= 0.08;
    reasons.push("성 끝 음절과 이름 둘째 음절 동일 감점");
  }

  const surnameInitial = getInitialIndex(surnameLast);
  const nameInitial = getInitialIndex(nameFirst);
  if (surnameInitial === nameInitial) {
    score -= 0.12;
    reasons.push("초성 반복 감점");
  } else {
    score += 0.06;
    reasons.push("초성 대비 가산");
  }

  const surnameVowel = getVowelIndex(surnameLast);
  const nameVowel = getVowelIndex(nameFirst);
  if (surnameVowel === nameVowel) {
    score -= 0.06;
    reasons.push("연속 모음 유사 감점");
  }

  const surnameFinal = getFinalIndex(surnameLast);
  if (surnameFinal !== 0 && surnameInitial === nameInitial) {
    score -= 0.05;
    reasons.push("종성-초성 충돌 감점");
  }

  if (nameSecond && nameFirst === nameSecond) {
    score -= 0.1;
    reasons.push("이름 내부 동일 음절 반복 감점");
  }

  return toScoreDetail(score, reasons);
}
