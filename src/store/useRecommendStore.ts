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

export const useRecommendStore = create<RecommendStoreState>((set) => ({
  input: initialInput,
  results: [],
  setInput: (input) => set({ input }),
  setResults: (results) => set({ results: results.slice(0, 5) }),
  reset: () =>
    set({
      input: initialInput,
      results: []
    })
}));
