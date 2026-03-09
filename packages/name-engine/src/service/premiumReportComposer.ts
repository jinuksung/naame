import {
  PremiumAgeBandKey,
  PremiumAgeBandReport,
  PremiumNameReport,
  RecommendElement,
} from "../types/recommend";
import {
  PREMIUM_REPORT_PHRASE_CATALOG,
  PremiumAgeBandSlotPhrases,
  PremiumReportPhraseCatalog,
  countPremiumReportPhrases as countPremiumReportPhraseCatalog,
} from "./premiumReportPhraseCatalog";

const AGE_BAND_ORDER: Array<{ key: PremiumAgeBandKey; label: string }> = [
  { key: "0-19", label: "0~19세" },
  { key: "20-39", label: "20~39세" },
  { key: "40-59", label: "40~59세" },
  { key: "60-79", label: "60~79세" },
  { key: "80-100", label: "80~100세" },
];

const ELEMENT_LABELS: Record<RecommendElement, string> = {
  WOOD: "목",
  FIRE: "화",
  EARTH: "토",
  METAL: "금",
  WATER: "수",
};

export interface ComposePremiumReportInput {
  displayName: string;
  weakTop3: RecommendElement[];
  strongTop1?: RecommendElement | null;
  oneLineSummary: string;
  why: string[];
  seed: number;
}

function normalizeSentence(text: string): string {
  const trimmed = text.trim();
  if (!trimmed) {
    return "";
  }
  return /[.!?。]$/.test(trimmed) ? trimmed : `${trimmed}.`;
}

function hashText(text: string): number {
  let hash = 2166136261;
  for (const ch of text) {
    hash ^= ch.charCodeAt(0);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function pickBySeed(list: readonly string[], seed: number, offset: number): string {
  const index = Math.abs((seed + offset) % list.length);
  return list[index] ?? "";
}

function toWeakTopLabel(weakTop3: RecommendElement[]): string {
  const labels = weakTop3.map((element) => ELEMENT_LABELS[element] ?? element);
  return labels.length > 0 ? labels.join("·") : "부족 오행";
}

function replaceWeak(text: string, weakLabel: string): string {
  return text.replaceAll("{weak}", weakLabel);
}

function composeAgeBandLines(input: {
  slot: PremiumAgeBandSlotPhrases;
  keySeed: number;
  weakLabel: string;
  preferCaution: boolean;
}): [string, string] {
  const line1 = normalizeSentence(
    replaceWeak(pickBySeed(input.slot.flow, input.keySeed, 3), input.weakLabel),
  );
  const secondPool = input.preferCaution ? input.slot.caution : input.slot.fill;
  const line2 = normalizeSentence(
    replaceWeak(pickBySeed(secondPool, input.keySeed, 11), input.weakLabel),
  );
  return [line1, line2];
}

export function composePremiumReport(
  input: ComposePremiumReportInput,
  catalog: PremiumReportPhraseCatalog = PREMIUM_REPORT_PHRASE_CATALOG,
): PremiumNameReport {
  const weakLabel = toWeakTopLabel(input.weakTop3);
  const baseSeed = hashText(
    `${input.displayName}|${input.oneLineSummary}|${input.seed}|${weakLabel}`,
  );

  const opener = normalizeSentence(pickBySeed(catalog.toneOpeners, baseSeed, 1));
  const connector = normalizeSentence(pickBySeed(catalog.connectors, baseSeed, 7));
  const oneLineSummary = normalizeSentence(input.oneLineSummary);
  const summary = `${opener} ${oneLineSummary} ${connector}`.replace(/\s+/g, " ").trim();

  const conditionLine = normalizeSentence(
    pickBySeed(catalog.conditionAdjusters, baseSeed, 5),
  );
  const bullets = [
    ...input.why.slice(0, 3).map((line) => normalizeSentence(line)),
    conditionLine,
  ].filter((line) => line.length > 0);

  const ageBands: PremiumAgeBandReport[] = AGE_BAND_ORDER.map((band, index) => {
    const slot = catalog.ageBandSlots[band.key];
    const preferCaution =
      index % 2 === 1 ||
      (input.strongTop1 !== undefined &&
        input.strongTop1 !== null &&
        input.weakTop3.includes(input.strongTop1));
    const lines = composeAgeBandLines({
      slot,
      keySeed: baseSeed + index * 17,
      weakLabel,
      preferCaution,
    });
    return {
      key: band.key,
      label: band.label,
      lines,
    };
  });

  return {
    summary,
    bullets,
    ageBands,
  };
}

export function countPremiumReportPhrases(): number {
  return countPremiumReportPhraseCatalog(PREMIUM_REPORT_PHRASE_CATALOG);
}
