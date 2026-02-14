import fs from "node:fs";
import path from "node:path";
import type {
  PoolAttachResult,
  PoolFileItem,
  PoolFilePayload,
  PoolGender,
  PoolIndex,
  PoolTargetGender,
  PoolTier,
  PoolTierFound
} from "./types";

const TIER_PRIORITY: Record<PoolTierFound, number> = {
  B: 3,
  C: 2,
  A: 1
};

const SCORE_BY_TIER: Record<PoolTier, { poolScore01: number; tierBonus01: number }> = {
  B: { poolScore01: 0.75, tierBonus01: 0.03 },
  C: { poolScore01: 0.6, tierBonus01: 0.01 },
  A: { poolScore01: 0.35, tierBonus01: 0.0 },
  None: { poolScore01: 0.45, tierBonus01: 0.0 }
};

const DEFAULT_M_FILENAME = "name_pool_M.json";
const DEFAULT_F_FILENAME = "name_pool_F.json";
const DEFAULT_OUT_DIR = "out";

let cachedPoolIndex: PoolIndex | null = null;
let cachedPoolCacheKey: string | null = null;

function isTierFound(value: unknown): value is PoolTierFound {
  return value === "A" || value === "B" || value === "C";
}

function pickBetterTier(a: PoolTierFound, b: PoolTierFound): PoolTierFound {
  return TIER_PRIORITY[a] >= TIER_PRIORITY[b] ? a : b;
}

function normalizeTier(value: unknown): PoolTierFound | null {
  if (!isTierFound(value)) {
    return null;
  }
  return value;
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

function insertTier(map: Map<string, PoolTierFound>, name: string, tier: PoolTierFound): void {
  const existing = map.get(name);
  if (!existing) {
    map.set(name, tier);
    return;
  }
  map.set(name, pickBetterTier(existing, tier));
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
    out.push({ name, tier });
  }
  return out;
}

function createEmptyIndex(): PoolIndex {
  return {
    M: new Map<string, PoolTierFound>(),
    F: new Map<string, PoolTierFound>()
  };
}

export function createPoolIndex(seed: {
  M: Array<{ name: string; tier: PoolTierFound }>;
  F: Array<{ name: string; tier: PoolTierFound }>;
}): PoolIndex {
  const index = createEmptyIndex();
  for (const row of seed.M) {
    insertTier(index.M, row.name, row.tier);
  }
  for (const row of seed.F) {
    insertTier(index.F, row.name, row.tier);
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
        insertTier(index.M, item.name, item.tier);
      }
      loadedPaths.push(mPath);
    }
  }
  if (fPath) {
    const payload = safeReadJson(fPath);
    if (payload) {
      for (const item of parsePoolItems(payload)) {
        insertTier(index.F, item.name, item.tier);
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
  const tierM = index.M.get(name);
  const tierF = index.F.get(name);

  if (targetGender === "M") {
    if (tierM && tierF) {
      return pickBetterTier(tierM, tierF);
    }
    return tierM ?? tierF ?? "None";
  }

  if (targetGender === "F") {
    if (tierF && tierM) {
      return pickBetterTier(tierF, tierM);
    }
    return tierF ?? tierM ?? "None";
  }

  if (tierM && tierF) {
    return pickBetterTier(tierM, tierF);
  }
  return tierM ?? tierF ?? "None";
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
    poolScore01: score.poolScore01,
    tierBonus01: score.tierBonus01
  };
}
