import {
  BirthInput,
  FiveElement,
  Pillar,
  Pillars,
  SajuElementVector,
  SajuPrecision,
  SajuVectorResult,
  ScoreResult
} from "../../types";

const DEFAULT_TIMEZONE = "Asia/Seoul";

const STEMS = ["갑", "을", "병", "정", "무", "기", "경", "신", "임", "계"] as const;
const BRANCHES = ["자", "축", "인", "묘", "진", "사", "오", "미", "신", "유", "술", "해"] as const;

const STEM_ELEMENT_MAP: Record<string, FiveElement> = {
  갑: "WOOD",
  을: "WOOD",
  병: "FIRE",
  정: "FIRE",
  무: "EARTH",
  기: "EARTH",
  경: "METAL",
  신: "METAL",
  임: "WATER",
  계: "WATER"
};

const BRANCH_ELEMENT_MAP: Record<string, FiveElement> = {
  인: "WOOD",
  묘: "WOOD",
  사: "FIRE",
  오: "FIRE",
  진: "EARTH",
  술: "EARTH",
  축: "EARTH",
  미: "EARTH",
  신: "METAL",
  유: "METAL",
  해: "WATER",
  자: "WATER"
};

// MVP 월지 매핑(절기 미반영): 1월=축, 2월=인, ..., 12월=자
const MVP_MONTH_TO_BRANCH_INDEX = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 0] as const;

// 기준일 상수: 1984-02-02를 갑자일(60갑자 index 0)로 사용.
// 절기/음력 확장 이후에도 일주 산출 기준점으로 유지한다.
const DAY_PILLAR_REFERENCE = {
  year: 1984,
  month: 2,
  day: 2
} as const;

interface DateParts {
  year: number;
  month: number;
  day: number;
}

interface ParsedTime {
  hour: number;
  minute: number;
}

interface PillarIndex {
  stemIdx: number;
  branchIdx: number;
}

interface ScoreSajuOptions {
  precision: SajuPrecision;
  pillars: Pillars;
  preReasons?: string[];
}

function floorDiv(value: number, divisor: number): number {
  return Math.floor(value / divisor);
}

function mod(value: number, base: number): number {
  const out = value % base;
  return out < 0 ? out + base : out;
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function round2(value: number): number {
  return Math.round(value * 100) / 100;
}

function parseDateStrict(date: string): DateParts {
  const trimmed = date.trim();
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(trimmed);
  if (!match) {
    throw new Error(`[saju] date 형식이 유효하지 않습니다: ${date} (YYYY-MM-DD 필요)`);
  }

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  if (!Number.isInteger(year) || !Number.isInteger(month) || !Number.isInteger(day)) {
    throw new Error(`[saju] date 파싱 실패: ${date}`);
  }

  if (month < 1 || month > 12) {
    throw new Error(`[saju] month 범위 오류: ${month}`);
  }

  const maxDay = new Date(Date.UTC(year, month, 0)).getUTCDate();
  if (day < 1 || day > maxDay) {
    throw new Error(`[saju] day 범위 오류: ${day} (해당 월 최대 ${maxDay})`);
  }

  return { year, month, day };
}

function parseTimeStrict(time: string): ParsedTime {
  const trimmed = time.trim();
  const match = /^([01]\d|2[0-3]):([0-5]\d)$/.exec(trimmed);
  if (!match) {
    throw new Error(`[saju] time 형식이 유효하지 않습니다: ${time} (HH:mm 필요)`);
  }
  return {
    hour: Number(match[1]),
    minute: Number(match[2])
  };
}

function buildPillar(stemIdx: number, branchIdx: number): Pillar {
  return {
    stem: STEMS[mod(stemIdx, 10)],
    branch: BRANCHES[mod(branchIdx, 12)]
  };
}

export function gregorianToJdn(year: number, month: number, day: number): number {
  const a = floorDiv(14 - month, 12);
  const y = year + 4800 - a;
  const m2 = month + 12 * a - 3;

  return (
    day +
    floorDiv(153 * m2 + 2, 5) +
    365 * y +
    floorDiv(y, 4) -
    floorDiv(y, 100) +
    floorDiv(y, 400) -
    32045
  );
}

function getDayPillarFromJdn(jdn: number): PillarIndex {
  const refJdn = gregorianToJdn(
    DAY_PILLAR_REFERENCE.year,
    DAY_PILLAR_REFERENCE.month,
    DAY_PILLAR_REFERENCE.day
  );
  const idx60 = mod(jdn - refJdn, 60);
  return {
    stemIdx: idx60 % 10,
    branchIdx: idx60 % 12
  };
}

export function calcYearPillarMvp(year: number): PillarIndex {
  const idx60 = mod(year - 1984, 60);
  return {
    stemIdx: idx60 % 10,
    branchIdx: idx60 % 12
  };
}

export function calcMonthPillarMvp(yearStemIdx: number, month: number): PillarIndex {
  const monthBranchIdx = MVP_MONTH_TO_BRANCH_INDEX[month - 1];
  const monthStemIdx = mod(yearStemIdx * 2 + month, 10);
  return {
    stemIdx: monthStemIdx,
    branchIdx: monthBranchIdx
  };
}

// Extension hook: 추후 절기(입춘/24절기) 적용 버전으로 교체.
export function calcYearPillarWithSolarTerms(_date: DateParts, _timezone: string): PillarIndex {
  throw new Error("[saju] calcYearPillarWithSolarTerms는 아직 구현되지 않았습니다.");
}

// Extension hook: 추후 절기 기준 월지/정식 월간 계산으로 교체.
export function calcMonthPillarWithSolarTerms(
  _date: DateParts,
  _yearStemIdx: number,
  _timezone: string
): PillarIndex {
  throw new Error("[saju] calcMonthPillarWithSolarTerms는 아직 구현되지 않았습니다.");
}

function calcHourBranchIndex(hour: number): number {
  return floorDiv(mod(hour + 1, 24), 2);
}

function calcHourPillar(dayStemIdx: number, hour: number): PillarIndex {
  const hourBranchIdx = calcHourBranchIndex(hour);
  const hourStemIdx = mod(dayStemIdx * 2 + hourBranchIdx, 10);
  return {
    stemIdx: hourStemIdx,
    branchIdx: hourBranchIdx
  };
}

function createZeroVector(): SajuElementVector {
  return {
    WOOD: 0,
    FIRE: 0,
    EARTH: 0,
    METAL: 0,
    WATER: 0
  };
}

function addPillarElementCounts(counts: SajuElementVector, pillar: Pillar): void {
  const stemElement = STEM_ELEMENT_MAP[pillar.stem];
  const branchElement = BRANCH_ELEMENT_MAP[pillar.branch];
  counts[stemElement] += 1;
  counts[branchElement] += 1;
}

function normalizeCountsToPercent(counts: SajuElementVector): SajuElementVector {
  const total = counts.WOOD + counts.FIRE + counts.EARTH + counts.METAL + counts.WATER;
  if (total <= 0) {
    return createZeroVector();
  }

  return {
    WOOD: round2((counts.WOOD / total) * 100),
    FIRE: round2((counts.FIRE / total) * 100),
    EARTH: round2((counts.EARTH / total) * 100),
    METAL: round2((counts.METAL / total) * 100),
    WATER: round2((counts.WATER / total) * 100)
  };
}

function formatVector(vector: SajuElementVector): string {
  return [
    `WOOD:${vector.WOOD.toFixed(2)}`,
    `FIRE:${vector.FIRE.toFixed(2)}`,
    `EARTH:${vector.EARTH.toFixed(2)}`,
    `METAL:${vector.METAL.toFixed(2)}`,
    `WATER:${vector.WATER.toFixed(2)}`
  ].join(", ");
}

export function calcSajuElementVector(birth: BirthInput): SajuVectorResult {
  const dateParts = parseDateStrict(birth.date);
  const timezone = birth.timezone?.trim() || DEFAULT_TIMEZONE;
  const precision: SajuPrecision = birth.time ? "DATE_TIME" : "DATE_ONLY";
  const reasons: string[] = [];

  if (birth.calendar === "LUNAR") {
    reasons.push("음력(LUNAR) 입력은 MVP 미지원이며 양력 날짜로 간주");
  }

  reasons.push("MVP: 절기 미반영");
  reasons.push(precision === "DATE_TIME" ? "시주 포함" : "시주 미포함");
  reasons.push(`timezone=${timezone}`);

  const yearIdx = calcYearPillarMvp(dateParts.year);
  const monthIdx = calcMonthPillarMvp(yearIdx.stemIdx, dateParts.month);
  const jdn = gregorianToJdn(dateParts.year, dateParts.month, dateParts.day);
  const dayIdx = getDayPillarFromJdn(jdn);

  const pillars: Pillars = {
    year: buildPillar(yearIdx.stemIdx, yearIdx.branchIdx),
    month: buildPillar(monthIdx.stemIdx, monthIdx.branchIdx),
    day: buildPillar(dayIdx.stemIdx, dayIdx.branchIdx)
  };

  reasons.push("월주 MVP 근사: monthStemIdx = (yearStemIdx*2 + month) % 10");

  if (birth.time) {
    const { hour } = parseTimeStrict(birth.time);
    const hourIdx = calcHourPillar(dayIdx.stemIdx, hour);
    pillars.hour = buildPillar(hourIdx.stemIdx, hourIdx.branchIdx);
  }

  const counts = createZeroVector();
  addPillarElementCounts(counts, pillars.year);
  addPillarElementCounts(counts, pillars.month);
  addPillarElementCounts(counts, pillars.day);
  if (pillars.hour) {
    addPillarElementCounts(counts, pillars.hour);
  }

  const vector = normalizeCountsToPercent(counts);
  reasons.push(`오행 분포(정규화): ${formatVector(vector)}`);

  return {
    vector,
    precision,
    reasons,
    pillars
  };
}

export function scoreSajuFit(
  _nameHangul: string,
  vector: SajuElementVector,
  options?: ScoreSajuOptions
): ScoreResult {
  const values = [vector.WOOD, vector.FIRE, vector.EARTH, vector.METAL, vector.WATER];
  const maxValue = Math.max(...values);
  const minValue = Math.min(...values);
  const imbalance = maxValue - minValue;
  const score = clamp(100 - imbalance * 1.2, 0, 100);

  const reasons = [...(options?.preReasons ?? [])];
  reasons.push("MVP: 절기 미반영");
  reasons.push(options?.precision === "DATE_TIME" ? "시주 포함" : "시주 미포함");
  reasons.push(`오행 분포(정규화): ${formatVector(vector)}`);
  reasons.push(`편중도(최대-최소)=${imbalance.toFixed(2)}`);
  reasons.push("MVP: 오행 편중이 작을수록 고득점");

  if (options?.pillars) {
    const p = options.pillars;
    const hourText = p.hour ? `, 시:${p.hour.stem}${p.hour.branch}` : "";
    reasons.push(`사주 기둥: 연:${p.year.stem}${p.year.branch}, 월:${p.month.stem}${p.month.branch}, 일:${p.day.stem}${p.day.branch}${hourText}`);
  }

  const uniqueReasons: string[] = [];
  const seen = new Set<string>();
  for (const reason of reasons) {
    if (!seen.has(reason)) {
      seen.add(reason);
      uniqueReasons.push(reason);
    }
  }

  return {
    score: round2(score),
    reasons: uniqueReasons
  };
}
