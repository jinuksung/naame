import fs from "node:fs";
import path from "node:path";
import type {
  PoolAttachResult,
  PoolFileItem,
  PoolFilePayload,
  PoolGender,
  PoolIndexEntry,
  PoolIndex,
  PoolTargetGender,
  PoolTier,
  PoolTierFound
} from "./types";

const TIER_PRIORITY: Record<PoolTierFound, number> = {
  B: 3,
  A: 2,
  C: 1
};

const SCORE_BY_TIER: Record<PoolTier, { poolScore01: number; tierBonus01: number }> = {
  B: { poolScore01: 0.75, tierBonus01: 0.03 },
  A: { poolScore01: 0.55, tierBonus01: 0.02 },
  C: { poolScore01: 0.5, tierBonus01: 0.005 },
  None: { poolScore01: 0.4, tierBonus01: 0.0 }
};

const DEFAULT_M_FILENAME = "name_pool_M.json";
const DEFAULT_F_FILENAME = "name_pool_F.json";
const DEFAULT_OUT_DIR = "out";
const OPPOSITE_ONLY_NONE_PENALTY = 0.12;
const GENDER_FIT_MAX_ABS = 2;
const GENDER_FIT_DELTA_POOL_SCORE_WEIGHT = 0.08;
const ANY_OVERLAP_BONUS_BY_MIN_TIER: Record<PoolTierFound, number> = {
  B: 0.09,
  A: 0.07,
  C: 0.04
};

let cachedPoolIndex: PoolIndex | null = null;
let cachedPoolCacheKey: string | null = null;

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function clamp01(value: number): number {
  return clamp(value, 0, 1);
}

function isTierFound(value: unknown): value is PoolTierFound {
  return value === "A" || value === "B" || value === "C";
}

function pickBetterTier(a: PoolTierFound, b: PoolTierFound): PoolTierFound {
  return TIER_PRIORITY[a] >= TIER_PRIORITY[b] ? a : b;
}

function pickWorseTier(a: PoolTierFound, b: PoolTierFound): PoolTierFound {
  return TIER_PRIORITY[a] <= TIER_PRIORITY[b] ? a : b;
}

function normalizeTier(value: unknown): PoolTierFound | null {
  if (!isTierFound(value)) {
    return null;
  }
  return value;
}

function normalizeOptionalNumber(value: unknown): number | undefined {
  return typeof value === "number" && Number.isFinite(value) ? value : undefined;
}

function normalizeGenderFit01(value: number | undefined): number {
  if (value == null) {
    return 0;
  }
  return clamp(value / GENDER_FIT_MAX_ABS, -1, 1);
}

function pickBetterEntry(a: PoolIndexEntry, b: PoolIndexEntry): PoolIndexEntry {
  if (a.tier !== b.tier) {
    return pickBetterTier(a.tier, b.tier) === a.tier ? a : b;
  }

  const aScore = a.score ?? Number.NEGATIVE_INFINITY;
  const bScore = b.score ?? Number.NEGATIVE_INFINITY;
  if (aScore !== bScore) {
    return aScore >= bScore ? a : b;
  }

  const aGenderFitAbs = Math.abs(a.genderFitScore ?? 0);
  const bGenderFitAbs = Math.abs(b.genderFitScore ?? 0);
  return aGenderFitAbs >= bGenderFitAbs ? a : b;
}

function safeReadJson(filePath: string): PoolFilePayload | null {
  if (!fs.existsSync(filePath)) {
    return null;
  }
  try {
    const raw = fs.readFileSync(filePath, "utf8");
    return JSON.parse(raw) as PoolFilePayload;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.warn(`[poolAttach] failed to load ${filePath}: ${message}`);
    return null;
  }
}

function resolveSearchDirs(cwd: string): string[] {
  return [
    cwd,
    path.resolve(cwd, ".."),
    path.resolve(cwd, "../.."),
    path.resolve(cwd, "../../.."),
    path.resolve(cwd, "../../../..")
  ];
}

function resolvePoolFilePath(
  gender: PoolGender,
  cwd: string,
  envPath: string | undefined
): string | null {
  if (envPath && fs.existsSync(path.resolve(cwd, envPath))) {
    return path.resolve(cwd, envPath);
  }

  const filename = gender === "M" ? DEFAULT_M_FILENAME : DEFAULT_F_FILENAME;
  const dirs = resolveSearchDirs(cwd);
  for (const dir of dirs) {
    const candidate = path.resolve(dir, DEFAULT_OUT_DIR, filename);
    if (fs.existsSync(candidate)) {
      return candidate;
    }
  }
  return null;
}

function insertPoolEntry(map: Map<string, PoolIndexEntry>, name: string, entry: PoolIndexEntry): void {
  const existing = map.get(name);
  if (!existing) {
    map.set(name, entry);
    return;
  }
  map.set(name, pickBetterEntry(existing, entry));
}

function parsePoolItems(payload: PoolFilePayload): PoolFileItem[] {
  if (!Array.isArray(payload.items)) {
    return [];
  }
  const out: PoolFileItem[] = [];
  for (const row of payload.items) {
    if (!row || typeof row !== "object") {
      continue;
    }
    const name = typeof (row as { name?: unknown }).name === "string" ? (row as { name: string }).name.trim() : "";
    const tier = normalizeTier((row as { tier?: unknown }).tier);
    if (!name || !tier) {
      continue;
    }
    const score = normalizeOptionalNumber((row as { score?: unknown }).score);
    const scoreBreakdown = (row as { scoreBreakdown?: unknown }).scoreBreakdown;
    const genderFitScore =
      scoreBreakdown && typeof scoreBreakdown === "object"
        ? normalizeOptionalNumber(
            (scoreBreakdown as { genderFitScore?: unknown }).genderFitScore
          )
        : undefined;
    out.push({
      name,
      tier,
      ...(score !== undefined ? { score } : {}),
      ...(genderFitScore !== undefined ? { genderFitScore } : {})
    });
  }
  return out;
}

function createEmptyIndex(): PoolIndex {
  return {
    M: new Map<string, PoolIndexEntry>(),
    F: new Map<string, PoolIndexEntry>()
  };
}

export function createPoolIndex(seed: {
  M: Array<{ name: string; tier: PoolTierFound; score?: number; genderFitScore?: number }>;
  F: Array<{ name: string; tier: PoolTierFound; score?: number; genderFitScore?: number }>;
}): PoolIndex {
  const index = createEmptyIndex();
  for (const row of seed.M) {
    insertPoolEntry(index.M, row.name, {
      tier: row.tier,
      ...(row.score !== undefined ? { score: row.score } : {}),
      ...(row.genderFitScore !== undefined ? { genderFitScore: row.genderFitScore } : {})
    });
  }
  for (const row of seed.F) {
    insertPoolEntry(index.F, row.name, {
      tier: row.tier,
      ...(row.score !== undefined ? { score: row.score } : {}),
      ...(row.genderFitScore !== undefined ? { genderFitScore: row.genderFitScore } : {})
    });
  }
  return index;
}

export function loadPoolIndex(): PoolIndex {
  const cwd = process.cwd();
  const envMPath = process.env.NAME_POOL_M_PATH?.trim();
  const envFPath = process.env.NAME_POOL_F_PATH?.trim();
  const mPath = resolvePoolFilePath("M", cwd, envMPath);
  const fPath = resolvePoolFilePath("F", cwd, envFPath);
  const cacheKey = `${mPath ?? "missing:M"}|${fPath ?? "missing:F"}`;

  if (cachedPoolIndex && cachedPoolCacheKey === cacheKey) {
    return cachedPoolIndex;
  }

  const index = createEmptyIndex();
  const loadedPaths: string[] = [];

  if (mPath) {
    const payload = safeReadJson(mPath);
    if (payload) {
      for (const item of parsePoolItems(payload)) {
        insertPoolEntry(index.M, item.name, {
          tier: item.tier,
          ...(item.score !== undefined ? { score: item.score } : {}),
          ...(item.genderFitScore !== undefined ? { genderFitScore: item.genderFitScore } : {})
        });
      }
      loadedPaths.push(mPath);
    }
  }
  if (fPath) {
    const payload = safeReadJson(fPath);
    if (payload) {
      for (const item of parsePoolItems(payload)) {
        insertPoolEntry(index.F, item.name, {
          tier: item.tier,
          ...(item.score !== undefined ? { score: item.score } : {}),
          ...(item.genderFitScore !== undefined ? { genderFitScore: item.genderFitScore } : {})
        });
      }
      loadedPaths.push(fPath);
    }
  }

  if (loadedPaths.length === 0) {
    console.warn("[poolAttach] no pool files loaded; fallback to neutral pool priors");
  }

  cachedPoolIndex = index;
  cachedPoolCacheKey = cacheKey;
  return index;
}

function resolveTier(
  name: string,
  targetGender: PoolTargetGender,
  index: PoolIndex
): PoolTier {
  const tierM = index.M.get(name)?.tier;
  const tierF = index.F.get(name)?.tier;

  if (targetGender === "M") {
    return tierM ?? "None";
  }

  if (targetGender === "F") {
    return tierF ?? "None";
  }

  if (tierM && tierF) {
    return pickBetterTier(tierM, tierF);
  }
  return tierM ?? tierF ?? "None";
}

function resolveGenderAdjustedPoolScore01(
  name: string,
  targetGender: PoolTargetGender,
  index: PoolIndex,
  basePoolScore01: number
): number {
  if (targetGender === "ANY") {
    const entryM = index.M.get(name);
    const entryF = index.F.get(name);
    if (!entryM || !entryF) {
      return basePoolScore01;
    }
    const minTier = pickWorseTier(entryM.tier, entryF.tier);
    const overlapBonus = ANY_OVERLAP_BONUS_BY_MIN_TIER[minTier];
    return clamp01(basePoolScore01 + overlapBonus);
  }

  const targetEntry = targetGender === "M" ? index.M.get(name) : index.F.get(name);
  const oppositeEntry = targetGender === "M" ? index.F.get(name) : index.M.get(name);

  if (!targetEntry) {
    if (oppositeEntry) {
      return clamp01(basePoolScore01 - OPPOSITE_ONLY_NONE_PENALTY);
    }
    return basePoolScore01;
  }

  const targetGenderFit01 = normalizeGenderFit01(targetEntry.genderFitScore);
  const oppositeGenderFit01 = normalizeGenderFit01(oppositeEntry?.genderFitScore);
  const delta = clamp(targetGenderFit01 - oppositeGenderFit01, -1, 1);
  return clamp01(basePoolScore01 + delta * GENDER_FIT_DELTA_POOL_SCORE_WEIGHT);
}

export function attachPoolPrior(
  name: string,
  targetGender: PoolTargetGender,
  index: PoolIndex
): PoolAttachResult {
  const tier = resolveTier(name, targetGender, index);
  const score = SCORE_BY_TIER[tier];
  return {
    poolIncluded: tier !== "None",
    tier,
    poolScore01: resolveGenderAdjustedPoolScore01(name, targetGender, index, score.poolScore01),
    tierBonus01: score.tierBonus01
  };
}
