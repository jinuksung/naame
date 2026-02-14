export type Gender = "M" | "F";
export type Tier = "A" | "B" | "C";

export type FilterReason =
  | "repeated_syllable"
  | "blacklist"
  | "invalid_chars"
  | "obvious_weird";

export interface RawInputItem {
  name: string;
  gender: Gender | string;
}

export interface InputDataset {
  sourceRepo?: string;
  sourceFile?: string;
  generatedAt?: string;
  note?: string;
  items: RawInputItem[];
}

export interface NameItem {
  name: string;
  gender: Gender;
}

export interface LoadedInput {
  inputPath: string;
  sourceFile?: string;
  items: NameItem[];
  oneSyllableItems: NameItem[];
  twoSyllableItems: NameItem[];
  threeSyllableItems: NameItem[];
  byGender: Record<Gender, Set<string>>;
  byGenderTwoSyllable: Record<Gender, Set<string>>;
  allTwoSyllableSet: Set<string>;
}

export interface FrequencyProfile {
  startFreq: Map<string, number>;
  endFreq: Map<string, number>;
  allFreq: Map<string, number>;
  startPercentile: Map<string, number>;
  endPercentile: Map<string, number>;
  allPercentile: Map<string, number>;
  commonStartSet: Set<string>;
  commonEndSet: Set<string>;
  startTop10: Array<[string, number]>;
  endTop10: Array<[string, number]>;
}

export interface SyllableStats {
  profiles: Record<Gender, FrequencyProfile>;
  commonStartIntersection: string[];
  commonEndIntersection: string[];
  oneSyllableByGender: Record<Gender, string[]>;
}

export interface NameCandidate {
  name: string;
  tier: Tier;
  features: {
    start: string;
    end: string;
  };
}

export interface FilterResult {
  kept: NameCandidate[];
  removedByReason: Record<FilterReason, number>;
}

export interface ScoreBreakdown {
  baseBonus: number;
  styleScore: number;
  stabilityScore: number;
  genderFitScore: number;
}

export interface ScoredCandidate extends NameCandidate {
  score: number;
  scoreBreakdown: ScoreBreakdown;
}

export interface OutputItem {
  name: string;
  tier: Tier;
  score: number;
  scoreBreakdown: ScoreBreakdown;
  features: {
    start: string;
    end: string;
  };
}

export interface NamePoolOutput {
  generatedAt: string;
  input: string;
  gender: Gender;
  count: number;
  items: OutputItem[];
}

export interface DiversityStats {
  startCounts: Array<[string, number]>;
  endCounts: Array<[string, number]>;
  maxPerStartUsed: number;
  maxPerEndUsed: number;
}

export interface ScoreSummary {
  min: number;
  max: number;
  avg: number;
  top30: OutputItem[];
  top50: OutputItem[];
}

export interface GenerationDiagnostics {
  removedByReasonByGender: Record<Gender, Record<FilterReason, number>>;
  tierCountsByGender: Record<Gender, Record<Tier, number>>;
  diversityByGender: Record<Gender, DiversityStats>;
  scoreSummaryByGender: Record<Gender, ScoreSummary>;
  candidateCountsByGender: Record<
    Gender,
    { generated: number; afterFilter: number; final: number }
  >;
}

export interface PipelineOptions {
  inputPath: string;
  outDir: string;
  targetCount?: number;
  minCount?: number;
  commonTopN?: number;
  maxPerStart?: number;
  maxPerEnd?: number;
}

export interface PipelineResult {
  male: NamePoolOutput;
  female: NamePoolOutput;
  report: string;
  diagnostics: GenerationDiagnostics;
}
