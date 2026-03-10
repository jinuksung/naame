import { PremiumRecommendInput } from "@/types/recommend";

interface SurnamePreset {
  hangul: string;
  hanja: string;
}

export interface LocalQuickPremiumPayload {
  input: PremiumRecommendInput;
  surnameHangul: string;
}

const LOCAL_QUICK_EXPLORE_SEED_MOD = 0x7fffffff;

const SURNAME_PRESETS: readonly SurnamePreset[] = [
  { hangul: "김", hanja: "金" },
  { hangul: "이", hanja: "李" },
  { hangul: "박", hanja: "朴" },
  { hangul: "최", hanja: "崔" },
  { hangul: "정", hanja: "鄭" },
  { hangul: "강", hanja: "姜" },
  { hangul: "조", hanja: "趙" },
  { hangul: "윤", hanja: "尹" },
  { hangul: "장", hanja: "張" },
  { hangul: "임", hanja: "林" },
  { hangul: "오", hanja: "吳" },
  { hangul: "한", hanja: "韓" },
  { hangul: "신", hanja: "申" },
  { hangul: "서", hanja: "徐" },
  { hangul: "권", hanja: "權" },
  { hangul: "황", hanja: "黃" },
  { hangul: "안", hanja: "安" },
  { hangul: "송", hanja: "宋" },
  { hangul: "류", hanja: "柳" },
  { hangul: "전", hanja: "全" },
  { hangul: "홍", hanja: "洪" },
  { hangul: "유", hanja: "劉" },
  { hangul: "고", hanja: "高" },
  { hangul: "문", hanja: "文" },
  { hangul: "양", hanja: "梁" },
  { hangul: "손", hanja: "孫" },
  { hangul: "배", hanja: "裵" },
  { hangul: "백", hanja: "白" },
  { hangul: "허", hanja: "許" },
  { hangul: "남", hanja: "南" },
  { hangul: "심", hanja: "沈" },
  { hangul: "노", hanja: "盧" },
  { hangul: "하", hanja: "河" },
  { hangul: "곽", hanja: "郭" },
  { hangul: "성", hanja: "成" },
  { hangul: "차", hanja: "車" },
  { hangul: "주", hanja: "朱" },
  { hangul: "우", hanja: "禹" },
  { hangul: "구", hanja: "具" },
  { hangul: "나", hanja: "羅" },
  { hangul: "남궁", hanja: "南宮" },
  { hangul: "제갈", hanja: "諸葛" },
  { hangul: "선우", hanja: "鮮于" },
  { hangul: "서문", hanja: "西門" },
  { hangul: "황보", hanja: "皇甫" },
  { hangul: "독고", hanja: "獨孤" },
  { hangul: "사공", hanja: "司空" },
  { hangul: "동방", hanja: "東方" },
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
    surnameHangul: surname.hangul,
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
