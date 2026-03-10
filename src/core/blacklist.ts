import { existsSync, readFileSync } from "node:fs";
import { isAbsolute, resolve } from "node:path";

const DEFAULT_BLACKLIST_WORD_PATTERNS = [
  "병신",
  "시발",
  "씨발",
  "좆",
  "개새",
  "가하",
  "바보",
  "가지",
  "가나",
  "고지",
  "규도",
  "가가",
  "다다",
  "유도",
  "태권",
  "가아",
  "아가",
  "우규",
  "선수",
  "우도",
  "수도",
  "소가",
  "시리",
  "아우",
  "지도",
  "도인",
  "수석",
] as const;

const DEFAULT_BLACKLIST_INITIAL_PATTERNS = ["ㅂㅅ", "ㅅㅂ", "ㅈㄹ", "ㅄ"] as const;

let cachedWordsPath: string | null = null;
let cachedWordPatterns: string[] | null = null;
let cachedWordSet: Set<string> | null = null;
let cachedInitialsPath: string | null = null;
let cachedInitialPatterns: string[] | null = null;
let cachedInitialSet: Set<string> | null = null;
let cachedSyllableRulesPath: string | null = null;
let cachedSyllableRules: NameBlockSyllableRule[] | null = null;

const HANGUL_BASE = 0xac00;
const HANGUL_END = 0xd7a3;
const JONGSEONG_COUNT = 28;
const JUNGSEONG = [
  "ㅏ",
  "ㅐ",
  "ㅑ",
  "ㅒ",
  "ㅓ",
  "ㅔ",
  "ㅕ",
  "ㅖ",
  "ㅗ",
  "ㅘ",
  "ㅙ",
  "ㅚ",
  "ㅛ",
  "ㅜ",
  "ㅝ",
  "ㅞ",
  "ㅟ",
  "ㅠ",
  "ㅡ",
  "ㅢ",
  "ㅣ",
] as const;
const JONGSEONG = [
  "",
  "ㄱ",
  "ㄲ",
  "ㄳ",
  "ㄴ",
  "ㄵ",
  "ㄶ",
  "ㄷ",
  "ㄹ",
  "ㄺ",
  "ㄻ",
  "ㄼ",
  "ㄽ",
  "ㄾ",
  "ㄿ",
  "ㅀ",
  "ㅁ",
  "ㅂ",
  "ㅄ",
  "ㅅ",
  "ㅆ",
  "ㅇ",
  "ㅈ",
  "ㅊ",
  "ㅋ",
  "ㅌ",
  "ㅍ",
  "ㅎ",
] as const;

interface SyllableFeature {
  jung: string;
  jong: string | null;
  hasJong: boolean;
}

export interface NameBlockSyllableRule {
  enabled?: boolean;
  s1_jung?: string;
  s1_jong?: string | null;
  s1_has_jong?: boolean;
  s2_jung?: string;
  s2_jong?: string | null;
  s2_has_jong?: boolean;
}

function toAbsolutePath(rawPath: string): string {
  return isAbsolute(rawPath) ? rawPath : resolve(process.cwd(), rawPath);
}

function loadJsonlPatterns(path: string, fallback: readonly string[]): string[] {
  if (!existsSync(path)) {
    return [...fallback];
  }

  const raw = readFileSync(path, "utf8");
  const out: string[] = [];
  for (const rawLine of raw.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line) {
      continue;
    }

    try {
      const parsed = JSON.parse(line) as unknown;
      if (typeof parsed === "string" && parsed.trim().length > 0) {
        out.push(parsed.trim());
        continue;
      }
      if (
        parsed &&
        typeof parsed === "object" &&
        !Array.isArray(parsed) &&
        typeof (parsed as Record<string, unknown>).pattern === "string"
      ) {
        const pattern = String((parsed as Record<string, unknown>).pattern).trim();
        if (pattern.length > 0) {
          out.push(pattern);
        }
      }
    } catch {
      continue;
    }
  }

  if (out.length === 0) {
    return [...fallback];
  }
  return Array.from(new Set(out));
}

function resolveWordsPath(): string {
  const raw = process.env.BLACKLIST_WORDS_PATH?.trim();
  return toAbsolutePath(raw && raw.length > 0 ? raw : "blacklist_words.jsonl");
}

function resolveInitialsPath(): string {
  const raw = process.env.BLACKLIST_INITIALS_PATH?.trim();
  return toAbsolutePath(raw && raw.length > 0 ? raw : "blacklist_initials.jsonl");
}

function resolveSyllableRulesPath(): string {
  const raw = process.env.NAME_BLOCK_SYLLABLE_RULES_PATH?.trim();
  return toAbsolutePath(raw && raw.length > 0 ? raw : "name_block_syllable_rules.jsonl");
}

function normalizeOptionalRuleText(value: unknown): string | undefined {
  if (typeof value !== "string") {
    return undefined;
  }
  const normalized = value.trim().normalize("NFC");
  return normalized.length > 0 ? normalized : undefined;
}

function normalizeOptionalRuleBoolean(value: unknown): boolean | undefined {
  return typeof value === "boolean" ? value : undefined;
}

function hasAnyRuleCondition(rule: NameBlockSyllableRule): boolean {
  return (
    rule.s1_jung !== undefined ||
    rule.s1_jong !== undefined ||
    rule.s1_has_jong !== undefined ||
    rule.s2_jung !== undefined ||
    rule.s2_jong !== undefined ||
    rule.s2_has_jong !== undefined
  );
}

function loadJsonlSyllableRules(path: string): NameBlockSyllableRule[] {
  if (!existsSync(path)) {
    return [];
  }

  const raw = readFileSync(path, "utf8");
  const out: NameBlockSyllableRule[] = [];
  for (const rawLine of raw.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line) {
      continue;
    }

    try {
      const parsed = JSON.parse(line) as unknown;
      if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
        continue;
      }

      const row = parsed as Record<string, unknown>;
      const rule: NameBlockSyllableRule = {
        enabled: typeof row.enabled === "boolean" ? row.enabled : undefined,
        s1_jung: normalizeOptionalRuleText(row.s1_jung),
        s1_jong: normalizeOptionalRuleText(row.s1_jong),
        s1_has_jong: normalizeOptionalRuleBoolean(row.s1_has_jong),
        s2_jung: normalizeOptionalRuleText(row.s2_jung),
        s2_jong: normalizeOptionalRuleText(row.s2_jong),
        s2_has_jong: normalizeOptionalRuleBoolean(row.s2_has_jong),
      };

      if (!hasAnyRuleCondition(rule)) {
        continue;
      }
      out.push(rule);
    } catch {
      continue;
    }
  }

  return out;
}

function ensureWordCache(): void {
  const path = resolveWordsPath();
  if (cachedWordsPath === path && cachedWordPatterns && cachedWordSet) {
    return;
  }

  const patterns = loadJsonlPatterns(path, DEFAULT_BLACKLIST_WORD_PATTERNS);
  cachedWordsPath = path;
  cachedWordPatterns = patterns;
  cachedWordSet = new Set(patterns);
}

function ensureInitialCache(): void {
  const path = resolveInitialsPath();
  if (cachedInitialsPath === path && cachedInitialPatterns && cachedInitialSet) {
    return;
  }

  const patterns = loadJsonlPatterns(path, DEFAULT_BLACKLIST_INITIAL_PATTERNS);
  cachedInitialsPath = path;
  cachedInitialPatterns = patterns;
  cachedInitialSet = new Set(patterns);
}

function ensureSyllableRuleCache(): void {
  const path = resolveSyllableRulesPath();
  if (cachedSyllableRulesPath === path && cachedSyllableRules) {
    return;
  }
  cachedSyllableRulesPath = path;
  cachedSyllableRules = loadJsonlSyllableRules(path);
}

function analyzeSyllableFeature(char: string): SyllableFeature | null {
  const codePoint = char.codePointAt(0);
  if (codePoint === undefined || codePoint < HANGUL_BASE || codePoint > HANGUL_END) {
    return null;
  }

  const syllableIndex = codePoint - HANGUL_BASE;
  const jungIndex = Math.floor((syllableIndex % (21 * JONGSEONG_COUNT)) / JONGSEONG_COUNT);
  const jongIndex = syllableIndex % JONGSEONG_COUNT;
  const jung = JUNGSEONG[jungIndex];
  const jong = JONGSEONG[jongIndex];
  if (!jung || jong === undefined) {
    return null;
  }

  return {
    jung,
    jong: jong.length > 0 ? jong : null,
    hasJong: jongIndex !== 0,
  };
}

function matchesSingleSyllableRule(
  feature: SyllableFeature,
  conditions: {
    jung?: string;
    jong?: string | null;
    hasJong?: boolean;
  },
): boolean {
  if (conditions.jung !== undefined && conditions.jung !== feature.jung) {
    return false;
  }
  // NULL/undefined in SSOT row means wildcard. Use *_has_jong for explicit no-coda conditions.
  if (conditions.jong !== undefined && conditions.jong !== null && conditions.jong !== feature.jong) {
    return false;
  }
  if (typeof conditions.hasJong === "boolean" && conditions.hasJong !== feature.hasJong) {
    return false;
  }
  return true;
}

function matchNameBlockSyllableRule(name: string, rule: NameBlockSyllableRule): boolean {
  if (rule.enabled === false) {
    return false;
  }

  const chars = Array.from(name.trim().normalize("NFC"));
  if (chars.length !== 2) {
    return false;
  }
  const s1 = analyzeSyllableFeature(chars[0]);
  const s2 = analyzeSyllableFeature(chars[1]);
  if (!s1 || !s2) {
    return false;
  }

  return (
    matchesSingleSyllableRule(s1, {
      jung: rule.s1_jung,
      jong: rule.s1_jong,
      hasJong: rule.s1_has_jong,
    }) &&
    matchesSingleSyllableRule(
      s2,
      {
        jung: rule.s2_jung,
        jong: rule.s2_jong,
        hasJong: rule.s2_has_jong,
      },
    )
  );
}

export function getBlacklistWordPatterns(): readonly string[] {
  ensureWordCache();
  return cachedWordPatterns ?? DEFAULT_BLACKLIST_WORD_PATTERNS;
}

export function getBlacklistWordSet(): ReadonlySet<string> {
  ensureWordCache();
  return cachedWordSet ?? new Set(DEFAULT_BLACKLIST_WORD_PATTERNS);
}

export function getBlacklistInitialPatterns(): readonly string[] {
  ensureInitialCache();
  return cachedInitialPatterns ?? DEFAULT_BLACKLIST_INITIAL_PATTERNS;
}

export function getBlacklistInitialSet(): ReadonlySet<string> {
  ensureInitialCache();
  return cachedInitialSet ?? new Set(DEFAULT_BLACKLIST_INITIAL_PATTERNS);
}

export function getNameBlockSyllableRules(): readonly NameBlockSyllableRule[] {
  ensureSyllableRuleCache();
  return cachedSyllableRules ?? [];
}

export function hasNameBlockSyllableRuleMatch(name: string): boolean {
  const rules = getNameBlockSyllableRules();
  if (rules.length === 0) {
    return false;
  }
  return rules.some((rule) => matchNameBlockSyllableRule(name, rule));
}

export const BLACKLIST_WORD_PATTERNS = getBlacklistWordPatterns();

export const BLACKLIST_INITIAL_PATTERNS = getBlacklistInitialPatterns();
