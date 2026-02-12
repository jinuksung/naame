# Name Prior Gate Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add a top-name prior gate and prior score so 2-syllable recommendations look like real Korean names while preserving diversity.

**Architecture:** Build a prior index from birth-registration top names, add reusable gate/score modules, then inject a final weighted score stage before final ranking/diversity selection. Keep existing core engine scoring intact and only adjust ranking in a dedicated final-score module.

**Tech Stack:** TypeScript, Next.js runtime, Node fs/path APIs, existing engine recommendation pipeline.

---

### Task 1: Add prior index and scoring tests (RED)

**Files:**
- Create: `src/lib/namefit/prior/namePrior.test.ts`

1. Write tests for prior index construction from local top-name file shape.
2. Write tests for blacklist gate failures (`가지`, `가나`, `고지`, `규도`).
3. Write tests for strict/non-strict whitelist behavior.
4. Write tests that known names (`도윤`, `서준`) get bigram boost.
5. Run the test script and confirm failures.

### Task 2: Implement prior index + gates + score modules (GREEN)

**Files:**
- Create: `src/lib/namefit/prior/buildNamePrior.ts`
- Create: `src/lib/namefit/prior/gates.ts`
- Create: `src/lib/namefit/prior/namePriorScore.ts`

1. Parse top-name source (`birth_registered_names_gender.jsonl`, with JSON fallback) and build gendered sets/frequencies.
2. Implement syllable whitelist + blacklist + lightweight pattern checks.
3. Implement prior score calculation with smoothed syllable probability and optional bigram boost.
4. Keep outputs debuggable with reason messages.

### Task 3: Integrate final score combination into recommendation ranking

**Files:**
- Create: `src/lib/namefit/rank/finalScore.ts`
- Create: `src/lib/namefit/debug/priorDiagnostics.ts`
- Modify: `src/engine/recommend.ts`
- Modify: `src/types.ts`

1. Add final score combinator with configurable `priorWeight`, `strictGate`, and `allowNonWhitelist`.
2. Apply prior gate+score after candidate generation and before ranking/diversity selection.
3. Keep existing score fields; add optional prior diagnostics in reasons/meta.
4. Ensure only 2-syllable names get prior application.

### Task 4: Verify and expose diagnostics output

**Files:**
- Modify: `src/run.ts` (if needed for local debug visibility)

1. Add/plug a diagnostics helper that prints top N: name, engine score, prior score, gate, reasons.
2. Run test/typecheck commands.
3. Report verification evidence and touched files.
