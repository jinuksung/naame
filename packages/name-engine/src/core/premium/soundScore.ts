import { ElementKey } from "./elements";
import { SajuScoreMode, roundToHalf } from "./sajuScore";

export interface SoundScoreInput {
  mode: SajuScoreMode;
  weakTop2: ElementKey[];
  soundElements: ElementKey[];
  phoneticScore: number;
}

export interface SoundScoreResult {
  soundScore5: number;
  matchedWeakCount: number;
  flowAdjustment: number;
}

function clamp(value: number, min: number, max: number): number {
  if (!Number.isFinite(value)) {
    return min;
  }
  return Math.max(min, Math.min(max, value));
}

function resolveImproveBaseScore(matchCount: number): number {
  if (matchCount >= 2) {
    return 4.5;
  }
  if (matchCount === 1) {
    return 3.5;
  }
  return 2.5;
}

function resolveFlowAdjustment(phoneticScore: number): number {
  if (phoneticScore >= 86) {
    return 0.5;
  }
  if (phoneticScore <= 74) {
    return -0.5;
  }
  return 0;
}

export function calcSoundScore5(input: SoundScoreInput): SoundScoreResult {
  const uniqueSoundElements = new Set(input.soundElements);
  const matchedWeakCount = input.weakTop2.filter((element) => uniqueSoundElements.has(element)).length;

  const baseScore =
    input.mode === "IMPROVE" ? resolveImproveBaseScore(matchedWeakCount) : 3.5;
  const flowAdjustment = resolveFlowAdjustment(input.phoneticScore);
  const soundScore5 = roundToHalf(clamp(baseScore + flowAdjustment, 0, 5));

  return {
    soundScore5,
    matchedWeakCount,
    flowAdjustment
  };
}
