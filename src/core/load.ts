import fs from "node:fs";
import path from "node:path";
import type { Gender, InputDataset, LoadedInput, NameItem } from "../types";

const HANGUL_1_TO_3 = /^[가-힣]{1,3}$/;

function isGender(value: unknown): value is Gender {
  return value === "M" || value === "F";
}

function extractFallbackItems(parsed: Record<string, unknown>): Array<{ name: string; gender: Gender }> {
  const out: Array<{ name: string; gender: Gender }> = [];

  if (parsed.byGender && typeof parsed.byGender === "object") {
    const byGender = parsed.byGender as Record<string, unknown>;
    for (const gender of ["M", "F"] as const) {
      const names = byGender[gender];
      if (!Array.isArray(names)) {
        continue;
      }
      for (const name of names) {
        if (typeof name !== "string") {
          continue;
        }
        out.push({ name, gender });
      }
    }
  }

  for (const gender of ["M", "F"] as const) {
    const years = parsed[gender];
    if (!years || typeof years !== "object") {
      continue;
    }
    for (const value of Object.values(years)) {
      if (!Array.isArray(value)) {
        continue;
      }
      for (const row of value) {
        if (!row || typeof row !== "object") {
          continue;
        }
        const name = typeof (row as { name?: unknown }).name === "string" ? (row as { name: string }).name : "";
        if (!name) {
          continue;
        }
        out.push({ name, gender });
      }
    }
  }

  return out;
}

export function loadInputDataset(inputPath: string): LoadedInput {
  const resolved = path.resolve(inputPath);
  const raw = fs.readFileSync(resolved, "utf8");
  const parsed = JSON.parse(raw) as Partial<InputDataset> & Record<string, unknown>;
  if (!parsed || typeof parsed !== "object") {
    throw new Error("Invalid input: expected JSON object");
  }

  const rawItems = Array.isArray(parsed.items)
    ? parsed.items
    : extractFallbackItems(parsed as Record<string, unknown>);
  if (!Array.isArray(rawItems) || rawItems.length === 0) {
    throw new Error("Invalid input: could not find any names from `items` or fallback structures");
  }

  const unique = new Set<string>();
  const items: NameItem[] = [];

  for (const row of rawItems) {
    if (!row || typeof row !== "object") {
      continue;
    }

    const name = typeof row.name === "string" ? row.name.trim() : "";
    if (!HANGUL_1_TO_3.test(name)) {
      continue;
    }

    if (!isGender(row.gender)) {
      continue;
    }

    const key = `${name}|${row.gender}`;
    if (unique.has(key)) {
      continue;
    }
    unique.add(key);
    items.push({ name, gender: row.gender });
  }

  const byGender: Record<Gender, Set<string>> = { M: new Set(), F: new Set() };
  const byGenderTwoSyllable: Record<Gender, Set<string>> = { M: new Set(), F: new Set() };
  const oneSyllableItems: NameItem[] = [];
  const twoSyllableItems: NameItem[] = [];
  const threeSyllableItems: NameItem[] = [];
  const allTwoSyllableSet = new Set<string>();

  for (const item of items) {
    const chars = [...item.name];
    if (chars.length < 1 || chars.length > 3) {
      continue;
    }
    byGender[item.gender].add(item.name);

    if (chars.length === 1) {
      oneSyllableItems.push(item);
      continue;
    }
    if (chars.length === 2) {
      twoSyllableItems.push(item);
      allTwoSyllableSet.add(item.name);
      byGenderTwoSyllable[item.gender].add(item.name);
      continue;
    }
    threeSyllableItems.push(item);
  }

  return {
    inputPath: resolved,
    sourceFile: parsed.sourceFile,
    items,
    oneSyllableItems,
    twoSyllableItems,
    threeSyllableItems,
    byGender,
    byGenderTwoSyllable,
    allTwoSyllableSet
  };
}
