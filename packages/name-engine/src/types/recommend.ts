export type RecommendGender = "MALE" | "FEMALE" | "UNISEX";

export interface FreeRecommendInput {
  surnameHangul: string;
  surnameHanja: string;
  birth?: {
    calendar: "SOLAR";
    date?: string;
    time?: string;
  };
  gender: RecommendGender;
  exploreSeed?: number;
}

export interface SurnameHanjaOption {
  hanja: string;
  isDefault: boolean;
  popularityRank: number;
}

export interface SurnameHanjaOptionsResponse {
  surnameReading: string;
  options: SurnameHanjaOption[];
  autoSelectedHanja: string | null;
}

export interface FreeRecommendResultItem {
  nameHangul: string;
  hanjaPair: [string, string];
  readingPair: [string, string];
  meaningKwPair: [string, string];
  score: number;
  reasons: string[];
}

export interface FreeRecommendResponse {
  results: FreeRecommendResultItem[];
}

export type RecommendElement = "WOOD" | "FIRE" | "EARTH" | "METAL" | "WATER";
export type PremiumSajuMode = "IMPROVE" | "HARMONY";
export type PremiumElementStatusBand = "VERY_LOW" | "LOW" | "BALANCED" | "HIGH" | "VERY_HIGH";

export interface PremiumRecommendInput {
  birth: {
    calendar: "SOLAR" | "LUNAR";
    date: string;
    isLeapMonth?: boolean;
    time?: string;
  };
  surnameHanja: string;
  gender: RecommendGender;
  exploreSeed?: number;
}

export interface PremiumPillarItem {
  hangul: string;
  hanja: string;
}

export interface PremiumElementStatusItem {
  element: RecommendElement;
  percent: number;
  status: PremiumElementStatusBand;
}

export interface PremiumRecommendSummary {
  mode: PremiumSajuMode;
  oneLineSummary: string;
  weakTop2: RecommendElement[];
  hasHourPillar: boolean;
  pillars: {
    year: PremiumPillarItem;
    month: PremiumPillarItem;
    day: PremiumPillarItem;
    hour: PremiumPillarItem | null;
  };
  distSaju: Record<RecommendElement, number>;
  distStatus: PremiumElementStatusItem[];
}

export interface PremiumRecommendResultItem {
  rank: number;
  nameHangul: string;
  hanjaPair: [string, string];
  readingPair: [string, string];
  meaningKwPair: [string, string];
  score: number;
  sajuScore5: number;
  soundScore5: number;
  engineScore01: number;
  why: string[];
}

export interface PremiumRecommendResponse {
  summary: PremiumRecommendSummary;
  results: PremiumRecommendResultItem[];
}
