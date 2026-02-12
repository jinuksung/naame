"use client";

import { create } from "zustand";
import { FreeRecommendInput, FreeRecommendResultItem, RecommendGender } from "@/types/recommend";

interface RecommendStoreState {
  input: FreeRecommendInput;
  results: FreeRecommendResultItem[];
  setInput: (input: FreeRecommendInput) => void;
  setResults: (results: FreeRecommendResultItem[]) => void;
  reset: () => void;
}

const initialInput: FreeRecommendInput = {
  surnameHangul: "",
  surnameHanja: "",
  birth: {
    calendar: "SOLAR",
    date: ""
  },
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

export const useRecommendStore = create<RecommendStoreState>((set) => ({
  input: initialInput,
  results: [],
  setInput: (input) => set({ input }),
  setResults: (results) => set({ results: sanitizeResults(results) }),
  reset: () =>
    set({
      input: initialInput,
      results: []
    })
}));
