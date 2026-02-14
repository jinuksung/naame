import assert from "node:assert/strict";
import { access } from "node:fs/promises";
import { resolve } from "node:path";
import { loadHanjaDataset } from "../data/loadHanjaDataset";
import { recommendNames } from "./recommend";
import { RecommendRequest } from "../types";

interface RankedOutput {
  surname: string;
  top10: string[];
}

const OVERLAP_THRESHOLD = 0.6;

function overlapRatio(a: string[], b: string[]): number {
  const set = new Set(a);
  let overlap = 0;
  for (const name of b) {
    if (set.has(name)) {
      overlap += 1;
    }
  }
  return overlap / Math.min(a.length, b.length);
}

async function fileExists(path: string): Promise<boolean> {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
}

async function resolveDataPath(): Promise<string> {
  const candidates = [
    resolve(process.cwd(), "hanname_master.jsonl"),
    resolve(process.cwd(), "../../hanname_master.jsonl"),
    resolve(process.cwd(), "../../../hanname_master.jsonl")
  ];

  for (const candidate of candidates) {
    if (await fileExists(candidate)) {
      return candidate;
    }
  }

  throw new Error("hanname_master.jsonl not found for sensitivity test");
}

function makeRequest(surnameHangul: string, surnameHanja: string): RecommendRequest {
  return {
    surnameHangul,
    surnameHanja,
    birth: {
      calendar: "SOLAR",
      date: "2024-05-21",
      time: "08:30",
      timezone: "Asia/Seoul"
    },
    gender: "ANY",
    limit: 10,
    exploreSeed: 20260214
  };
}

async function runTests(): Promise<void> {
  const datasetPath = await resolveDataPath();
  const dataset = await loadHanjaDataset(datasetPath);

  const requests = [
    { surname: "김(金)", input: makeRequest("김", "金") },
    { surname: "이(李)", input: makeRequest("이", "李") },
    { surname: "최(崔)", input: makeRequest("최", "崔") }
  ] as const;

  const outputs: RankedOutput[] = requests.map(({ surname, input }) => {
    const result = recommendNames(dataset, input);
    const top10 = result.recommendations.slice(0, 10).map((item) => item.nameHangul);

    console.log(`[test:sensitivity] ${surname} top10: ${top10.join(", ")}`);
    result.recommendations.slice(0, 10).forEach((item, index) => {
      console.log(
        `[test:sensitivity][debug] ${surname} #${index + 1} ${item.nameHangul} ` +
          `base=${item.scores.baseName ?? -1} surnameSynergy=${item.scores.surnameSynergy ?? -1} ` +
          `balance3=${item.scores.balance3 ?? -1} pronFlow=${item.scores.surnamePronFlow ?? -1} ` +
          `final=${item.scores.total.toFixed(2)}`
      );
    });

    return { surname, top10 };
  });

  for (let i = 0; i < outputs.length; i += 1) {
    for (let j = i + 1; j < outputs.length; j += 1) {
      const pair = `${outputs[i].surname} vs ${outputs[j].surname}`;
      const overlap = overlapRatio(outputs[i].top10, outputs[j].top10);
      console.log(`[test:sensitivity] overlap ${pair}: ${(overlap * 100).toFixed(1)}%`);
      assert.ok(
        overlap <= OVERLAP_THRESHOLD,
        `${pair} overlap expected <= ${OVERLAP_THRESHOLD * 100}%, got ${(overlap * 100).toFixed(1)}%`
      );
    }
  }

  console.log("[test:sensitivity] all tests passed");
}

void runTests();
