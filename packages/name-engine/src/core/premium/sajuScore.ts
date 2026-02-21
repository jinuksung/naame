import {
  blendDist,
  createZeroDist,
  ELEMENT_KEYS,
  ELEMENT_LABELS_KO,
  ElementDist,
  ElementKey
} from "./elements";

export type SajuScoreMode = "IMPROVE" | "HARMONY";

export interface SajuScoreInput {
  distSaju: ElementDist;
  distFullName: ElementDist;
}

export interface SajuScoreResult {
  mode: SajuScoreMode;
  need: ElementDist;
  sumNeed: number;
  finalDist: ElementDist;
  sajuScore5: number;
  improveRatio: number | null;
  harmonyRatio: number | null;
}

function clamp(value: number, min: number, max: number): number {
  if (!Number.isFinite(value)) {
    return min;
  }
  return Math.max(min, Math.min(max, value));
}

export function roundToHalf(value: number): number {
  return Math.round(value * 2) / 2;
}

export function pickWeakTop2(distSaju: ElementDist): ElementKey[] {
  return [...ELEMENT_KEYS]
    .sort((a, b) => {
      if (distSaju[a] !== distSaju[b]) {
        return distSaju[a] - distSaju[b];
      }
      return a.localeCompare(b);
    })
    .slice(0, 2);
}

export function calcNeed(distSaju: ElementDist): ElementDist {
  const need = createZeroDist();
  for (const key of ELEMENT_KEYS) {
    need[key] = Math.max(0, 0.2 - distSaju[key]);
  }
  return need;
}

export function calcSajuScore5(input: SajuScoreInput): SajuScoreResult {
  const need = calcNeed(input.distSaju);
  const sumNeed = ELEMENT_KEYS.reduce((sum, key) => sum + need[key], 0);
  const finalDist = blendDist(input.distSaju, input.distFullName, 0.75);

  if (sumNeed > 0) {
    const improveNumerator = ELEMENT_KEYS.reduce((sum, key) => {
      return sum + Math.min(need[key], input.distFullName[key]);
    }, 0);
    const improveRatio = clamp(improveNumerator / sumNeed, 0, 1);
    return {
      mode: "IMPROVE",
      need,
      sumNeed,
      finalDist,
      sajuScore5: roundToHalf(improveRatio * 5),
      improveRatio,
      harmonyRatio: null
    };
  }

  const delta = ELEMENT_KEYS.reduce((sum, key) => {
    return sum + Math.abs(finalDist[key] - input.distSaju[key]);
  }, 0);
  const harmonyRatio = clamp(1 - delta / 0.5, 0, 1);

  return {
    mode: "HARMONY",
    need,
    sumNeed,
    finalDist,
    sajuScore5: roundToHalf(harmonyRatio * 5),
    improveRatio: null,
    harmonyRatio
  };
}

export function buildSajuOneLineSummary(
  mode: SajuScoreMode,
  dayStem: string,
  weakTop2: ElementKey[]
): string {
  if (mode === "HARMONY") {
    return "현재 사주는 전반적으로 균형에 가까워 조화 중심으로 추천됩니다.";
  }

  const weakText = weakTop2.map((key) => ELEMENT_LABELS_KO[key]).join("/");
  return `일간이 ${dayStem}이며 ${weakText} 기운이 상대적으로 약한 편입니다.`;
}
