"use client";

import { create } from "zustand";
import type { LikedNameEntry } from "@/lib/likedNamesRepository";
import { createLikedNamesRepository } from "@/lib/likedNamesRepository";

const MAX_LIKED_NAMES = 10;
const DB_LIKED_IDS_STORAGE_KEY = "namefit-liked-db-liked-ids-v1";
const likedNamesRepository = createLikedNamesRepository();

export type ToggleLikedResult = "saved" | "removed";
export type ToggleLikedErrorCode = "max_limit_reached" | "storage_unavailable" | "storage_failed";

export class ToggleLikedError extends Error {
  code: ToggleLikedErrorCode;

  constructor(code: ToggleLikedErrorCode, message: string, options?: { cause?: unknown }) {
    super(message, options);
    this.code = code;
  }
}

interface LikedNamesState {
  likedNames: LikedNameEntry[];
  sentDbLikeIds: string[];
  hasHydrated: boolean;
  hydrate: () => void;
  isLiked: (id: string) => boolean;
  upsertLiked: (entry: LikedNameEntry) => void;
  toggleLiked: (entry: LikedNameEntry) => ToggleLikedResult;
  removeLiked: (id: string) => void;
  markDbLikeSent: (id: string) => void;
  hasDbLikeSent: (id: string) => boolean;
}

function compareCreatedAtDesc(left: LikedNameEntry, right: LikedNameEntry): number {
  return Date.parse(right.createdAt) - Date.parse(left.createdAt);
}

function dedupeById(entries: LikedNameEntry[]): LikedNameEntry[] {
  const deduped = new Map<string, LikedNameEntry>();
  for (const entry of entries) {
    deduped.set(entry.id, entry);
  }
  return Array.from(deduped.values()).sort(compareCreatedAtDesc);
}

function readSentDbLikeIds(): string[] {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const raw = window.localStorage.getItem(DB_LIKED_IDS_STORAGE_KEY);
    if (!raw) {
      return [];
    }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      return [];
    }
    return parsed
      .map((value) => String(value ?? "").trim())
      .filter((value) => value.length > 0);
  } catch (error) {
    console.error("[liked-names] failed to read db-liked ids", error);
    return [];
  }
}

function writeSentDbLikeIds(ids: string[]): void {
  if (typeof window === "undefined") {
    throw new ToggleLikedError("storage_unavailable", "localStorage를 사용할 수 없습니다.");
  }
  try {
    window.localStorage.setItem(DB_LIKED_IDS_STORAGE_KEY, JSON.stringify(ids));
  } catch (error) {
    throw new ToggleLikedError("storage_failed", "DB 좋아요 상태를 저장할 수 없습니다.", {
      cause: error
    });
  }
}

export const useLikedNamesStore = create<LikedNamesState>((set, get) => ({
  likedNames: [],
  sentDbLikeIds: [],
  hasHydrated: false,
  hydrate: () => {
    if (get().hasHydrated) {
      return;
    }

    const likedNames = dedupeById(likedNamesRepository.getAll());
    const sentDbLikeIds = Array.from(new Set(readSentDbLikeIds()));
    set({
      likedNames,
      sentDbLikeIds,
      hasHydrated: true
    });
  },
  isLiked: (id) => get().likedNames.some((entry) => entry.id === id),
  upsertLiked: (entry) => {
    const previousLikedNames = get().likedNames;
    const index = previousLikedNames.findIndex((item) => item.id === entry.id);
    if (index < 0) {
      return;
    }

    const nextLikedNames = [...previousLikedNames];
    nextLikedNames[index] = entry;
    set({ likedNames: dedupeById(nextLikedNames) });
    try {
      likedNamesRepository.upsert(entry);
    } catch (error) {
      set({ likedNames: previousLikedNames });
      throw new ToggleLikedError("storage_failed", "찜 상태를 저장하지 못했습니다.", {
        cause: error
      });
    }
  },
  toggleLiked: (entry) => {
    const previousState = get();
    const previousLikedNames = previousState.likedNames;
    const alreadyLiked = previousLikedNames.some((item) => item.id === entry.id);

    if (!alreadyLiked && previousLikedNames.length >= MAX_LIKED_NAMES) {
      throw new ToggleLikedError(
        "max_limit_reached",
        `찜한 이름은 최대 ${MAX_LIKED_NAMES}개까지 저장할 수 있습니다.`
      );
    }

    if (alreadyLiked) {
      const nextLikedNames = previousLikedNames.filter((item) => item.id !== entry.id);
      set({ likedNames: nextLikedNames });
      try {
        likedNamesRepository.remove(entry.id);
      } catch (error) {
        set({ likedNames: previousLikedNames });
        throw new ToggleLikedError("storage_failed", "찜 상태를 저장하지 못했습니다.", {
          cause: error
        });
      }
      return "removed";
    }

    const nextLikedNames = dedupeById([...previousLikedNames, entry]);
    set({ likedNames: nextLikedNames });
    try {
      likedNamesRepository.upsert(entry);
    } catch (error) {
      set({ likedNames: previousLikedNames });
      throw new ToggleLikedError("storage_failed", "찜 상태를 저장하지 못했습니다.", {
        cause: error
      });
    }
    return "saved";
  },
  removeLiked: (id) => {
    const previousLikedNames = get().likedNames;
    const nextLikedNames = previousLikedNames.filter((item) => item.id !== id);
    if (nextLikedNames.length === previousLikedNames.length) {
      return;
    }

    set({ likedNames: nextLikedNames });
    try {
      likedNamesRepository.remove(id);
    } catch (error) {
      set({ likedNames: previousLikedNames });
      throw new ToggleLikedError("storage_failed", "찜 상태를 저장하지 못했습니다.", {
        cause: error
      });
    }
  },
  markDbLikeSent: (id) => {
    const current = get().sentDbLikeIds;
    if (current.includes(id)) {
      return;
    }
    const next = [...current, id];
    set({ sentDbLikeIds: next });
    writeSentDbLikeIds(next);
  },
  hasDbLikeSent: (id) => get().sentDbLikeIds.includes(id)
}));
