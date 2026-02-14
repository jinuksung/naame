import { loadInputDataset } from "./core/load";
import { buildSyllableStats } from "./core/syllables";
import { generateCandidatesForGender } from "./core/generate";
import { filterCandidates } from "./core/filter";
import { scoreCandidates } from "./core/score";
import { diversifyCandidates } from "./core/diversify";
import { writeArtifacts } from "./core/write";
import type {
  FilterReason,
  Gender,
  GenerationDiagnostics,
  NamePoolOutput,
  OutputItem,
  PipelineOptions,
  PipelineResult,
  ScoreSummary,
  Tier
} from "./types";

function round2(value: number): number {
  return Math.round(value * 100) / 100;
}

function emptyTierCounts(): Record<Tier, number> {
  return { A: 0, B: 0, C: 0 };
}

function summarizeScores(items: OutputItem[]): ScoreSummary {
  if (items.length === 0) {
    return { min: 0, max: 0, avg: 0, top30: [], top50: [] };
  }
  const scores = items.map((item) => item.score);
  const total = scores.reduce((sum, score) => sum + score, 0);
  return {
    min: round2(Math.min(...scores)),
    max: round2(Math.max(...scores)),
    avg: round2(total / scores.length),
    top30: items.slice(0, 30),
    top50: items.slice(0, 50)
  };
}

function markdownTable(headers: string[], rows: string[][]): string {
  const head = `| ${headers.join(" | ")} |`;
  const sep = `| ${headers.map(() => "---").join(" | ")} |`;
  const body = rows.map((row) => `| ${row.join(" | ")} |`);
  return [head, sep, ...body].join("\n");
}

function scoreHistogram(items: OutputItem[]): Array<[string, number]> {
  if (items.length === 0) {
    return [];
  }
  const scores = items.map((item) => item.score);
  const min = Math.min(...scores);
  const max = Math.max(...scores);
  if (max === min) {
    return [[`${round2(min)}-${round2(max)}`, scores.length]];
  }

  const bins = 6;
  const width = (max - min) / bins;
  const counts = Array.from({ length: bins }, () => 0);
  for (const score of scores) {
    const rawIndex = Math.floor((score - min) / width);
    const index = Math.min(bins - 1, Math.max(0, rawIndex));
    counts[index] += 1;
  }

  const ranges: Array<[string, number]> = [];
  for (let i = 0; i < bins; i += 1) {
    const start = round2(min + i * width);
    const end = round2(min + (i + 1) * width);
    ranges.push([`${start}-${end}`, counts[i]]);
  }
  return ranges;
}

function buildReport(
  generatedAt: string,
  inputRef: string,
  data: {
    male: NamePoolOutput;
    female: NamePoolOutput;
    diagnostics: GenerationDiagnostics;
    stats: ReturnType<typeof buildSyllableStats>;
    oneSyllableCount: number;
    threeSyllableCount: number;
    totalItemCount: number;
    commonTopN: number;
  }
): string {
  const { diagnostics, stats, male, female } = data;

  const lines: string[] = [];
  lines.push("# Name Pool Generation Report");
  lines.push("");
  lines.push(`- Generated at: ${generatedAt}`);
  lines.push(`- Input: ${inputRef}`);
  lines.push(`- Total items loaded: ${data.totalItemCount}`);
  lines.push(`- 1-syllable count (report-only): ${data.oneSyllableCount}`);
  lines.push(`- 3-syllable count (not generated): ${data.threeSyllableCount}`);
  lines.push(`- Common syllable top-N window: ${data.commonTopN}`);
  lines.push("");

  lines.push("## Syllable Frequency Top 10");
  lines.push("");
  lines.push("### Male Start Top 10");
  lines.push(
    markdownTable(
      ["Syllable", "Count"],
      stats.profiles.M.startTop10.map(([syllable, count]) => [syllable, String(count)])
    )
  );
  lines.push("");
  lines.push("### Male End Top 10");
  lines.push(
    markdownTable(
      ["Syllable", "Count"],
      stats.profiles.M.endTop10.map(([syllable, count]) => [syllable, String(count)])
    )
  );
  lines.push("");
  lines.push("### Female Start Top 10");
  lines.push(
    markdownTable(
      ["Syllable", "Count"],
      stats.profiles.F.startTop10.map(([syllable, count]) => [syllable, String(count)])
    )
  );
  lines.push("");
  lines.push("### Female End Top 10");
  lines.push(
    markdownTable(
      ["Syllable", "Count"],
      stats.profiles.F.endTop10.map(([syllable, count]) => [syllable, String(count)])
    )
  );
  lines.push("");

  lines.push("## Common Syllable Sets");
  lines.push("");
  lines.push(`- commonStartSet intersection: ${stats.commonStartIntersection.join(", ") || "(none)"}`);
  lines.push(`- commonEndSet intersection: ${stats.commonEndIntersection.join(", ") || "(none)"}`);
  lines.push("");

  lines.push("## Filter Removal Counts");
  lines.push("");
  const reasons: FilterReason[] = [
    "repeated_syllable",
    "blacklist",
    "invalid_chars",
    "obvious_weird"
  ];
  lines.push(
    markdownTable(
      ["Reason", "M", "F"],
      reasons.map((reason) => [
        reason,
        String(diagnostics.removedByReasonByGender.M[reason]),
        String(diagnostics.removedByReasonByGender.F[reason])
      ])
    )
  );
  lines.push("");

  lines.push("## Tier Counts (Final)");
  lines.push("");
  lines.push(
    markdownTable(
      ["Tier", "M", "F"],
      (["A", "B", "C"] as Tier[]).map((tier) => [
        tier,
        String(diagnostics.tierCountsByGender.M[tier]),
        String(diagnostics.tierCountsByGender.F[tier])
      ])
    )
  );
  lines.push("");

  lines.push("## Score Summary");
  lines.push("");
  lines.push(
    markdownTable(
      ["Gender", "Min", "Max", "Avg"],
      [
        [
          "M",
          String(diagnostics.scoreSummaryByGender.M.min),
          String(diagnostics.scoreSummaryByGender.M.max),
          String(diagnostics.scoreSummaryByGender.M.avg)
        ],
        [
          "F",
          String(diagnostics.scoreSummaryByGender.F.min),
          String(diagnostics.scoreSummaryByGender.F.max),
          String(diagnostics.scoreSummaryByGender.F.avg)
        ]
      ]
    )
  );
  lines.push("");

  lines.push("### Male Score Histogram");
  lines.push(
    markdownTable(
      ["Range", "Count"],
      scoreHistogram(male.items).map(([range, count]) => [range, String(count)])
    )
  );
  lines.push("");
  lines.push("### Female Score Histogram");
  lines.push(
    markdownTable(
      ["Range", "Count"],
      scoreHistogram(female.items).map(([range, count]) => [range, String(count)])
    )
  );
  lines.push("");

  lines.push("## Top 30 Scored Examples");
  lines.push("");
  lines.push("### Male Top 30");
  lines.push(
    markdownTable(
      ["Name", "Tier", "Score", "Base", "Style", "Stability", "GenderFit"],
      diagnostics.scoreSummaryByGender.M.top30.map((item) => [
        item.name,
        item.tier,
        String(item.score),
        String(item.scoreBreakdown.baseBonus),
        String(item.scoreBreakdown.styleScore),
        String(item.scoreBreakdown.stabilityScore),
        String(item.scoreBreakdown.genderFitScore)
      ])
    )
  );
  lines.push("");
  lines.push("### Female Top 30");
  lines.push(
    markdownTable(
      ["Name", "Tier", "Score", "Base", "Style", "Stability", "GenderFit"],
      diagnostics.scoreSummaryByGender.F.top30.map((item) => [
        item.name,
        item.tier,
        String(item.score),
        String(item.scoreBreakdown.baseBonus),
        String(item.scoreBreakdown.styleScore),
        String(item.scoreBreakdown.stabilityScore),
        String(item.scoreBreakdown.genderFitScore)
      ])
    )
  );
  lines.push("");

  lines.push("## Example 50");
  lines.push("");
  lines.push(`- Male top 50 names: ${diagnostics.scoreSummaryByGender.M.top50.map((item) => item.name).join(", ")}`);
  lines.push(`- Female top 50 names: ${diagnostics.scoreSummaryByGender.F.top50.map((item) => item.name).join(", ")}`);
  lines.push("");

  lines.push("## Diversity Distribution");
  lines.push("");
  lines.push(
    `- Male max start/end usage: ${diagnostics.diversityByGender.M.maxPerStartUsed}/${diagnostics.diversityByGender.M.maxPerEndUsed}`
  );
  lines.push(
    markdownTable(
      ["Male start", "Count", "Male end", "Count"],
      Array.from({ length: 10 }, (_, index) => {
        const startRow = diagnostics.diversityByGender.M.startCounts[index];
        const endRow = diagnostics.diversityByGender.M.endCounts[index];
        return [
          startRow?.[0] ?? "",
          startRow ? String(startRow[1]) : "",
          endRow?.[0] ?? "",
          endRow ? String(endRow[1]) : ""
        ];
      })
    )
  );
  lines.push("");
  lines.push(
    `- Female max start/end usage: ${diagnostics.diversityByGender.F.maxPerStartUsed}/${diagnostics.diversityByGender.F.maxPerEndUsed}`
  );
  lines.push(
    markdownTable(
      ["Female start", "Count", "Female end", "Count"],
      Array.from({ length: 10 }, (_, index) => {
        const startRow = diagnostics.diversityByGender.F.startCounts[index];
        const endRow = diagnostics.diversityByGender.F.endCounts[index];
        return [
          startRow?.[0] ?? "",
          startRow ? String(startRow[1]) : "",
          endRow?.[0] ?? "",
          endRow ? String(endRow[1]) : ""
        ];
      })
    )
  );
  lines.push("");

  lines.push("## Candidate Flow");
  lines.push("");
  lines.push(
    markdownTable(
      ["Gender", "Generated", "After Filter", "Final"],
      [
        [
          "M",
          String(diagnostics.candidateCountsByGender.M.generated),
          String(diagnostics.candidateCountsByGender.M.afterFilter),
          String(diagnostics.candidateCountsByGender.M.final)
        ],
        [
          "F",
          String(diagnostics.candidateCountsByGender.F.generated),
          String(diagnostics.candidateCountsByGender.F.afterFilter),
          String(diagnostics.candidateCountsByGender.F.final)
        ]
      ]
    )
  );
  lines.push("");
  lines.push("## One-Syllable Names (Report Only)");
  lines.push("");
  lines.push(`- M: ${stats.oneSyllableByGender.M.join(", ") || "(none)"}`);
  lines.push(`- F: ${stats.oneSyllableByGender.F.join(", ") || "(none)"}`);
  lines.push("");

  return lines.join("\n");
}

function generatePoolForGender(
  gender: Gender,
  generatedAt: string,
  inputRef: string,
  options: Required<Pick<PipelineOptions, "targetCount" | "minCount" | "maxPerStart" | "maxPerEnd">>,
  context: {
    loaded: ReturnType<typeof loadInputDataset>;
    stats: ReturnType<typeof buildSyllableStats>;
  }
): {
  output: NamePoolOutput;
  removedByReason: Record<FilterReason, number>;
  tierCounts: Record<Tier, number>;
  summary: ScoreSummary;
  candidateCounts: { generated: number; afterFilter: number; final: number };
  diversity: ReturnType<typeof diversifyCandidates>["stats"];
} {
  const generated = generateCandidatesForGender(gender, context.loaded, context.stats);
  const filtered = filterCandidates(generated, context.stats.profiles[gender], context.loaded.allTwoSyllableSet);
  const scored = scoreCandidates(filtered.kept, gender, context.loaded, context.stats);
  const diversified = diversifyCandidates(scored, {
    targetCount: options.targetCount,
    minCount: options.minCount,
    maxPerStart: options.maxPerStart,
    maxPerEnd: options.maxPerEnd
  });

  const tierCounts = emptyTierCounts();
  for (const item of diversified.selected) {
    tierCounts[item.tier] += 1;
  }

  const output: NamePoolOutput = {
    generatedAt,
    input: inputRef,
    gender,
    count: diversified.selected.length,
    items: diversified.selected
  };

  return {
    output,
    removedByReason: filtered.removedByReason,
    tierCounts,
    summary: summarizeScores(output.items),
    candidateCounts: {
      generated: generated.length,
      afterFilter: filtered.kept.length,
      final: output.count
    },
    diversity: diversified.stats
  };
}

export function runNamePoolPipeline(options: PipelineOptions): PipelineResult {
  const targetCount = options.targetCount ?? 600;
  const minCount = options.minCount ?? 400;
  const commonTopN = options.commonTopN ?? 7;
  const maxPerStart = options.maxPerStart ?? 3;
  const maxPerEnd = options.maxPerEnd ?? 3;
  const generatedAt = new Date().toISOString();
  const inputRef = options.inputPath;

  const loaded = loadInputDataset(options.inputPath);
  const stats = buildSyllableStats(loaded, commonTopN);

  const male = generatePoolForGender(
    "M",
    generatedAt,
    inputRef,
    { targetCount, minCount, maxPerStart, maxPerEnd },
    { loaded, stats }
  );
  const female = generatePoolForGender(
    "F",
    generatedAt,
    inputRef,
    { targetCount, minCount, maxPerStart, maxPerEnd },
    { loaded, stats }
  );

  const diagnostics: GenerationDiagnostics = {
    removedByReasonByGender: {
      M: male.removedByReason,
      F: female.removedByReason
    },
    tierCountsByGender: {
      M: male.tierCounts,
      F: female.tierCounts
    },
    diversityByGender: {
      M: male.diversity,
      F: female.diversity
    },
    scoreSummaryByGender: {
      M: male.summary,
      F: female.summary
    },
    candidateCountsByGender: {
      M: male.candidateCounts,
      F: female.candidateCounts
    }
  };

  const report = buildReport(generatedAt, inputRef, {
    male: male.output,
    female: female.output,
    diagnostics,
    stats,
    oneSyllableCount: loaded.oneSyllableItems.length,
    threeSyllableCount: loaded.threeSyllableItems.length,
    totalItemCount: loaded.items.length,
    commonTopN
  });

  writeArtifacts(options.outDir, male.output, female.output, report);

  return {
    male: male.output,
    female: female.output,
    report,
    diagnostics
  };
}
