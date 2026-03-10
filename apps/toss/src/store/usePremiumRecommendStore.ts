"use client";

import { create } from "zustand";
import { createJSONStorage, persist, type StateStorage } from "zustand/middleware";
import {
  PremiumRecommendInput,
  PremiumRecommendResultItem,
  PremiumRecommendSummary,
  RecommendElement
} from "@/types/recommend";
import { sanitizePremiumResults } from "./premiumResultSanitizer";

interface PremiumRecommendStoreState {
  input: PremiumRecommendInput;
  surnameHangul: string;
  summary: PremiumRecommendSummary | null;
  results: PremiumRecommendResultItem[];
  hasHydrated: boolean;
  setHasHydrated: (value: boolean) => void;
  setInput: (input: PremiumRecommendInput) => void;
  setSurnameHangul: (surnameHangul: string) => void;
  setSummary: (summary: PremiumRecommendSummary | null) => void;
  setResults: (results: PremiumRecommendResultItem[]) => void;
  reset: () => void;
}

type PersistedPremiumStoreState = Pick<
  PremiumRecommendStoreState,
  "input" | "surnameHangul" | "summary" | "results"
>;

const initialInput: PremiumRecommendInput = {
  birth: {
    calendar: "SOLAR",
    date: ""
  },
  surnameHanja: "",
  gender: "UNISEX"
};

const noopStorage: StateStorage = {
  getItem: () => null,
  setItem: () => undefined,
  removeItem: () => undefined
};

const premiumStorage = createJSONStorage<PersistedPremiumStoreState>(() => {
  if (typeof window === "undefined") {
    return noopStorage;
  }
  return window.sessionStorage;
});

function sanitizeSummary(summary: PremiumRecommendSummary | null): PremiumRecommendSummary | null {
  if (!summary) {
    return null;
  }

  const compat = summary as PremiumRecommendSummary & {
    weakTop2?: RecommendElement[];
  };
  const weakTop3 = Array.isArray(compat.weakTop3)
    ? compat.weakTop3
    : Array.isArray(compat.weakTop2)
      ? compat.weakTop2
      : [];

  return {
    ...summary,
    weakTop3
  };
}

export const usePremiumRecommendStore = create<PremiumRecommendStoreState>()(
  persist(
    (set) => ({
      input: initialInput,
      surnameHangul: "",
      summary: null,
      results: [],
      hasHydrated: false,
      setHasHydrated: (value) => set({ hasHydrated: value }),
      setInput: (input) => set({ input }),
      setSurnameHangul: (surnameHangul) => set({ surnameHangul }),
      setSummary: (summary) => set({ summary: sanitizeSummary(summary) }),
      setResults: (results) => set({ results: sanitizePremiumResults(results) }),
      reset: () =>
        set({
          input: initialInput,
          surnameHangul: "",
          summary: null,
          results: []
        })
    }),
    {
      name: "namefit-toss-premium-store-v1",
      storage: premiumStorage,
      partialize: (state) => ({
        input: state.input,
        surnameHangul: state.surnameHangul,
        summary: state.summary,
        results: state.results
      }),
      onRehydrateStorage: () => (state, error) => {
        if (error) {
          console.error("[store] premium store rehydrate failed", error);
        }
        if (state?.summary) {
          state.setSummary(state.summary);
        }
        state?.setHasHydrated(true);
      }
    }
  )
);
