import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { runNamePoolPipeline } from "../pipeline";

function makeTempOutDir(): string {
  return fs.mkdtempSync(path.join(os.tmpdir(), "name-pool-test-"));
}

function runTest(): void {
  const inputPath = path.resolve("birth_registered_names_gender.json");
  const outDir = makeTempOutDir();
  const result = runNamePoolPipeline({
    inputPath,
    outDir,
    targetCount: 600,
    minCount: 400
  });

  assert.ok(result.male.items.length >= 400, "male pool should contain at least 400 names");
  assert.ok(result.female.items.length >= 400, "female pool should contain at least 400 names");

  const hasRepeatedMale = result.male.items.some((item) => item.features.start === item.features.end);
  const hasRepeatedFemale = result.female.items.some((item) => item.features.start === item.features.end);
  assert.equal(hasRepeatedMale, false, "male pool should not contain repeated syllable names");
  assert.equal(hasRepeatedFemale, false, "female pool should not contain repeated syllable names");

  const top50MaleEndCounts = new Map<string, number>();
  for (const item of result.male.items.slice(0, 50)) {
    top50MaleEndCounts.set(item.features.end, (top50MaleEndCounts.get(item.features.end) ?? 0) + 1);
  }
  const maleMaxEnd = Math.max(...top50MaleEndCounts.values());
  assert.ok(maleMaxEnd <= 20, "male top-50 should not be over-concentrated by end syllable");

  const top50FemaleEndCounts = new Map<string, number>();
  for (const item of result.female.items.slice(0, 50)) {
    top50FemaleEndCounts.set(item.features.end, (top50FemaleEndCounts.get(item.features.end) ?? 0) + 1);
  }
  const femaleMaxEnd = Math.max(...top50FemaleEndCounts.values());
  assert.ok(femaleMaxEnd <= 20, "female top-50 should not be over-concentrated by end syllable");

  const maleJson = path.join(outDir, "name_pool_M.json");
  const femaleJson = path.join(outDir, "name_pool_F.json");
  const reportMd = path.join(outDir, "report.md");
  assert.equal(fs.existsSync(maleJson), true, "name_pool_M.json should exist");
  assert.equal(fs.existsSync(femaleJson), true, "name_pool_F.json should exist");
  assert.equal(fs.existsSync(reportMd), true, "report.md should exist");

  const maleParsed = JSON.parse(fs.readFileSync(maleJson, "utf8")) as { count: number };
  const femaleParsed = JSON.parse(fs.readFileSync(femaleJson, "utf8")) as { count: number };
  assert.ok(maleParsed.count >= 400, "male output count should be >= 400");
  assert.ok(femaleParsed.count >= 400, "female output count should be >= 400");

  console.log("[name-pool-generator] tests passed");
}

runTest();
