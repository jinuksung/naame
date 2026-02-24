export interface NamechartChartRow {
  rank: number;
  name: string;
  totalBirths: number;
  gender: "M" | "F" | null;
}

export interface ParsedNamechartChartPage {
  rows: NamechartChartRow[];
  nextPath: string | null;
}

function decodeHtml(value: string): string {
  return value
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, "\"")
    .replace(/&#39;/g, "'")
    .replace(/&#x27;/gi, "'");
}

function stripTags(value: string): string {
  return decodeHtml(
    value
      .replace(/<!--[\s\S]*?-->/g, "")
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ")
      .trim()
  );
}

function extractCells(rowHtml: string): string[] {
  return Array.from(rowHtml.matchAll(/<td\b[^>]*>([\s\S]*?)<\/td>/gi), (match) => match[1] ?? "");
}

function parseRank(rankCellText: string): number | null {
  const match = rankCellText.match(/(\d+)\s*$/);
  if (!match) return null;
  const rank = Number(match[1]);
  return Number.isFinite(rank) ? rank : null;
}

function parseCount(countCellText: string): number | null {
  const normalized = countCellText.replace(/[^\d]/g, "");
  if (!normalized) return null;
  const count = Number(normalized);
  return Number.isFinite(count) ? count : null;
}

function parseGenderFromNameCellHtml(nameCellHtml: string): "M" | "F" | null {
  if (/bg-gender-female/i.test(nameCellHtml)) return "F";
  if (/bg-gender-male/i.test(nameCellHtml)) return "M";
  return null;
}

export function parseNamechartChartPage(html: string): ParsedNamechartChartPage {
  const rows: NamechartChartRow[] = [];

  for (const rowMatch of html.matchAll(/<tr\b[\s\S]*?<\/tr>/gi)) {
    const rowHtml = rowMatch[0];
    if (!/<td\b/i.test(rowHtml)) continue;

    const cells = extractCells(rowHtml);
    if (cells.length < 3) continue;

    const rank = parseRank(stripTags(cells[0]));
    const nameCellHtml = cells[1];
    const name = stripTags(nameCellHtml);
    const totalBirths = parseCount(stripTags(cells[2]));
    const gender = parseGenderFromNameCellHtml(nameCellHtml);

    if (rank == null || !name || totalBirths == null) continue;

    rows.push({ rank, name, totalBirths, gender });
  }

  const nextMatch =
    html.match(/href="([^"]+)"[^>]*>\s*다음(?:\s*<|$)/i) ??
    html.match(/href="([^"]+)"[^>]*>\s*다음\s*</i);
  const nextPath = nextMatch?.[1] ? decodeHtml(nextMatch[1]) : null;

  return { rows, nextPath };
}
