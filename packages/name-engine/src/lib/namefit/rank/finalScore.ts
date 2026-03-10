import { Gender as EngineGender } from "../../../types";
import { PriorIndex } from "../prior/buildNamePrior";
import { PriorGate } from "../prior/gates";
import { Gender as PriorGender, scoreNamePrior } from "../prior/namePriorScore";

export interface CandidateWithEngineScore {
  nameHangul: string;
  scores: {
    total: number;
  };
}

export interface FinalScoreConfig {
  priorWeight?: number;
  strictGate?: boolean;
  allowNonWhitelist?: boolean;
}

export interface FinalScoreEvaluation<T extends CandidateWithEngineScore> {
  candidate: T;
  gate: PriorGate;
  dropped: boolean;
  reasons: string[];
  engineScore01: number;
  priorScore01: number;
  finalScore01: number;
}

const DEFAULT_PRIOR_WEIGHT = 0.35;

function clamp01(value: number): number {
  return Math.max(0, Math.min(1, value));
}

function gatePenalty(gate: PriorGate): number {
  switch (gate) {
    case "FAIL_BLACKLIST":
      return 0.95;
    case "FAIL_SYLLABLE":
      return 0.45;
    case "FAIL_PATTERN":
      return 0.35;
    case "PASS":
    default:
      return 0;
  }
}

export function normalizeEngineScore(score: number): number {
  if (!Number.isFinite(score)) {
    return 0;
  }
  if (score <= 1) {
    return clamp01(score);
  }
  return clamp01(score / 100);
}

export function mapEngineGenderToPriorGender(gender: EngineGender): PriorGender {
  if (gender === "MALE") {
    return "M";
  }
  if (gender === "FEMALE") {
    return "F";
  }
  return "U";
}

export function applyFinalScoreWithPrior<T extends CandidateWithEngineScore>(
  candidates: T[],
  gender: PriorGender,
  priorIndex: PriorIndex,
  config: FinalScoreConfig = {}
): FinalScoreEvaluation<T>[] {
  const strictGate = config.strictGate ?? true;
  const allowNonWhitelist = config.allowNonWhitelist ?? false;
  const priorWeight = clamp01(config.priorWeight ?? DEFAULT_PRIOR_WEIGHT);
  const engineWeight = 1 - priorWeight;

  return candidates.map((candidate) => {
    const engineScore01 = normalizeEngineScore(candidate.scores.total);

    if (candidate.nameHangul.length !== 2) {
      return {
        candidate,
        gate: "PASS",
        dropped: false,
        reasons: ["2글자 이름이 아니어서 prior 스킵"],
        engineScore01,
        priorScore01: 0.5,
        finalScore01: engineScore01
      };
    }

    const prior = scoreNamePrior(candidate.nameHangul, gender, priorIndex, {
      strict: strictGate
    });

    let dropped = false;
    let priorScore01 = prior.priorScore01;
    if (prior.gate === "FAIL_BLACKLIST") {
      dropped = true;
    } else if (prior.gate !== "PASS") {
      if (allowNonWhitelist) {
        const penalty = gatePenalty(prior.gate);
        priorScore01 = clamp01(priorScore01 - penalty);
      } else {
        dropped = true;
      }
    }

    const finalScore01 = dropped
      ? 0
      : clamp01(engineScore01 * engineWeight + priorScore01 * priorWeight);

    return {
      candidate,
      gate: prior.gate,
      dropped,
      reasons: prior.reasons,
      engineScore01,
      priorScore01,
      finalScore01
    };
  });
}
