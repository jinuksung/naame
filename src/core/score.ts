import type {
  Gender,
  LoadedInput,
  NameCandidate,
  ScoreBreakdown,
  ScoredCandidate,
  SyllableStats,
  Tier
} from "../types";

const BASE_BONUS_BY_TIER: Record<Tier, number> = {
  A: 2,
  B: 3,
  C: 1
};

function round2(value: number): number {
  return Math.round(value * 100) / 100;
}

function isMidPercentile(percentile: number): boolean {
  return percentile >= 0.3 && percentile <= 0.7;
}

function hasJongseong(syllable: string): boolean {
  const code = syllable.codePointAt(0);
  if (code === undefined || code < 0xac00 || code > 0xd7a3) {
    return false;
  }
  const s = code - 0xac00;
  const jong = s % 28;
  return jong !== 0;
}

function computeStyleScore(
  candidate: NameCandidate,
  targetProfile: SyllableStats["profiles"][Gender]
): number {
  const start = candidate.features.start;
  const end = candidate.features.end;
  let style = 0;

  if (targetProfile.commonStartSet.has(start)) {
    style -= 1.5;
  }
  if (targetProfile.commonEndSet.has(end)) {
    style -= 1.5;
  }

  const startAllPct = targetProfile.allPercentile.get(start) ?? 0;
  const endAllPct = targetProfile.allPercentile.get(end) ?? 0;
  if (isMidPercentile(startAllPct)) {
    style += 0.5;
  }
  if (isMidPercentile(endAllPct)) {
    style += 0.5;
  }

  if (hasJongseong(start) && hasJongseong(end)) {
    style -= 0.5;
  }

  return round2(style);
}

function computeStabilityScore(
  candidate: NameCandidate,
  targetProfile: SyllableStats["profiles"][Gender],
  input: LoadedInput
): number {
  const start = candidate.features.start;
  const end = candidate.features.end;
  const startPct = targetProfile.allPercentile.get(start) ?? 0;
  const endPct = targetProfile.allPercentile.get(end) ?? 0;

  let stability = 0;
  if (input.allTwoSyllableSet.has(candidate.name)) {
    stability += 1;
  }

  if (startPct >= 0.25 && endPct >= 0.25) {
    stability += 0.5;
  }

  if (startPct <= 0.1 && endPct <= 0.1) {
    stability -= 1;
  }

  return round2(stability);
}

function computeGenderFitScore(
  candidate: NameCandidate,
  targetGender: Gender,
  input: LoadedInput,
  stats: SyllableStats
): number {
  const oppositeGender: Gender = targetGender === "M" ? "F" : "M";
  const targetSet = input.byGenderTwoSyllable[targetGender];
  const oppositeSet = input.byGenderTwoSyllable[oppositeGender];
  const targetProfile = stats.profiles[targetGender];
  const oppositeProfile = stats.profiles[oppositeGender];
  let fit = 0;

  const inTarget = targetSet.has(candidate.name);
  const inOpposite = oppositeSet.has(candidate.name);
  if (inTarget && !inOpposite) {
    fit += 1.5;
  } else if (!inTarget && inOpposite) {
    fit -= 1.5;
  }

  const end = candidate.features.end;
  const endTargetPct = targetProfile.endPercentile.get(end) ?? 0;
  const endOppositePct = oppositeProfile.endPercentile.get(end) ?? 0;

  if (endTargetPct >= 0.6) {
    fit += 0.5;
  }
  if (endOppositePct >= 0.75 && endTargetPct < 0.4) {
    fit -= 0.5;
  }

  return round2(fit);
}

export function scoreCandidates(
  candidates: NameCandidate[],
  targetGender: Gender,
  input: LoadedInput,
  stats: SyllableStats
): ScoredCandidate[] {
  const targetProfile = stats.profiles[targetGender];

  return candidates.map((candidate) => {
    const baseBonus = BASE_BONUS_BY_TIER[candidate.tier];
    const styleScore = computeStyleScore(candidate, targetProfile);
    const stabilityScore = computeStabilityScore(candidate, targetProfile, input);
    const genderFitScore = computeGenderFitScore(candidate, targetGender, input, stats);
    const scoreBreakdown: ScoreBreakdown = {
      baseBonus,
      styleScore,
      stabilityScore,
      genderFitScore
    };
    const score = round2(baseBonus + styleScore + stabilityScore + genderFitScore);

    return {
      ...candidate,
      score,
      scoreBreakdown
    };
  });
}
