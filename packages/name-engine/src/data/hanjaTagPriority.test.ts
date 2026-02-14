import assert from "node:assert/strict";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import type { HanjaRow } from "../types";
import { sortHanjaRowsByRecommendationPriority } from "../engine/hanjaRowPriority";
import { loadHanjaDataset } from "./loadHanjaDataset";

function buildRow(partial: Partial<HanjaRow> & Pick<HanjaRow, "hanja" | "reading">): HanjaRow {
  return {
    unicode: partial.unicode ?? `U+${partial.hanja.codePointAt(0)?.toString(16).toUpperCase()}`,
    hanja: partial.hanja,
    reading: partial.reading,
    meaningKw: partial.meaningKw ?? "",
    meaningTags: partial.meaningTags ?? [],
    elementPronunciation: partial.elementPronunciation,
    elementResource: partial.elementResource,
    curatedTags: partial.curatedTags ?? [],
    tagPriorityScore: partial.tagPriorityScore ?? 0,
    riskFlags: partial.riskFlags ?? [],
  };
}

function testPrioritySortPrefersTaggedAndSafeRows(): void {
  const bad = buildRow({
    hanja: "咽",
    reading: "인",
    meaningTags: ["목구멍"],
    curatedTags: [],
    tagPriorityScore: 0,
    riskFlags: ["NEGATIVE_DICTIONARY_MEANING"],
  });

  const good = buildRow({
    hanja: "仁",
    reading: "인",
    meaningTags: ["배려", "따뜻함"],
    curatedTags: ["배려/따뜻함"],
    tagPriorityScore: 0.8,
    riskFlags: [],
  });

  const sorted = sortHanjaRowsByRecommendationPriority([bad, good], 2);
  assert.equal(sorted[0].hanja, "仁");
}

async function testLoadDatasetMergesHanjaTagMetadata(): Promise<void> {
  const tempDir = mkdtempSync(join(tmpdir(), "namefit-hanja-tags-"));
  const datasetPath = join(tempDir, "hanname_master.jsonl");
  const tagsPath = join(tempDir, "hanja_tags.jsonl");

  try {
    writeFileSync(
      datasetPath,
      [
        JSON.stringify({
          char: "仁",
          isInmyong: true,
          meanings: { inmyong: ["어질"] },
          readings: { inmyong: ["인"] },
          elementPronunciation: "WATER",
        }),
        JSON.stringify({
          char: "咽",
          isInmyong: true,
          meanings: { inmyong: ["목구멍"] },
          readings: { inmyong: ["인"] },
          elementPronunciation: "WATER",
        }),
      ].join("\n"),
      "utf8",
    );

    writeFileSync(
      tagsPath,
      [
        JSON.stringify({
          char: "仁",
          tags: ["배려/따뜻함"],
          tagScores: { "배려/따뜻함": 0.82 },
        }),
        JSON.stringify({
          char: "咽",
          tags: [],
          tagScores: {},
          riskFlags: ["NEGATIVE_DICTIONARY_MEANING"],
        }),
      ].join("\n"),
      "utf8",
    );

    const dataset = await loadHanjaDataset(datasetPath, { hanjaTagsPath: tagsPath });
    const good = dataset.byHanja.get("仁");
    const bad = dataset.byHanja.get("咽");

    assert.ok(good);
    assert.ok(bad);
    assert.deepEqual(good?.curatedTags, ["배려/따뜻함"]);
    assert.equal(good?.tagPriorityScore, 0.82);
    assert.equal(good?.meaningTags[0], "배려/따뜻함");
    assert.deepEqual(bad?.riskFlags, ["NEGATIVE_DICTIONARY_MEANING"]);
  } finally {
    rmSync(tempDir, { recursive: true, force: true });
  }
}

async function run(): Promise<void> {
  testPrioritySortPrefersTaggedAndSafeRows();
  await testLoadDatasetMergesHanjaTagMetadata();
  console.log("[test:hanja-tags] all tests passed");
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
