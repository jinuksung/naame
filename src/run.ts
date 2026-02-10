import { access, mkdir, readdir, writeFile } from "node:fs/promises";
import { dirname } from "node:path";
import { loadHanjaDataset } from "./data/loadHanjaDataset";
import { recommendNames } from "./engine/recommend";
import { RecommendRequest } from "./types";

const DEFAULT_CSV_PATH = "인명용한자_음독_유니코드_뜻태그포함.csv";
const DEFAULT_OUTPUT_PATH = "recommend_sample.json";
const DEFAULT_WHITELIST_JSON_PATH = "/mnt/data/name_syllable_whitelist.json";

async function fileExists(path: string): Promise<boolean> {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
}

async function resolveCsvPath(): Promise<string> {
  const envPath = process.env.DATA_CSV_PATH?.trim();
  if (envPath) {
    if (await fileExists(envPath)) {
      return envPath;
    }
    throw new Error(`[run] DATA_CSV_PATH 파일이 존재하지 않습니다: ${envPath}`);
  }

  if (await fileExists(DEFAULT_CSV_PATH)) {
    return DEFAULT_CSV_PATH;
  }

  const entries = await readdir(process.cwd());
  const csvFiles = entries.filter((entry) => entry.toLowerCase().endsWith(".csv"));

  const normalizedDefault = DEFAULT_CSV_PATH.normalize("NFC");
  const normalizedMatch = csvFiles.find((entry) => entry.normalize("NFC") === normalizedDefault);
  if (normalizedMatch) {
    return normalizedMatch;
  }

  const fuzzyMatch = csvFiles.find((entry) => {
    const normalized = entry.normalize("NFC");
    return (
      normalized.includes("인명용한자") &&
      normalized.includes("음독") &&
      normalized.includes("유니코드")
    );
  });

  if (fuzzyMatch) {
    console.warn(`[run] 기본 CSV 경로 미존재. fallback 파일 사용: ${fuzzyMatch}`);
    return fuzzyMatch;
  }

  throw new Error(
    `[run] CSV 파일을 찾지 못했습니다. DATA_CSV_PATH를 지정하거나 ${DEFAULT_CSV_PATH} 파일을 추가하세요.`
  );
}

async function ensureOutputDir(outputPath: string): Promise<void> {
  const dir = dirname(outputPath);
  if (!dir || dir === ".") {
    return;
  }
  await mkdir(dir, { recursive: true });
}

async function resolveWhitelistEnv(): Promise<void> {
  const envPath = process.env.SYLLABLE_WHITELIST_JSON?.trim();
  if (envPath) {
    if (await fileExists(envPath)) {
      console.info(`[run] whitelist override 사용: ${envPath}`);
    } else {
      console.warn(
        `[run] SYLLABLE_WHITELIST_JSON 파일 미존재. 내장 whitelist fallback 사용: ${envPath}`
      );
    }
    return;
  }

  if (await fileExists(DEFAULT_WHITELIST_JSON_PATH)) {
    process.env.SYLLABLE_WHITELIST_JSON = DEFAULT_WHITELIST_JSON_PATH;
    console.info(`[run] whitelist 자동 적용: ${DEFAULT_WHITELIST_JSON_PATH}`);
    return;
  }

  console.info("[run] whitelist JSON 미발견. 내장 whitelist를 사용합니다.");
}

async function main(): Promise<void> {
  const csvPath = await resolveCsvPath();
  const outputPath = process.env.OUTPUT_PATH?.trim() || DEFAULT_OUTPUT_PATH;
  await resolveWhitelistEnv();

  console.info(`[run] CSV 로드 시작: ${csvPath}`);
  const dataset = await loadHanjaDataset(csvPath);

  const sampleRequest: RecommendRequest = {
    surnameHangul: "성",
    birth: {
      calendar: "SOLAR",
      date: "2025-08-05",
      timezone: "Asia/Seoul"
    },
    gender: "MALE",
    limit: 10
  };

  console.info(`[run] 추천 시작: limit=${sampleRequest.limit}`);
  const result = recommendNames(dataset, sampleRequest);

  const p = result.saju.pillars;
  const hourText = p.hour ? `${p.hour.stem}${p.hour.branch}` : "-";
  console.info(
    `[run] 사주 기둥 연=${p.year.stem}${p.year.branch} 월=${p.month.stem}${p.month.branch} 일=${p.day.stem}${p.day.branch} 시=${hourText}`
  );
  console.info(
    `[run] 사주 오행 벡터 WOOD=${result.saju.vector.WOOD.toFixed(2)} FIRE=${result.saju.vector.FIRE.toFixed(2)} EARTH=${result.saju.vector.EARTH.toFixed(2)} METAL=${result.saju.vector.METAL.toFixed(2)} WATER=${result.saju.vector.WATER.toFixed(2)}`
  );

  console.info(`[run] Top ${result.recommendations.length} 추천 결과`);
  for (const item of result.recommendations) {
    const tags = item.meaningTags.length > 0 ? item.meaningTags.join("|") : "-";
    console.log(
      [
        `${item.rank}. ${item.fullHangul} (${item.hanja})`,
        `total=${item.scores.total.toFixed(2)}`,
        `phonetic=${item.scores.phonetic.toFixed(1)}`,
        `meaning=${item.scores.meaning.toFixed(1)}`,
        `sound=${item.scores.soundElement.toFixed(1)}`,
        `tags=${tags}`
      ].join(" | ")
    );
  }

  const lowRealityCandidates = ["가노", "노가", "고노"];
  const foundLowReality = result.recommendations.filter((item) =>
    lowRealityCandidates.includes(item.nameHangul)
  );
  if (foundLowReality.length === 0) {
    console.info("[run] 현실성 수동 체크: '가노' 유형 이름 미검출");
  } else {
    console.warn(
      `[run] 현실성 수동 체크: 저현실 이름 검출=${foundLowReality.map((item) => item.nameHangul).join(",")}`
    );
  }

  const top10 = result.recommendations.slice(0, 10);
  const readingPatternSet = new Set<string>();
  const duplicateReadingPatterns = new Set<string>();
  const firstReadingCount = new Map<string, number>();

  for (const item of top10) {
    const pattern = `${item.readingPair[0]}-${item.readingPair[1]}`;
    if (readingPatternSet.has(pattern)) {
      duplicateReadingPatterns.add(pattern);
    }
    readingPatternSet.add(pattern);
    firstReadingCount.set(item.readingPair[0], (firstReadingCount.get(item.readingPair[0]) ?? 0) + 1);
  }

  if (duplicateReadingPatterns.size === 0) {
    console.info("[run] 다양성 체크: 동일 reading 패턴 중복 없음");
  } else {
    console.warn(
      `[run] 다양성 체크: 동일 reading 패턴 중복 발견=${Array.from(duplicateReadingPatterns).join(",")}`
    );
  }

  const firstReadingSummary = Array.from(firstReadingCount.entries())
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], "ko"))
    .map(([reading, count]) => `${reading}:${count}`)
    .join(", ");
  console.info(`[run] 다양성 체크(top10 시작 음절 분포): ${firstReadingSummary || "-"}`);

  const outputPayload = {
    generatedAt: new Date().toISOString(),
    dataCsvPath: csvPath,
    request: result.request,
    meta: result.meta,
    saju: result.saju,
    recommendations: result.recommendations
  };

  await ensureOutputDir(outputPath);
  await writeFile(outputPath, JSON.stringify(outputPayload, null, 2), "utf8");
  console.info(`[run] JSON 저장 완료: ${outputPath}`);
}

void main().catch((error: unknown) => {
  if (error instanceof Error) {
    console.error(`[run] 오류: ${error.message}`);
    if (error.stack) {
      console.error(error.stack);
    }
  } else {
    console.error("[run] 알 수 없는 오류", error);
  }
  process.exitCode = 1;
});
