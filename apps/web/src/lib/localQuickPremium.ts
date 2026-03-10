import { PremiumRecommendInput } from "@/types/recommend";

interface SurnamePreset {
  hanja: string;
}

export interface LocalQuickPremiumPayload {
  input: PremiumRecommendInput;
}

const LOCAL_QUICK_EXPLORE_SEED_MOD = 0x7fffffff;

const SURNAME_PRESETS: readonly SurnamePreset[] = [
  { hanja: "金" },
  { hanja: "李" },
  { hanja: "朴" },
  { hanja: "崔" },
  { hanja: "鄭" },
  { hanja: "姜" },
  { hanja: "趙" },
  { hanja: "尹" },
  { hanja: "張" },
  { hanja: "林" },
  { hanja: "吳" },
  { hanja: "韓" },
  { hanja: "申" },
  { hanja: "徐" },
  { hanja: "權" },
  { hanja: "黃" },
  { hanja: "安" },
  { hanja: "宋" },
  { hanja: "柳" },
  { hanja: "全" },
  { hanja: "洪" },
  { hanja: "劉" },
  { hanja: "高" },
  { hanja: "文" },
  { hanja: "梁" },
  { hanja: "孫" },
  { hanja: "裵" },
  { hanja: "白" },
  { hanja: "許" },
  { hanja: "南" },
  { hanja: "沈" },
  { hanja: "盧" },
  { hanja: "河" },
  { hanja: "郭" },
  { hanja: "成" },
  { hanja: "車" },
  { hanja: "朱" },
  { hanja: "禹" },
  { hanja: "具" },
  { hanja: "羅" },
  { hanja: "南宮" },
  { hanja: "諸葛" },
  { hanja: "鮮于" },
  { hanja: "西門" },
  { hanja: "皇甫" },
  { hanja: "獨孤" },
  { hanja: "司空" },
  { hanja: "東方" },
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

function buildRandomExploreSeed(random: () => number): number {
  const seed = Math.floor(random() * LOCAL_QUICK_EXPLORE_SEED_MOD);
  return seed === 0 ? 1 : seed;
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
  const exploreSeed = buildRandomExploreSeed(random);

  return {
    input: {
      birth: {
        calendar: "SOLAR",
        date,
        time,
      },
      surnameHanja: surname.hanja,
      gender,
      exploreSeed,
    },
  };
}
