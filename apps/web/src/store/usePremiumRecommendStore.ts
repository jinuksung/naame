"use client";

import { create } from "zustand";
import {
  PremiumRecommendInput,
  PremiumRecommendResultItem,
  PremiumRecommendSummary
} from "@/types/recommend";
import { sanitizePremiumResults } from "./premiumResultSanitizer";

interface PremiumRecommendStoreState {
  input: PremiumRecommendInput;
  surnameHangul: string;
  summary: PremiumRecommendSummary | null;
  results: PremiumRecommendResultItem[];
  setInput: (input: PremiumRecommendInput) => void;
  setSurnameHangul: (surnameHangul: string) => void;
  setSummary: (summary: PremiumRecommendSummary | null) => void;
  setResults: (results: PremiumRecommendResultItem[]) => void;
  reset: () => void;
}

const initialInput: PremiumRecommendInput = {
  birth: {
    calendar: "SOLAR",
    date: ""
  },
  surnameHanja: "",
  gender: "UNISEX"
};

export const usePremiumRecommendStore = create<PremiumRecommendStoreState>((set) => ({
  input: initialInput,
  surnameHangul: "",
  summary: null,
  results: [],
  setInput: (input) => set({ input }),
  setSurnameHangul: (surnameHangul) => set({ surnameHangul }),
  setSummary: (summary) => set({ summary }),
  setResults: (results) => set({ results: sanitizePremiumResults(results) }),
  reset: () =>
    set({
      input: initialInput,
      surnameHangul: "",
      summary: null,
      results: []
    })
}));
