"use client";

import { create } from "zustand";
import {
  PremiumRecommendInput,
  PremiumRecommendResultItem,
  PremiumRecommendSummary
} from "@/types/recommend";

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

function normalizeHalf(value: number): number {
  if (!Number.isFinite(value)) {
    return 0;
  }
  const clamped = Math.max(0, Math.min(5, value));
  return Math.round(clamped * 2) / 2;
}

function sanitizeResults(results: PremiumRecommendResultItem[]): PremiumRecommendResultItem[] {
  return results.slice(0, 20).map((item, index) => ({
    ...item,
    rank: Number.isFinite(item.rank) ? item.rank : index + 1,
    sajuScore5: normalizeHalf(item.sajuScore5),
    soundScore5: normalizeHalf(item.soundScore5),
    engineScore01: Math.max(0, Math.min(1, item.engineScore01)),
    why: Array.isArray(item.why) && item.why.length > 0 ? item.why : ["추천 이유를 계산 중입니다."]
  }));
}

export const usePremiumRecommendStore = create<PremiumRecommendStoreState>((set) => ({
  input: initialInput,
  surnameHangul: "",
  summary: null,
  results: [],
  setInput: (input) => set({ input }),
  setSurnameHangul: (surnameHangul) => set({ surnameHangul }),
  setSummary: (summary) => set({ summary }),
  setResults: (results) => set({ results: sanitizeResults(results) }),
  reset: () =>
    set({
      input: initialInput,
      surnameHangul: "",
      summary: null,
      results: []
    })
}));
