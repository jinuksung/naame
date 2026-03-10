import type { RecommendGender } from "@/types/recommend";

export type LikedNameSource = "FREE" | "PREMIUM";

export interface LikedNameEntry {
  id: string;
  fullName: string;
  nameHangul: string;
  surnameHangul: string;
  surnameHanja: string;
  gender: RecommendGender | string;
  hanjaPair: [string, string];
  readingPair: [string, string];
  meaningPair?: [string, string];
  score?: number;
  reason: string;
  createdAt: string;
  source: LikedNameSource;
}

interface CreateLikedNamesRepositoryOptions {
  storage?: Storage;
  storageKey?: string;
}

export interface LikedNamesRepository {
  getAll: () => LikedNameEntry[];
  upsert: (entry: LikedNameEntry) => void;
  remove: (id: string) => void;
  exists: (id: string) => boolean;
  clear: () => void;
}

const DEFAULT_STORAGE_KEY = "namefit-liked-names-v1";

function toPair(value: unknown): [string, string] | null {
  if (!Array.isArray(value) || value.length < 2) {
    return null;
  }
  const first = String(value[0] ?? "").trim();
  const second = String(value[1] ?? "").trim();
  if (!first || !second) {
    return null;
  }
  return [first, second];
}

function toNormalizedEntry(raw: unknown): LikedNameEntry | null {
  if (!raw || typeof raw !== "object") {
    return null;
  }
  const candidate = raw as Partial<LikedNameEntry>;
  if (
    typeof candidate.id !== "string" ||
    typeof candidate.fullName !== "string" ||
    typeof candidate.nameHangul !== "string" ||
    typeof candidate.surnameHangul !== "string" ||
    typeof candidate.surnameHanja !== "string" ||
    typeof candidate.gender !== "string" ||
    typeof candidate.reason !== "string" ||
    typeof candidate.createdAt !== "string" ||
    (candidate.source !== "FREE" && candidate.source !== "PREMIUM")
  ) {
    return null;
  }

  const hanjaPair = toPair(candidate.hanjaPair);
  const readingPair = toPair(candidate.readingPair);
  if (!hanjaPair || !readingPair) {
    return null;
  }
  const meaningPair = toPair(candidate.meaningPair) ?? undefined;

  const score =
    typeof candidate.score === "number" && Number.isFinite(candidate.score)
      ? candidate.score
      : undefined;

  return {
    id: candidate.id.trim(),
    fullName: candidate.fullName.trim(),
    nameHangul: candidate.nameHangul.trim(),
    surnameHangul: candidate.surnameHangul.trim(),
    surnameHanja: candidate.surnameHanja.trim(),
    gender: candidate.gender.trim(),
    hanjaPair,
    readingPair,
    meaningPair,
    score,
    reason: candidate.reason.trim(),
    createdAt: candidate.createdAt.trim(),
    source: candidate.source
  };
}

function compareCreatedAtDesc(left: LikedNameEntry, right: LikedNameEntry): number {
  return Date.parse(right.createdAt) - Date.parse(left.createdAt);
}

function readEntries(storage: Storage, storageKey: string): LikedNameEntry[] {
  const raw = storage.getItem(storageKey);
  if (!raw) {
    return [];
  }

  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      return [];
    }
    const deduped = new Map<string, LikedNameEntry>();
    for (const candidate of parsed) {
      const entry = toNormalizedEntry(candidate);
      if (!entry) {
        continue;
      }
      deduped.set(entry.id, entry);
    }
    return Array.from(deduped.values()).sort(compareCreatedAtDesc);
  } catch (error) {
    console.error("[liked-names] failed to parse storage value", error);
    return [];
  }
}

function writeEntries(storage: Storage, storageKey: string, entries: LikedNameEntry[]): void {
  storage.setItem(storageKey, JSON.stringify(entries));
}

function isStorageUsable(storage: Storage): boolean {
  const probeKey = "__namefit_storage_probe__";
  try {
    storage.setItem(probeKey, "1");
    const probeValue = storage.getItem(probeKey);
    storage.removeItem(probeKey);
    return probeValue === "1";
  } catch {
    return false;
  }
}

function getWindowStorage(name: "localStorage" | "sessionStorage"): Storage | null {
  if (typeof window === "undefined") {
    return null;
  }
  try {
    return window[name];
  } catch {
    return null;
  }
}

function resolveStorage(explicit?: Storage): Storage | null {
  if (explicit) {
    return explicit;
  }
  const candidates = [
    getWindowStorage("localStorage"),
    getWindowStorage("sessionStorage"),
  ];
  for (const storage of candidates) {
    if (storage && isStorageUsable(storage)) {
      return storage;
    }
  }
  return null;
}

export function createLikedNamesRepository(
  options: CreateLikedNamesRepositoryOptions = {}
): LikedNamesRepository {
  const storage = resolveStorage(options.storage);
  const storageKey = options.storageKey ?? DEFAULT_STORAGE_KEY;

  return {
    getAll(): LikedNameEntry[] {
      if (!storage) {
        return [];
      }
      return readEntries(storage, storageKey);
    },
    upsert(entry: LikedNameEntry): void {
      if (!storage) {
        throw new Error("localStorage is unavailable");
      }
      const next = readEntries(storage, storageKey);
      const index = next.findIndex((item) => item.id === entry.id);
      if (index >= 0) {
        next[index] = entry;
      } else {
        next.push(entry);
      }
      next.sort(compareCreatedAtDesc);
      writeEntries(storage, storageKey, next);
    },
    remove(id: string): void {
      if (!storage) {
        throw new Error("localStorage is unavailable");
      }
      const targetId = id.trim();
      const next = readEntries(storage, storageKey).filter((entry) => entry.id !== targetId);
      writeEntries(storage, storageKey, next);
    },
    exists(id: string): boolean {
      const targetId = id.trim();
      return this.getAll().some((entry) => entry.id === targetId);
    },
    clear(): void {
      if (!storage) {
        throw new Error("localStorage is unavailable");
      }
      storage.removeItem(storageKey);
    }
  };
}
