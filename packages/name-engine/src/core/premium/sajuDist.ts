import { createZeroDist, ElementDist, ElementKey, normalizeDist } from "./elements";

const STEM_TO_ELEMENT: Record<string, ElementKey> = {
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

const BRANCH_HIDDEN_STEMS: Record<string, readonly string[]> = {
  자: ["계"],
  축: ["기", "계", "신"],
  인: ["갑", "병", "무"],
  묘: ["을"],
  진: ["무", "을", "계"],
  사: ["병", "무", "경"],
  오: ["정", "기"],
  미: ["기", "정", "을"],
  신: ["경", "임", "무"],
  유: ["신"],
  술: ["무", "신", "정"],
  해: ["임", "갑"]
};

const HIDDEN_STEM_WEIGHTS = [0.6, 0.3, 0.1] as const;

export interface SajuPillarsInput {
  yearPillar: string;
  monthPillar: string;
  dayPillar: string;
  hourPillar?: string | null;
}

function parsePillar(pillar: string): { stem: string; branch: string } {
  const chars = Array.from(pillar.trim());
  if (chars.length < 2) {
    throw new Error(`[premium] pillar 형식 오류: ${pillar}`);
  }
  return {
    stem: chars[0],
    branch: chars[1]
  };
}

function addStem(raw: ElementDist, stem: string, weight: number): void {
  const element = STEM_TO_ELEMENT[stem];
  if (!element) {
    return;
  }
  raw[element] += weight;
}

function addBranchHiddenStems(raw: ElementDist, branch: string): void {
  const stems = BRANCH_HIDDEN_STEMS[branch];
  if (!stems) {
    return;
  }

  for (let index = 0; index < stems.length; index += 1) {
    const weight = HIDDEN_STEM_WEIGHTS[index];
    if (!weight) {
      continue;
    }
    addStem(raw, stems[index], weight);
  }
}

export function buildSajuDistFromPillars(pillars: SajuPillarsInput): ElementDist {
  const raw = createZeroDist();
  const allPillars = [
    pillars.yearPillar,
    pillars.monthPillar,
    pillars.dayPillar,
    pillars.hourPillar ?? undefined
  ];

  for (const pillar of allPillars) {
    if (!pillar) {
      continue;
    }
    const { stem, branch } = parsePillar(pillar);
    addStem(raw, stem, 1);
    addBranchHiddenStems(raw, branch);
  }

  return normalizeDist(raw);
}

export function buildDistFromElements(elements: ElementKey[]): ElementDist {
  const raw = createZeroDist();
  for (const element of elements) {
    raw[element] += 1;
  }
  return normalizeDist(raw);
}
