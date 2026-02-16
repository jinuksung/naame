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
