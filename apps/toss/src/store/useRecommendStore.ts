"use client";

import { create } from "zustand";
import { createJSONStorage, persist, type StateStorage } from "zustand/middleware";
import { FreeRecommendInput, FreeRecommendResultItem, RecommendGender } from "@/types/recommend";

interface RecommendStoreState {
  input: FreeRecommendInput;
  results: FreeRecommendResultItem[];
  hasHydrated: boolean;
  setHasHydrated: (value: boolean) => void;
  setInput: (input: FreeRecommendInput) => void;
  setResults: (results: FreeRecommendResultItem[]) => void;
  reset: () => void;
}

const initialInput: FreeRecommendInput = {
  surnameHangul: "",
  surnameHanja: "",
  gender: "UNISEX"
};

export const genderOptions: Array<{ label: string; value: RecommendGender }> = [
  { label: "남", value: "MALE" },
  { label: "여", value: "FEMALE" },
  { label: "상관없음", value: "UNISEX" }
];

function normalizeScore(rawScore: unknown, index: number): number {
  if (typeof rawScore === "number" && Number.isFinite(rawScore)) {
    const clamped = Math.max(0, Math.min(100, rawScore));
    return Math.round(clamped);
  }
  return Math.max(60, 95 - index * 3);
}

function sanitizeResults(results: FreeRecommendResultItem[]): FreeRecommendResultItem[] {
  return results.slice(0, 5).map((item, index) => ({
    ...item,
    score: normalizeScore(item.score, index),
    reasons:
      Array.isArray(item.reasons) && item.reasons.length > 0
        ? item.reasons
        : ["추천 기준을 충족한 이름이에요"]
  }));
}

type PersistedRecommendStoreState = Pick<RecommendStoreState, "input" | "results">;

const noopStorage: StateStorage = {
  getItem: () => null,
  setItem: () => undefined,
  removeItem: () => undefined
};

const recommendStorage = createJSONStorage<PersistedRecommendStoreState>(() => {
  if (typeof window === "undefined") {
    return noopStorage;
  }
  return window.sessionStorage;
});

export const useRecommendStore = create<RecommendStoreState>()(
  persist(
    (set) => ({
      input: initialInput,
      results: [],
      hasHydrated: false,
      setHasHydrated: (value) => set({ hasHydrated: value }),
      setInput: (input) => set({ input }),
      setResults: (results) => set({ results: sanitizeResults(results) }),
      reset: () =>
        set({
          input: initialInput,
          results: []
        })
    }),
    {
      name: "namefit-toss-recommend-store-v1",
      storage: recommendStorage,
      partialize: (state) => ({
        input: state.input,
        results: state.results
      }),
      onRehydrateStorage: () => (state, error) => {
        if (error) {
          console.error("[store] recommend store rehydrate failed", error);
        }
        state?.setHasHydrated(true);
      }
    }
  )
);
