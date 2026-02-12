import {
  CandidateWithEngineScore,
  FinalScoreEvaluation
} from "../rank/finalScore";

export interface PriorDiagnosticRow {
  name: string;
  engineScore: number;
  priorScore: number;
  gate: string;
  reasons: string[];
}

function round2(value: number): number {
  return Math.round(value * 100) / 100;
}

export function buildPriorDiagnosticRows<T extends CandidateWithEngineScore>(
  evaluations: FinalScoreEvaluation<T>[],
  topN: number = 10
): PriorDiagnosticRow[] {
  const sorted = evaluations
    .slice()
    .sort((a, b) => b.finalScore01 - a.finalScore01);

  const bestByName = new Map<string, FinalScoreEvaluation<T>>();
  for (const row of sorted) {
    if (!bestByName.has(row.candidate.nameHangul)) {
      bestByName.set(row.candidate.nameHangul, row);
    }
  }

  return Array.from(bestByName.values())
    .slice(0, Math.max(1, topN))
    .map((row) => ({
      name: row.candidate.nameHangul,
      engineScore: round2(row.engineScore01 * 100),
      priorScore: round2(row.priorScore01 * 100),
      gate: row.gate,
      reasons: row.reasons
    }));
}

export function formatPriorDiagnosticRows(rows: PriorDiagnosticRow[]): string {
  if (rows.length === 0) {
    return "[priorDiagnostics] no rows";
  }

  const header = "name | engineScore | priorScore | gate | reasons";
  const body = rows.map((row) => {
    const reasonText = row.reasons.length > 0 ? row.reasons.join("; ") : "-";
    return `${row.name} | ${row.engineScore.toFixed(2)} | ${row.priorScore.toFixed(2)} | ${row.gate} | ${reasonText}`;
  });

  return [header, ...body].join("\n");
}
