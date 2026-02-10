export type RecommendGender = "MALE" | "FEMALE" | "UNISEX";

export interface FreeRecommendInput {
  surnameHangul: string;
  birth: {
    calendar: "SOLAR";
    date: string;
    time?: string;
  };
  gender: RecommendGender;
}

export interface FreeRecommendResultItem {
  nameHangul: string;
  hanjaPair: [string, string];
  reasons: string[];
}

export interface FreeRecommendResponse {
  results: FreeRecommendResultItem[];
}
