import { attachPoolPrior } from "./poolAttach";
import type {
  PoolIndex,
  PoolTargetGender,
  SoftPriorInput,
  SoftPriorRerankedRow,
  SoftPriorWeights,
  SoftRerankBreakdown
} from "./types";

export const DEFAULT_SOFT_PRIOR_WEIGHTS: SoftPriorWeights = {
  wE: 0.62,
  wP: 0.32,
  wT: 0.06
};

function clamp01(value: number): number {
  return Math.max(0, Math.min(1, value));
}

function round6(value: number): number {
  return Number(value.toFixed(6));
}

function toTieBreak01(random: () => number): number {
  const sampled = random();
  if (!Number.isFinite(sampled)) {
    return 0.5;
  }
  return round6(clamp01(sampled));
}

export function computeSoftPriorFinalScore(
  engineScore01: number,
  poolScore01: number,
  tierBonus01: number,
  weights: SoftPriorWeights = DEFAULT_SOFT_PRIOR_WEIGHTS
): number {
  const value =
    weights.wE * clamp01(engineScore01) +
    weights.wP * clamp01(poolScore01) +
    weights.wT * clamp01(tierBonus01);
  return round6(clamp01(value));
}

export function rerankWithSoftPrior<TCandidate>(
  candidates: Array<SoftPriorInput<TCandidate>>,
  targetGender: PoolTargetGender,
  poolIndex: PoolIndex,
  weights: SoftPriorWeights = DEFAULT_SOFT_PRIOR_WEIGHTS,
  random: () => number = Math.random
): Array<SoftPriorRerankedRow<TCandidate>> {
  const rows = candidates.map((candidate) => {
    const pool = attachPoolPrior(candidate.name, targetGender, poolIndex);
    const breakdown: SoftRerankBreakdown = {
      engineScore01: round6(clamp01(candidate.engineScore01)),
      poolScore01: pool.poolScore01,
      tierBonus01: pool.tierBonus01,
      finalScore01: computeSoftPriorFinalScore(
        candidate.engineScore01,
        pool.poolScore01,
        pool.tierBonus01,
        weights
      )
    };
    return {
      name: candidate.name,
      candidate: (candidate.candidate ?? (candidate as unknown as TCandidate)) as TCandidate,
      pool,
      breakdown,
      tieBreak01: toTieBreak01(random)
    };
  });

  rows.sort((a, b) => {
    if (b.breakdown.finalScore01 !== a.breakdown.finalScore01) {
      return b.breakdown.finalScore01 - a.breakdown.finalScore01;
    }
    if (b.breakdown.engineScore01 !== a.breakdown.engineScore01) {
      return b.breakdown.engineScore01 - a.breakdown.engineScore01;
    }
    if (b.tieBreak01 !== a.tieBreak01) {
      return b.tieBreak01 - a.tieBreak01;
    }
    return a.name.localeCompare(b.name, "ko");
  });

  return rows.map(({ tieBreak01: _ignored, ...row }) => row);
}

export function formatSoftPriorTable<TCandidate>(
  rows: Array<SoftPriorRerankedRow<TCandidate>>,
  limit: number
): string {
  const head =
    "name | tier | engineScore01 | poolScore01 | tierBonus01 | finalScore01";
  const body = rows.slice(0, limit).map((row) =>
    [
      row.name,
      row.pool.tier,
      row.breakdown.engineScore01.toFixed(4),
      row.breakdown.poolScore01.toFixed(4),
      row.breakdown.tierBonus01.toFixed(4),
      row.breakdown.finalScore01.toFixed(4)
    ].join(" | ")
  );
  return [head, ...body].join("\n");
}
