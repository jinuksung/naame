import { PremiumRecommendInput } from "@/types/recommend";

interface SurnamePreset {
  hangul: string;
  hanja: string;
}

export interface LocalQuickPremiumPayload {
  input: PremiumRecommendInput;
  surnameHangul: string;
}

const SURNAME_PRESETS: readonly SurnamePreset[] = [
  { hangul: "김", hanja: "金" },
  { hangul: "이", hanja: "李" },
  { hangul: "박", hanja: "朴" },
  { hangul: "최", hanja: "崔" },
  { hangul: "정", hanja: "鄭" },
];

const GENDER_PRESETS: readonly PremiumRecommendInput["gender"][] = [
  "MALE",
  "FEMALE",
];

function pickRandomIndex(length: number, random: () => number): number {
  return Math.max(0, Math.min(length - 1, Math.floor(random() * length)));
}

function pad2(value: number): string {
  return value.toString().padStart(2, "0");
}

function buildRandomDate(random: () => number): string {
  const year = 1970 + pickRandomIndex(41, random);
  const month = 1 + pickRandomIndex(12, random);
  const maxDay = new Date(year, month, 0).getDate();
  const day = 1 + pickRandomIndex(maxDay, random);
  return `${year}-${pad2(month)}-${pad2(day)}`;
}

function buildRandomTime(random: () => number): string {
  const hour = pickRandomIndex(24, random);
  const minute = pickRandomIndex(60, random);
  return `${pad2(hour)}:${pad2(minute)}`;
}

export function resolvePremiumLoadingPath(currentPathname: string): string {
  const normalized = currentPathname.trim();
  if (!normalized) {
    return "/premium/loading";
  }

  const withLeadingSlash = normalized.startsWith("/") ? normalized : `/${normalized}`;
  const withoutTrailingSlash = withLeadingSlash.replace(/\/+$/, "");

  const fromResultPath = withoutTrailingSlash.replace(
    /\/premium\/result$/,
    "/premium/loading"
  );
  if (fromResultPath !== withoutTrailingSlash) {
    return fromResultPath;
  }

  const fromPremiumPath = withoutTrailingSlash.replace(
    /\/premium$/,
    "/premium/loading"
  );
  if (fromPremiumPath !== withoutTrailingSlash) {
    return fromPremiumPath;
  }

  return "/premium/loading";
}

export function buildLocalQuickPremiumPayload(
  random: () => number = Math.random
): LocalQuickPremiumPayload {
  const surname = SURNAME_PRESETS[pickRandomIndex(SURNAME_PRESETS.length, random)];
  const gender = GENDER_PRESETS[pickRandomIndex(GENDER_PRESETS.length, random)];
  const date = buildRandomDate(random);
  const time = buildRandomTime(random);

  return {
    surnameHangul: surname.hangul,
    input: {
      birth: {
        calendar: "SOLAR",
        date,
        time,
      },
      surnameHanja: surname.hanja,
      gender,
    },
  };
}
