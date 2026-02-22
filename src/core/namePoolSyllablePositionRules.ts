import { existsSync, readFileSync } from "node:fs";
import { isAbsolute, resolve } from "node:path";
import type { Gender, NameCandidate } from "../types";

const DEFAULT_RULES_PATH = "name_pool_syllable_position_rules.jsonl";
const RULES_ENV_KEY = "NAME_POOL_SYLLABLE_POSITION_RULES_PATH";
const SINGLE_HANGUL_SYLLABLE = /^[가-힣]$/;

type RuleGender = Gender | "ALL";
type BlockedPosition = "START" | "END";
type TierScope = "ALL" | "NON_A";

interface NamePoolSyllablePositionRule {
  enabled: boolean;
  syllable: string;
  gender: RuleGender;
  blockedPosition: BlockedPosition;
  tierScope: TierScope;
}

let cachedRulesPath: string | null = null;
let cachedRules: NamePoolSyllablePositionRule[] | null = null;

function toAbsolutePath(rawPath: string): string {
  return isAbsolute(rawPath) ? rawPath : resolve(process.cwd(), rawPath);
}

function resolveRulesPath(): string {
  const raw = process.env[RULES_ENV_KEY]?.trim();
  return toAbsolutePath(raw && raw.length > 0 ? raw : DEFAULT_RULES_PATH);
}

function normalizeSyllable(value: unknown): string | null {
  if (typeof value !== "string") {
    return null;
  }
  const normalized = value.trim().normalize("NFC");
  if (!SINGLE_HANGUL_SYLLABLE.test(normalized)) {
    return null;
  }
  return normalized;
}

function normalizeRuleGender(value: unknown): RuleGender | null {
  if (typeof value !== "string") {
    return null;
  }
  const normalized = value.trim().toUpperCase();
  if (normalized === "M" || normalized === "F" || normalized === "ALL") {
    return normalized;
  }
  return null;
}

function normalizeBlockedPosition(value: unknown): BlockedPosition | null {
  if (typeof value !== "string") {
    return null;
  }
  const normalized = value.trim().toUpperCase();
  if (normalized === "START" || normalized === "END") {
    return normalized;
  }
  return null;
}

function normalizeTierScope(value: unknown): TierScope | null {
  if (value == null) {
    return "ALL";
  }
  if (typeof value !== "string") {
    return null;
  }
  const normalized = value.trim().toUpperCase();
  if (normalized === "ALL" || normalized === "NON_A") {
    return normalized;
  }
  return null;
}

function parseRuleLine(line: string): NamePoolSyllablePositionRule | null {
  let parsed: unknown;
  try {
    parsed = JSON.parse(line);
  } catch {
    return null;
  }

  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
    return null;
  }

  const row = parsed as Record<string, unknown>;
  const enabled = typeof row.enabled === "boolean" ? row.enabled : true;
  const syllable = normalizeSyllable(row.syllable);
  const gender = normalizeRuleGender(row.gender ?? "ALL");
  const blockedPosition = normalizeBlockedPosition(row.blockedPosition ?? row.blocked_position);
  const tierScope = normalizeTierScope(row.tierScope ?? row.tier_scope);

  if (!syllable || !gender || !blockedPosition || !tierScope) {
    return null;
  }

  return {
    enabled,
    syllable,
    gender,
    blockedPosition,
    tierScope,
  };
}

function loadRules(path: string): NamePoolSyllablePositionRule[] {
  if (!existsSync(path)) {
    return [];
  }

  const raw = readFileSync(path, "utf8");
  const out: NamePoolSyllablePositionRule[] = [];
  for (const rawLine of raw.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line) {
      continue;
    }
    const rule = parseRuleLine(line);
    if (!rule) {
      continue;
    }
    out.push(rule);
  }

  return out;
}

function ensureRuleCache(): void {
  const path = resolveRulesPath();
  if (cachedRulesPath === path && cachedRules) {
    return;
  }
  cachedRulesPath = path;
  cachedRules = loadRules(path);
}

export function getNamePoolSyllablePositionRules(): readonly NamePoolSyllablePositionRule[] {
  ensureRuleCache();
  return cachedRules ?? [];
}

export function hasNamePoolSyllablePositionRuleMatch(
  candidate: NameCandidate,
  gender: Gender,
): boolean {
  const rules = getNamePoolSyllablePositionRules();
  if (rules.length === 0) {
    return false;
  }

  for (const rule of rules) {
    if (!rule.enabled) {
      continue;
    }
    if (rule.gender !== "ALL" && rule.gender !== gender) {
      continue;
    }
    if (rule.tierScope === "NON_A" && candidate.tier === "A") {
      continue;
    }

    const targetSyllable =
      rule.blockedPosition === "START" ? candidate.features.start : candidate.features.end;
    if (targetSyllable === rule.syllable) {
      return true;
    }
  }

  return false;
}

export function resetNamePoolSyllablePositionRuleCacheForTests(): void {
  cachedRulesPath = null;
  cachedRules = null;
}
