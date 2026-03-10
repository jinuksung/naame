export const ELEMENT_KEYS = ["WOOD", "FIRE", "EARTH", "METAL", "WATER"] as const;

export type ElementKey = (typeof ELEMENT_KEYS)[number];

export type ElementDist = Record<ElementKey, number>;

export type ElementStatusBand = "VERY_LOW" | "LOW" | "BALANCED" | "HIGH" | "VERY_HIGH";

export interface ElementStatusItem {
  element: ElementKey;
  percent: number;
  status: ElementStatusBand;
}

export const ELEMENT_LABELS_KO: Record<ElementKey, string> = {
  WOOD: "목",
  FIRE: "화",
  EARTH: "토",
  METAL: "금",
  WATER: "수"
};

function clamp01(value: number): number {
  if (!Number.isFinite(value)) {
    return 0;
  }
  return Math.max(0, Math.min(1, value));
}

export function createZeroDist(): ElementDist {
  return {
    WOOD: 0,
    FIRE: 0,
    EARTH: 0,
    METAL: 0,
    WATER: 0
  };
}

export function sumDist(dist: ElementDist): number {
  return ELEMENT_KEYS.reduce((sum, key) => sum + dist[key], 0);
}

export function normalizeDist(raw: ElementDist): ElementDist {
  const total = sumDist(raw);
  if (total <= 0) {
    return createZeroDist();
  }

  const out = createZeroDist();
  for (const key of ELEMENT_KEYS) {
    out[key] = clamp01(raw[key] / total);
  }

  // Keep exact sum=1 by correcting floating-point drift on WATER.
  const partial = out.WOOD + out.FIRE + out.EARTH + out.METAL;
  out.WATER = clamp01(1 - partial);
  return out;
}

export function blendDist(a: ElementDist, b: ElementDist, weightA: number): ElementDist {
  const wA = Math.max(0, Math.min(1, weightA));
  const wB = 1 - wA;
  const out = createZeroDist();
  for (const key of ELEMENT_KEYS) {
    out[key] = a[key] * wA + b[key] * wB;
  }
  return normalizeDist(out);
}

export function classifyElementStatus(percent: number): ElementStatusBand {
  if (percent <= 9) {
    return "VERY_LOW";
  }
  if (percent <= 14) {
    return "LOW";
  }
  if (percent <= 24) {
    return "BALANCED";
  }
  if (percent <= 34) {
    return "HIGH";
  }
  return "VERY_HIGH";
}

export function toElementStatusItems(dist: ElementDist): ElementStatusItem[] {
  return ELEMENT_KEYS.map((element) => {
    const percent = Math.round(dist[element] * 1000) / 10;
    return {
      element,
      percent,
      status: classifyElementStatus(percent)
    };
  });
}
