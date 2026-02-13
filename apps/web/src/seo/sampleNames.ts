import namePoolFJson from "../data/name_pool_F.json";
import namePoolMJson from "../data/name_pool_M.json";
import type { NormalizedGender } from "./seoConfig";

interface NamePoolItem {
  name: string;
}

interface NamePoolFile {
  items: NamePoolItem[];
}

interface PickDeterministicNamesParams {
  routeKey: string;
  surname?: string;
  gender?: NormalizedGender;
  count: number;
}

function unique(values: string[]): string[] {
  return Array.from(new Set(values));
}

function normalizeNamePool(poolFile: NamePoolFile): string[] {
  return unique(
    poolFile.items
      .map((item) => item.name.trim())
      .filter((name) => name.length > 0),
  );
}

const MALE_POOL = normalizeNamePool(namePoolMJson as NamePoolFile);
const FEMALE_POOL = normalizeNamePool(namePoolFJson as NamePoolFile);
const MIXED_POOL = unique([...MALE_POOL, ...FEMALE_POOL]);

function fnv1aHash(value: string): number {
  let hash = 0x811c9dc5;
  for (const character of value) {
    hash ^= character.charCodeAt(0);
    hash = Math.imul(hash, 0x01000193);
  }
  return hash >>> 0;
}

function mulberry32(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state += 0x6d2b79f5;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t ^= t + Math.imul(t ^ (t >>> 7), 61 | t);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function seededShuffle<T>(source: T[], seed: number): T[] {
  const values = [...source];
  const random = mulberry32(seed === 0 ? 1 : seed);

  for (let index = values.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(random() * (index + 1));
    [values[index], values[swapIndex]] = [values[swapIndex], values[index]];
  }

  return values;
}

function resolvePool(gender?: NormalizedGender): string[] {
  if (gender === "M") {
    return MALE_POOL;
  }
  if (gender === "F") {
    return FEMALE_POOL;
  }
  return MIXED_POOL;
}

export function pickDeterministicNames({
  routeKey,
  surname = "",
  gender,
  count,
}: PickDeterministicNamesParams): string[] {
  const pool = resolvePool(gender);
  const safeCount = Math.max(0, count);
  if (safeCount === 0 || pool.length === 0) {
    return [];
  }

  const seedKey = `${routeKey}:${surname}:${gender ?? "ALL"}`;
  const seed = fnv1aHash(seedKey);
  const shuffled = seededShuffle(pool, seed);
  return shuffled.slice(0, safeCount);
}
