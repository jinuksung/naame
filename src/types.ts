export type Gender = "MALE" | "FEMALE" | "ANY";
export type CalendarType = "SOLAR" | "LUNAR";
export type SajuPrecision = "DATE_ONLY" | "DATE_TIME";
export type FiveElement = "WOOD" | "FIRE" | "EARTH" | "METAL" | "WATER";

export interface BirthInput {
  calendar: CalendarType;
  date: string;
  time?: string;
  timezone?: string;
}

export interface RecommendRequest {
  surnameHangul: string;
  birth: BirthInput;
  gender: Gender;
  limit: number;
}

export interface HanjaRow {
  unicode: string;
  hanja: string;
  reading: string;
  meaningKw: string;
  meaningTags: string[];
}

export interface HanjaDataset {
  rows: HanjaRow[];
  byReading: Map<string, HanjaRow[]>;
  byHanja: Map<string, HanjaRow>;
}

export interface ScoreResult {
  score: number;
  reasons: string[];
}

export interface PhoneticScoreResult extends ScoreResult {
  gated: boolean;
  syllableCount: number;
  jongseongRatio: number;
}

export interface SoundElementScoreResult extends ScoreResult {
  elements: FiveElement[];
  uniqueElementCount: number;
}

export interface MeaningScoreResult extends ScoreResult {
  uniqueTags: string[];
  uniqueTagCount: number;
}

export interface SajuElementVector {
  WOOD: number;
  FIRE: number;
  EARTH: number;
  METAL: number;
  WATER: number;
}

export interface Pillar {
  stem: string;
  branch: string;
}

export interface Pillars {
  year: Pillar;
  month: Pillar;
  day: Pillar;
  hour?: Pillar;
}

export interface SajuVectorResult {
  vector: SajuElementVector;
  precision: SajuPrecision;
  reasons: string[];
  pillars: Pillars;
}

export interface RecommendationScores {
  phonetic: number;
  meaning: number;
  soundElement: number;
  gender: number;
  saju: number;
  total: number;
}

export interface RecommendationReasons {
  phonetic: string[];
  meaning: string[];
  soundElement: string[];
  gender: string[];
  saju: string[];
}

export interface RecommendationItem {
  rank: number;
  surnameHangul: string;
  nameHangul: string;
  fullHangul: string;
  hanja: string;
  hanjaPair: [string, string];
  unicodePair: [string, string];
  readingPair: [string, string];
  meaningKwPair: [string, string];
  meaningTags: string[];
  scores: RecommendationScores;
  reasons: RecommendationReasons;
}

export interface RecommendMeta {
  totalReadingCount: number;
  usedReadingCount: number;
  readingPairCount: number;
  hanjaPairEvaluated: number;
  phoneticGateRejected: number;
  dedupedCandidateCount: number;
}

export interface RecommendResult {
  request: RecommendRequest;
  meta: RecommendMeta;
  saju: {
    precision: SajuPrecision;
    vector: SajuElementVector;
    reasons: string[];
    pillars: Pillars;
  };
  recommendations: RecommendationItem[];
}
