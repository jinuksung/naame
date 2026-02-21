export interface PremiumBirthInput {
  calendar: "SOLAR" | "LUNAR";
  date: string;
  isLeapMonth?: boolean;
  time?: string;
}

export interface PremiumSajuSnapshot {
  solar: {
    year: number;
    month: number;
    day: number;
    date: string;
  };
  time?: {
    hour: number;
    minute: number;
  };
  pillars: {
    yearPillar: string;
    yearPillarHanja: string;
    monthPillar: string;
    monthPillarHanja: string;
    dayPillar: string;
    dayPillarHanja: string;
    hourPillar: string | null;
    hourPillarHanja: string | null;
  };
  hasHourPillar: boolean;
}

interface DateParts {
  year: number;
  month: number;
  day: number;
}

interface ManseryeokModule {
  calculateSajuSimple: (
    solarYear: number,
    solarMonth: number,
    solarDay: number,
    solarHour?: number
  ) => {
    yearPillar: string;
    yearPillarHanja: string;
    monthPillar: string;
    monthPillarHanja: string;
    dayPillar: string;
    dayPillarHanja: string;
    hourPillar: string | null;
    hourPillarHanja: string | null;
  };
  lunarToSolar: (
    lunarYear: number,
    lunarMonth: number,
    lunarDay: number,
    isLeapMonth?: boolean
  ) => {
    solar: {
      year: number;
      month: number;
      day: number;
    };
  };
}

let manseryeokModulePromise: Promise<ManseryeokModule> | null = null;

const nativeDynamicImport = new Function(
  "specifier",
  "return import(specifier);"
) as (specifier: string) => Promise<unknown>;

async function loadManseryeokModule(): Promise<ManseryeokModule> {
  if (manseryeokModulePromise) {
    return manseryeokModulePromise;
  }

  manseryeokModulePromise = nativeDynamicImport("@fullstackfamily/manseryeok").then((module) => {
    const typed = module as ManseryeokModule;
    if (typeof typed.calculateSajuSimple !== "function" || typeof typed.lunarToSolar !== "function") {
      throw new Error("[premium] manseryeok module load failed");
    }
    return typed;
  });

  return manseryeokModulePromise;
}

function pad2(value: number): string {
  return String(value).padStart(2, "0");
}

function formatDate(year: number, month: number, day: number): string {
  return `${year}-${pad2(month)}-${pad2(day)}`;
}

function parseDateStrict(rawDate: string): DateParts {
  const value = rawDate.trim();
  const matched = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!matched) {
    throw new Error("[premium] date 형식이 올바르지 않습니다. YYYY-MM-DD 형식이 필요합니다.");
  }

  const year = Number(matched[1]);
  const month = Number(matched[2]);
  const day = Number(matched[3]);
  if (!Number.isInteger(year) || !Number.isInteger(month) || !Number.isInteger(day)) {
    throw new Error("[premium] date 값을 해석할 수 없습니다.");
  }

  if (month < 1 || month > 12) {
    throw new Error(`[premium] 월 범위가 올바르지 않습니다: ${month}`);
  }

  const maxDay = new Date(Date.UTC(year, month, 0)).getUTCDate();
  if (day < 1 || day > maxDay) {
    throw new Error(`[premium] 일 범위가 올바르지 않습니다: ${day}`);
  }

  return { year, month, day };
}

function parseTimeStrict(rawTime: string): { hour: number; minute: number } {
  const value = rawTime.trim();
  const matched = /^([01]\d|2[0-3]):([0-5]\d)$/.exec(value);
  if (!matched) {
    throw new Error("[premium] time 형식이 올바르지 않습니다. HH:mm 형식이 필요합니다.");
  }
  return {
    hour: Number(matched[1]),
    minute: Number(matched[2])
  };
}

async function toSolarDate(birth: PremiumBirthInput): Promise<DateParts> {
  const manseryeok = await loadManseryeokModule();
  const date = parseDateStrict(birth.date);
  if (birth.calendar === "SOLAR") {
    return date;
  }

  const converted = manseryeok.lunarToSolar(
    date.year,
    date.month,
    date.day,
    birth.isLeapMonth === true
  );
  return {
    year: converted.solar.year,
    month: converted.solar.month,
    day: converted.solar.day
  };
}

export async function calculatePremiumSajuSnapshot(
  birth: PremiumBirthInput
): Promise<PremiumSajuSnapshot> {
  const manseryeok = await loadManseryeokModule();
  const solar = await toSolarDate(birth);
  const parsedTime = birth.time ? parseTimeStrict(birth.time) : undefined;

  const saju = manseryeok.calculateSajuSimple(
    solar.year,
    solar.month,
    solar.day,
    parsedTime?.hour
  );

  return {
    solar: {
      ...solar,
      date: formatDate(solar.year, solar.month, solar.day)
    },
    ...(parsedTime ? { time: parsedTime } : {}),
    pillars: {
      yearPillar: saju.yearPillar,
      yearPillarHanja: saju.yearPillarHanja,
      monthPillar: saju.monthPillar,
      monthPillarHanja: saju.monthPillarHanja,
      dayPillar: saju.dayPillar,
      dayPillarHanja: saju.dayPillarHanja,
      hourPillar: saju.hourPillar,
      hourPillarHanja: saju.hourPillarHanja
    },
    hasHourPillar: saju.hourPillar !== null
  };
}
