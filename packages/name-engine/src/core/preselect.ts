import { attachPoolPrior } from "./poolAttach";
import { computeSoftPriorFinalScore } from "./rerank";
import type {
  NamePreselectInput,
  NamePreselectOptions,
  NamePreselectResult,
  PoolIndex,
  PoolTargetGender
} from "./types";

function clamp01(value: number): number {
  return Math.max(0, Math.min(1, value));
}

function round6(value: number): number {
  return Number(value.toFixed(6));
}

export function preselectNameSeeds<TPayload>(
  inputs: Array<NamePreselectInput<TPayload>>,
  targetGender: PoolTargetGender,
  poolIndex: PoolIndex,
  options: NamePreselectOptions
): NamePreselectResult<TPayload> {
  const limit = Math.max(1, Math.floor(options.limit));
  const explorationMinRatio = clamp01(options.explorationMinRatio ?? 0.2);
  const explorationMinCount = Math.max(0, Math.floor(options.explorationMinCount ?? 20));
  const byName = new Map<string, NamePreselectResult<TPayload>["selected"][number]>();

  for (const input of inputs) {
    const pool = attachPoolPrior(input.name, targetGender, poolIndex);
    const partialEngineScore01 = round6(clamp01(input.partialEngineScore01));
    const preselectScore01 = computeSoftPriorFinalScore(
      partialEngineScore01,
      pool.poolScore01,
      pool.tierBonus01
    );
    const row: NamePreselectResult<TPayload>["selected"][number] = {
      name: input.name,
      payload: input.payload,
      partialEngineScore01,
      pool,
      preselectScore01,
      bucket: pool.poolIncluded ? "pool" : "exploration"
    };

    const existing = byName.get(input.name);
    if (!existing || row.preselectScore01 > existing.preselectScore01) {
      byName.set(input.name, row);
    }
  }

  const rows = [...byName.values()].sort((a, b) => {
    if (b.preselectScore01 !== a.preselectScore01) {
      return b.preselectScore01 - a.preselectScore01;
    }
    if (b.partialEngineScore01 !== a.partialEngineScore01) {
      return b.partialEngineScore01 - a.partialEngineScore01;
    }
    return a.name.localeCompare(b.name, "ko");
  });

  const poolRows = rows.filter((row) => row.bucket === "pool");
  const explorationRows = rows.filter((row) => row.bucket === "exploration");
  const explorationTarget = Math.min(
    explorationRows.length,
    Math.max(explorationMinCount, Math.floor(limit * explorationMinRatio))
  );
  const poolTarget = Math.max(0, limit - explorationTarget);

  const selected: Array<NamePreselectResult<TPayload>["selected"][number]> = [];
  selected.push(...poolRows.slice(0, poolTarget));
  selected.push(...explorationRows.slice(0, explorationTarget));

  if (selected.length < limit) {
    const selectedNames = new Set(selected.map((row) => row.name));
    for (const row of rows) {
      if (selected.length >= limit) {
        break;
      }
      if (selectedNames.has(row.name)) {
        continue;
      }
      selected.push(row);
      selectedNames.add(row.name);
    }
  }

  return {
    selected,
    stats: {
      totalUnique: rows.length,
      poolUnique: poolRows.length,
      explorationUnique: explorationRows.length,
      selectedPool: selected.filter((row) => row.bucket === "pool").length,
      selectedExploration: selected.filter((row) => row.bucket === "exploration").length
    }
  };
}
