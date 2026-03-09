const FREE_EXPLORE_SEED_MOD = 0x7fffffff;

let freeExploreSequence = 0;

export interface BuildFreeExploreSeedOptions {
  nowMs?: number;
  sequence?: number;
}

export function buildFreeExploreSeed(options: BuildFreeExploreSeedOptions = {}): number {
  const sequence =
    typeof options.sequence === "number" && Number.isFinite(options.sequence)
      ? Math.max(1, Math.floor(options.sequence))
      : ++freeExploreSequence;
  const nowMs =
    typeof options.nowMs === "number" && Number.isFinite(options.nowMs)
      ? Math.max(0, Math.floor(options.nowMs))
      : Date.now();

  const mixed = (nowMs ^ Math.imul(sequence + 1, 0x9e3779b1)) >>> 0;
  const normalized = mixed % FREE_EXPLORE_SEED_MOD;
  return normalized === 0 ? 1 : normalized;
}
