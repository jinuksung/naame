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

export const BLACKLIST_WORD_PATTERNS = loadJsonlPatterns(
  resolveWordsPath(),
  DEFAULT_BLACKLIST_WORD_PATTERNS,
);

export const BLACKLIST_INITIAL_PATTERNS = loadJsonlPatterns(
  resolveInitialsPath(),
  DEFAULT_BLACKLIST_INITIAL_PATTERNS,
);
