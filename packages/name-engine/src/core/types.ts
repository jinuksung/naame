export type PoolGender = "M" | "F";
export type PoolTargetGender = PoolGender | "ANY";
export type PoolTier = "A" | "B" | "C" | "None";
export type PoolTierFound = Exclude<PoolTier, "None">;

export interface PoolAttachResult {
  poolIncluded: boolean;
  tier: PoolTier;
  poolScore01: number;
  tierBonus01: number;
}

export interface SoftPriorWeights {
  wE: number;
  wP: number;
  wT: number;
}

export interface SoftRerankBreakdown {
  engineScore01: number;
  poolScore01: number;
  tierBonus01: number;
  finalScore01: number;
}

export interface SoftPriorInput<TCandidate> {
  name: string;
  engineScore01: number;
  candidate?: TCandidate;
}

export interface SoftPriorRerankedRow<TCandidate> {
  name: string;
  candidate: TCandidate;
  pool: PoolAttachResult;
  breakdown: SoftRerankBreakdown;
}

export interface PoolFileItem {
  name: string;
  tier: PoolTierFound;
  score?: number;
  genderFitScore?: number;
}

export interface PoolFilePayload {
  gender?: string;
  items?: unknown;
}

export interface PoolIndexEntry {
  tier: PoolTierFound;
  score?: number;
  genderFitScore?: number;
}

export interface PoolIndex {
  M: Map<string, PoolIndexEntry>;
  F: Map<string, PoolIndexEntry>;
}

export interface NamePreselectInput<TPayload> {
  name: string;
  partialEngineScore01: number;
  payload: TPayload;
}

export interface NamePreselectOptions {
  limit: number;
  explorationMinRatio?: number;
  explorationMinCount?: number;
}

export interface NamePreselectRow<TPayload> {
  name: string;
  payload: TPayload;
  partialEngineScore01: number;
  pool: PoolAttachResult;
  preselectScore01: number;
  bucket: "pool" | "exploration";
}

export interface NamePreselectResult<TPayload> {
  selected: Array<NamePreselectRow<TPayload>>;
  stats: {
    totalUnique: number;
    poolUnique: number;
    explorationUnique: number;
    selectedPool: number;
    selectedExploration: number;
  };
}
