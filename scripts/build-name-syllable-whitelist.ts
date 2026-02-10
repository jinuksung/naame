import { execFile } from "node:child_process";
import { access, mkdir, readdir, readFile, rm, writeFile } from "node:fs/promises";
import { dirname, join, relative, resolve } from "node:path";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);

const REPO_URL = "https://github.com/sanginchun/names";
const CACHE_REPO_PATH = resolve(".cache/sanginchun-names");
const DATA_PATH = join(CACHE_REPO_PATH, "data");
const OUTPUT_JSON_PATH =
  process.env.SYLLABLE_WHITELIST_JSON_OUTPUT?.trim() || "/mnt/data/name_syllable_whitelist.json";
const FALLBACK_JSON_PATH = resolve(".cache/name_syllable_whitelist.json");
const OUTPUT_TS_PATH = resolve("src/engine/whitelist/allowSyllables.ts");
const KOREAN_TWO_SYLLABLE_PATTERN = /^[가-힣]{2}$/;

const NAME_FIELD_HINT = /name|value|title|label|text|이름|성명/i;
const COUNT_FIELD_HINT = /count|total|freq|frequency|cnt|num|population|빈도|건수|합계|인원|수량/i;
const NON_COUNT_FIELD_HINT = /year|date|month|day|age|rank|년도|연도|순위/i;

const FALLBACK_ALLOW = [
  "가",
  "강",
  "건",
  "경",
  "고",
  "관",
  "규",
  "기",
  "나",
  "다",
  "도",
  "동",
  "라",
  "리",
  "민",
  "보",
  "서",
  "석",
  "선",
  "성",
  "소",
  "수",
  "승",
  "시",
  "아",
  "안",
  "연",
  "영",
  "예",
  "오",
  "우",
  "원",
  "유",
  "윤",
  "은",
  "의",
  "이",
  "인",
  "재",
  "정",
  "제",
  "주",
  "준",
  "찬",
  "지",
  "진",
  "채",
  "태",
  "하",
  "한",
  "현",
  "혜",
  "호",
  "홍",
  "화",
  "희"
] as const;

const FALLBACK_MALE = [
  "강",
  "건",
  "경",
  "관",
  "규",
  "기",
  "도",
  "동",
  "민",
  "석",
  "선",
  "성",
  "수",
  "승",
  "우",
  "원",
  "윤",
  "인",
  "재",
  "정",
  "제",
  "주",
  "준",
  "진",
  "찬",
  "태",
  "한",
  "현",
  "호",
  "홍"
] as const;

const FALLBACK_FEMALE = [
  "가",
  "나",
  "다",
  "라",
  "리",
  "민",
  "보",
  "서",
  "소",
  "수",
  "아",
  "안",
  "연",
  "영",
  "예",
  "유",
  "윤",
  "은",
  "이",
  "지",
  "채",
  "하",
  "현",
  "혜",
  "화",
  "희"
] as const;

type GenderBucket = "MALE" | "FEMALE" | "UNISEX";

interface ExtractedNameEntry {
  name: string;
  count: number;
  gender: GenderBucket;
  year: number;
}

interface RankedSyllable {
  syl: string;
  score: number;
}

interface BuildResult {
  topYears: number[];
  overallTop: RankedSyllable[];
  maleTop: RankedSyllable[];
  femaleTop: RankedSyllable[];
  allow: string[];
  uniqueSyllableCount: number;
  extractedNameCount: number;
}

interface WhitelistPayload {
  meta: {
    generatedAt: string;
    topYears: number[];
    counts: {
      sourceJsonCount: number;
      parseFailureCount: number;
      extractedNameCount: number;
      uniqueSyllableCount: number;
      overallTopCount: number;
      maleTopCount: number;
      femaleTopCount: number;
      allowCount: number;
      usedFallback: boolean;
    };
  };
  overallTop: RankedSyllable[];
  maleTop: RankedSyllable[];
  femaleTop: RankedSyllable[];
  allow: string[];
}

function toErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  return String(error);
}

function roundScore(score: number): number {
  return Math.round(score * 1000) / 1000;
}

function tokenize(value: string): string[] {
  return value
    .normalize("NFC")
    .toLowerCase()
    .split(/[^0-9a-z가-힣]+/)
    .filter(Boolean);
}

function parseYearFromPath(pathValue: string): number {
  const matches = pathValue.match(/20\d{2}/g);
  if (!matches || matches.length === 0) {
    return 0;
  }
  const years = matches
    .map((item) => Number(item))
    .filter((year) => Number.isFinite(year) && year >= 2000 && year <= 2099);
  if (years.length === 0) {
    return 0;
  }
  return Math.max(...years);
}

async function pathExists(pathValue: string): Promise<boolean> {
  try {
    await access(pathValue);
    return true;
  } catch {
    return false;
  }
}

async function runGit(args: string[]): Promise<void> {
  await execFileAsync("git", args, { maxBuffer: 8 * 1024 * 1024 });
}

async function syncRepo(): Promise<boolean> {
  await mkdir(resolve(".cache"), { recursive: true });

  const hasRepoDir = await pathExists(CACHE_REPO_PATH);
  const hasGitDir = await pathExists(join(CACHE_REPO_PATH, ".git"));

  if (hasRepoDir && !hasGitDir) {
    await rm(CACHE_REPO_PATH, { recursive: true, force: true });
  }

  if (!(await pathExists(CACHE_REPO_PATH))) {
    try {
      console.info(`[build:syllables] clone 시작: ${REPO_URL}`);
      await runGit(["clone", "--depth", "1", REPO_URL, CACHE_REPO_PATH]);
    } catch (error) {
      console.warn(`[build:syllables] clone 실패: ${toErrorMessage(error)}`);
      return false;
    }
  } else {
    try {
      console.info("[build:syllables] pull 시작");
      await runGit(["-C", CACHE_REPO_PATH, "pull", "--ff-only"]);
    } catch (error) {
      console.warn(`[build:syllables] pull 실패(기존 캐시 사용): ${toErrorMessage(error)}`);
    }
  }

  return pathExists(DATA_PATH);
}

async function collectJsonFiles(rootDir: string): Promise<string[]> {
  const out: string[] = [];
  const stack: string[] = [rootDir];

  while (stack.length > 0) {
    const current = stack.pop();
    if (!current) {
      continue;
    }
    const entries = await readdir(current, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = join(current, entry.name);
      if (entry.isDirectory()) {
        stack.push(fullPath);
        continue;
      }
      if (entry.isFile() && entry.name.toLowerCase().endsWith(".json")) {
        out.push(fullPath);
      }
    }
  }

  out.sort((a, b) => a.localeCompare(b, "en"));
  return out;
}

function toPositiveNumber(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value) && value > 0) {
    return value;
  }

  if (typeof value === "string") {
    const normalized = value.trim().replaceAll(",", "");
    if (!normalized) {
      return null;
    }
    const parsed = Number(normalized);
    if (Number.isFinite(parsed) && parsed > 0) {
      return parsed;
    }
  }

  return null;
}

function asRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return null;
  }
  return value as Record<string, unknown>;
}

function extractNameFromRecord(record: Record<string, unknown>): string | null {
  const preferredOrder = ["name", "value", "title", "label", "text", "이름", "성명"];
  const entries = Object.entries(record);

  for (const preferredKey of preferredOrder) {
    const hit = entries.find(([key]) => key.toLowerCase() === preferredKey.toLowerCase());
    if (!hit || typeof hit[1] !== "string") {
      continue;
    }
    const normalized = hit[1].normalize("NFC").trim();
    if (normalized) {
      return normalized;
    }
  }

  for (const [key, value] of entries) {
    if (typeof value !== "string") {
      continue;
    }
    if (!NAME_FIELD_HINT.test(key)) {
      continue;
    }
    const normalized = value.normalize("NFC").trim();
    if (normalized) {
      return normalized;
    }
  }

  return null;
}

function extractCountFromRecord(record: Record<string, unknown>): number | null {
  const entries = Object.entries(record);
  const preferredOrder = ["count", "total", "frequency", "freq", "cnt", "num", "population"];

  for (const preferredKey of preferredOrder) {
    const hit = entries.find(([key]) => key.toLowerCase() === preferredKey);
    if (!hit) {
      continue;
    }
    const parsed = toPositiveNumber(hit[1]);
    if (parsed !== null) {
      return parsed;
    }
  }

  let fallbackNumeric: number | null = null;

  for (const [key, value] of entries) {
    const parsed = toPositiveNumber(value);
    if (parsed === null) {
      continue;
    }
    if (COUNT_FIELD_HINT.test(key)) {
      return parsed;
    }
    if (NON_COUNT_FIELD_HINT.test(key)) {
      continue;
    }
    if (fallbackNumeric === null) {
      fallbackNumeric = parsed;
    }
  }

  if (fallbackNumeric !== null && entries.length <= 3) {
    return fallbackNumeric;
  }

  return null;
}

function inferGender(tokens: string[]): GenderBucket {
  let male = false;
  let female = false;

  for (const token of tokens) {
    if (
      token === "female" ||
      token === "girl" ||
      token === "f" ||
      token.includes("여")
    ) {
      female = true;
    }
    if (
      token === "male" ||
      token === "boy" ||
      token === "m" ||
      token.includes("남")
    ) {
      male = true;
    }
  }

  if (male && !female) {
    return "MALE";
  }
  if (female && !male) {
    return "FEMALE";
  }
  return "UNISEX";
}

function extractEntriesFromNode(
  node: unknown,
  keyPath: string[],
  fileTokens: string[],
  year: number,
  out: ExtractedNameEntry[]
): void {
  if (Array.isArray(node)) {
    for (const item of node) {
      extractEntriesFromNode(item, keyPath, fileTokens, year, out);
    }
    return;
  }

  const record = asRecord(node);
  if (!record) {
    return;
  }

  const name = extractNameFromRecord(record);
  const count = extractCountFromRecord(record);

  if (name && count !== null) {
    const normalizedName = name.normalize("NFC");
    if (KOREAN_TWO_SYLLABLE_PATTERN.test(normalizedName)) {
      const contextTokens = [...fileTokens, ...keyPath.flatMap(tokenize)];
      const gender = inferGender(contextTokens);
      out.push({
        name: normalizedName,
        count,
        gender,
        year
      });
    }
  }

  for (const [key, value] of Object.entries(record)) {
    if (!value || typeof value !== "object") {
      continue;
    }
    extractEntriesFromNode(value, [...keyPath, key], fileTokens, year, out);
  }
}

function addWeighted(freqMap: Map<string, number>, syllable: string, value: number): void {
  freqMap.set(syllable, (freqMap.get(syllable) ?? 0) + value);
}

function buildRanked(freqMap: Map<string, number>, limit: number): RankedSyllable[] {
  return Array.from(freqMap.entries())
    .map(([syl, rawScore]) => ({ syl, rawScore }))
    .sort((a, b) => {
      if (b.rawScore !== a.rawScore) {
        return b.rawScore - a.rawScore;
      }
      return a.syl.localeCompare(b.syl, "ko");
    })
    .slice(0, limit)
    .map(({ syl, rawScore }) => ({ syl, score: roundScore(rawScore) }));
}

function buildFromExtracted(entries: ExtractedNameEntry[]): BuildResult {
  const yearCandidates = Array.from(
    new Set(entries.map((item) => item.year).filter((year) => year > 0))
  ).sort((a, b) => b - a);
  const topYears = yearCandidates.slice(0, 3);
  const recentYearSet = new Set<number>(topYears);

  const overallFreq = new Map<string, number>();
  const maleFreq = new Map<string, number>();
  const femaleFreq = new Map<string, number>();

  for (const item of entries) {
    const chars = Array.from(item.name);
    if (chars.length !== 2) {
      continue;
    }

    const yearWeight = item.year > 0 && recentYearSet.has(item.year) ? 2 : 1;
    const weightedCount = item.count * yearWeight;
    const [s1, s2] = chars;

    addWeighted(overallFreq, s1, weightedCount);
    addWeighted(overallFreq, s2, weightedCount);

    if (item.gender === "MALE") {
      addWeighted(maleFreq, s1, weightedCount);
      addWeighted(maleFreq, s2, weightedCount);
    } else if (item.gender === "FEMALE") {
      addWeighted(femaleFreq, s1, weightedCount);
      addWeighted(femaleFreq, s2, weightedCount);
    }
  }

  const overallTop = buildRanked(overallFreq, 220);
  const maleTop = buildRanked(maleFreq, 160);
  const femaleTop = buildRanked(femaleFreq, 160);
  const allow = Array.from(
    new Set([
      ...overallTop.map((item) => item.syl),
      ...maleTop.map((item) => item.syl),
      ...femaleTop.map((item) => item.syl)
    ])
  ).sort((a, b) => a.localeCompare(b, "ko"));

  return {
    topYears,
    overallTop,
    maleTop,
    femaleTop,
    allow,
    uniqueSyllableCount: overallFreq.size,
    extractedNameCount: entries.length
  };
}

function buildFallbackResult(): BuildResult {
  const overallTop = FALLBACK_ALLOW.map((syl, index) => ({
    syl,
    score: FALLBACK_ALLOW.length - index
  }));
  const maleTop = FALLBACK_MALE.map((syl, index) => ({
    syl,
    score: FALLBACK_MALE.length - index
  }));
  const femaleTop = FALLBACK_FEMALE.map((syl, index) => ({
    syl,
    score: FALLBACK_FEMALE.length - index
  }));
  const allow = Array.from(new Set(FALLBACK_ALLOW)).sort((a, b) => a.localeCompare(b, "ko"));

  return {
    topYears: [],
    overallTop,
    maleTop,
    femaleTop,
    allow,
    uniqueSyllableCount: allow.length,
    extractedNameCount: 0
  };
}

function renderSetExport(exportName: string, values: string[]): string {
  const uniqueSorted = Array.from(new Set(values)).sort((a, b) => a.localeCompare(b, "ko"));
  const body = uniqueSorted.map((value) => `    "${value}"`).join(",\n");
  return `export const ${exportName} = new Set<string>(\n  [\n${body}\n  ] as const\n);\n`;
}

async function writeAllowSyllablesTs(
  allow: string[],
  male: string[],
  female: string[],
  generatedAt: string
): Promise<void> {
  const source = [
    `// Auto-generated by scripts/build-name-syllable-whitelist.ts (${generatedAt})`,
    "",
    renderSetExport("ALLOW_SYLLABLES", allow).trimEnd(),
    "",
    renderSetExport("MALE_SYLLABLES", male).trimEnd(),
    "",
    renderSetExport("FEMALE_SYLLABLES", female).trimEnd(),
    ""
  ].join("\n");

  await mkdir(dirname(OUTPUT_TS_PATH), { recursive: true });
  await writeFile(OUTPUT_TS_PATH, source, "utf8");
}

async function writeWhitelistJson(payload: WhitelistPayload): Promise<string> {
  try {
    await mkdir(dirname(OUTPUT_JSON_PATH), { recursive: true });
    await writeFile(OUTPUT_JSON_PATH, JSON.stringify(payload, null, 2), "utf8");
    return OUTPUT_JSON_PATH;
  } catch (error) {
    console.warn(
      `[build:syllables] ${OUTPUT_JSON_PATH} 저장 실패, 로컬 fallback 사용: ${toErrorMessage(error)}`
    );
  }

  await mkdir(dirname(FALLBACK_JSON_PATH), { recursive: true });
  await writeFile(FALLBACK_JSON_PATH, JSON.stringify(payload, null, 2), "utf8");
  return FALLBACK_JSON_PATH;
}

async function main(): Promise<void> {
  let parseFailureCount = 0;
  let sourceJsonCount = 0;
  let usedFallback = false;
  const extracted: ExtractedNameEntry[] = [];

  const hasRepoData = await syncRepo();

  if (hasRepoData) {
    const jsonFiles = await collectJsonFiles(DATA_PATH);
    sourceJsonCount = jsonFiles.length;
    console.info(`[build:syllables] JSON 파일 탐색 완료: ${sourceJsonCount}개`);

    for (const filePath of jsonFiles) {
      let parsed: unknown;
      try {
        const raw = await readFile(filePath, "utf8");
        parsed = JSON.parse(raw);
      } catch (error) {
        parseFailureCount += 1;
        console.warn(
          `[build:syllables] JSON 파싱 실패: ${relative(process.cwd(), filePath)} (${toErrorMessage(error)})`
        );
        continue;
      }

      const relativePath = relative(CACHE_REPO_PATH, filePath);
      const year = parseYearFromPath(relativePath);
      const fileTokens = tokenize(relativePath);
      extractEntriesFromNode(parsed, [], fileTokens, year, extracted);
    }
  } else {
    console.warn("[build:syllables] 데이터 저장소 접근 실패. fallback whitelist를 사용합니다.");
  }

  let result: BuildResult;
  if (extracted.length === 0) {
    usedFallback = true;
    result = buildFallbackResult();
  } else {
    result = buildFromExtracted(extracted);
  }

  const generatedAt = new Date().toISOString();
  const payload: WhitelistPayload = {
    meta: {
      generatedAt,
      topYears: result.topYears,
      counts: {
        sourceJsonCount,
        parseFailureCount,
        extractedNameCount: result.extractedNameCount,
        uniqueSyllableCount: result.uniqueSyllableCount,
        overallTopCount: result.overallTop.length,
        maleTopCount: result.maleTop.length,
        femaleTopCount: result.femaleTop.length,
        allowCount: result.allow.length,
        usedFallback
      }
    },
    overallTop: result.overallTop,
    maleTop: result.maleTop,
    femaleTop: result.femaleTop,
    allow: result.allow
  };

  const writtenJsonPath = await writeWhitelistJson(payload);
  await writeAllowSyllablesTs(
    result.allow,
    result.maleTop.map((item) => item.syl),
    result.femaleTop.map((item) => item.syl),
    generatedAt
  );

  const top20Text = result.overallTop
    .slice(0, 20)
    .map((item) => `${item.syl}:${item.score}`)
    .join(", ");

  console.info(`[build:syllables] extractedTwoSyllableNames=${result.extractedNameCount}`);
  console.info(`[build:syllables] uniqueSyllableCount=${result.uniqueSyllableCount}`);
  console.info(`[build:syllables] allowSize=${result.allow.length}`);
  console.info(`[build:syllables] top20=${top20Text || "-"}`);
  console.info(`[build:syllables] JSON 저장 위치=${writtenJsonPath}`);
  console.info(`[build:syllables] TS 저장 위치=${OUTPUT_TS_PATH}`);
}

void main().catch((error: unknown) => {
  console.error(`[build:syllables] 오류: ${toErrorMessage(error)}`);
  process.exitCode = 1;
});
