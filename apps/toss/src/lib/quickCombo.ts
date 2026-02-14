import type { SurnameHanjaOptionsResponse } from "@/types/recommend";

export const QUICK_SURNAME_PRESETS = [
  "김",
  "이",
  "박",
  "최",
  "정",
  "강",
  "조",
  "윤",
  "장",
  "임",
  "오",
  "한",
  "신",
  "서",
  "권",
  "황",
  "안",
  "송",
  "전",
  "홍",
  "유",
] as const;

const SURNAME_PATTERN = /^[가-힣]{1,2}$/;
const QUICK_EXPLORE_SEED_MOD = 0x7fffffff;

export function isQuickComboEnabled(): boolean {
  return process.env.NODE_ENV === "development";
}

export function buildQuickExploreSeed(clickCount: number, nowMs = Date.now()): number {
  const safeClickCount = Number.isFinite(clickCount) ? Math.max(0, Math.floor(clickCount)) : 0;
  const safeNow = Number.isFinite(nowMs) ? Math.max(0, Math.floor(nowMs)) : 0;
  const mixed = (safeNow ^ Math.imul(safeClickCount + 1, 0x9e3779b1)) >>> 0;
  const normalized = mixed % QUICK_EXPLORE_SEED_MOD;
  return normalized === 0 ? 1 : normalized;
}

function sanitizeLimit(limit: number): number {
  if (!Number.isFinite(limit)) {
    return 1;
  }
  return Math.max(1, Math.floor(limit));
}

function addUniqueSurname(target: string[], seen: Set<string>, raw: string): void {
  const surname = raw.trim();
  if (!SURNAME_PATTERN.test(surname) || seen.has(surname)) {
    return;
  }
  seen.add(surname);
  target.push(surname);
}

export function buildQuickSurnameCandidates(
  currentSurname: string,
  presets: readonly string[] = QUICK_SURNAME_PRESETS,
  limit = 10,
): string[] {
  const max = sanitizeLimit(limit);
  const candidates: string[] = [];
  const seen = new Set<string>();

  addUniqueSurname(candidates, seen, currentSurname);
  for (const preset of presets) {
    if (candidates.length >= max) {
      break;
    }
    addUniqueSurname(candidates, seen, preset);
  }

  return candidates.slice(0, max);
}

export function pickPreferredSurnameHanja(
  response: Pick<SurnameHanjaOptionsResponse, "autoSelectedHanja" | "options">,
): string {
  const autoSelected = typeof response.autoSelectedHanja === "string"
    ? response.autoSelectedHanja.trim()
    : "";
  if (autoSelected) {
    return autoSelected;
  }

  for (const option of response.options) {
    const hanja = typeof option.hanja === "string" ? option.hanja.trim() : "";
    if (hanja) {
      return hanja;
    }
  }

  return "";
}
