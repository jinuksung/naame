# Namefit Premium Feature Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add a full premium recommendation flow (`/premium -> /premium/loading -> /premium/result`) with temporary free-open routing and saju-first ranking while keeping existing free mode behavior intact.

**Architecture:** Add a new premium service in `@namefit/engine` that uses `@fullstackfamily/manseryeok` for saju pillars, computes saju/sound 5-star scores, and returns premium result DTOs. Wire new premium API endpoints and pages in both `apps/web` and `apps/toss`, move current free flow under `/free`, and make `/` either redirect to `/premium` (env-gated) or render a route chooser landing.

**Tech Stack:** TypeScript, Next.js app router, Zustand, `@fullstackfamily/manseryeok`, existing `@namefit/engine` recommendation pipeline.

---

### Task 1: Add Failing Engine Tests For Premium Scoring

**Files:**
- Create: `packages/name-engine/src/core/premium/sajuScore.test.ts`
- Create: `packages/name-engine/src/service/premiumRecommend.test.ts`

**Step 1: Write failing test for saju distribution/score rules**
- Assert `distSaju` normalization and hidden-stem weighting behavior.
- Assert 0.5-step rounding and improve/harmony mode score output.

**Step 2: Run test to verify RED**
- Run: `npx ts-node -P packages/name-engine/tsconfig.scripts.json packages/name-engine/src/core/premium/sajuScore.test.ts`
- Expected: FAIL (module/functions missing).

**Step 3: Write failing service contract test**
- Validate payload parsing (solar/lunar/leap/hour optional), mode summary, and sorting priority (`sajuScore5 > engineScore01 > soundScore5`).

**Step 4: Run service test to verify RED**
- Run: `npx ts-node -P packages/name-engine/tsconfig.scripts.json packages/name-engine/src/service/premiumRecommend.test.ts`
- Expected: FAIL (service/types missing).

### Task 2: Implement Premium Core Modules In Engine

**Files:**
- Create: `packages/name-engine/src/core/premium/manseryeok.ts`
- Create: `packages/name-engine/src/core/premium/elements.ts`
- Create: `packages/name-engine/src/core/premium/sajuDist.ts`
- Create: `packages/name-engine/src/core/premium/sajuScore.ts`
- Create: `packages/name-engine/src/core/premium/soundScore.ts`
- Create: `packages/name-engine/src/core/premium/index.ts`
- Modify: `packages/name-engine/src/types/recommend.ts`
- Modify: `packages/name-engine/src/index.ts`

**Step 1: Implement manseryeok adapter**
- Use `calculateSajuSimple` and `lunarToSolar` from `@fullstackfamily/manseryeok`.
- Return 3-pillar/4-pillar payload with KST-oriented date handling.

**Step 2: Implement element distribution utilities**
- Add normalized vector helpers, branch hidden-stem table, and status-band labels.

**Step 3: Implement saju score math**
- Apply `need[e]`, improve mode, harmony mode, and half-step rounding.

**Step 4: Implement independent sound score**
- Apply mode rules and ±0.5 flow adjustment with clamp.

**Step 5: Export premium types/functions**
- Add premium DTO types and public exports.

### Task 3: Implement Premium Recommendation Service

**Files:**
- Create: `packages/name-engine/src/service/premiumRecommend.ts`
- Modify: `packages/name-engine/src/data/loadSurnameMap.ts`

**Step 1: Parse/validate premium input**
- Date/calendar/leap/time/surnameHanja/gender/exploreSeed validation.

**Step 2: Resolve surname reading from hanja**
- Add helper in `loadSurnameMap.ts` to resolve likely reading by hanja.

**Step 3: Build premium results**
- Call `recommendNames` with larger pool.
- Compute per-card `distFullName`, `sajuScore5`, `soundScore5`, why, and final sorted/diversified top results.

**Step 4: Include top summary payload**
- 4 pillars (or 3 pillars + time-missing badge signal), distributions, mode summary sentence, 부족 TOP2.

**Step 5: Re-run engine tests**
- Run:
  - `npx ts-node -P packages/name-engine/tsconfig.scripts.json packages/name-engine/src/core/premium/sajuScore.test.ts`
  - `npx ts-node -P packages/name-engine/tsconfig.scripts.json packages/name-engine/src/service/premiumRecommend.test.ts`
- Expected: PASS.

### Task 4: Add Premium API + Client Contracts In Web/Toss

**Files:**
- Modify: `apps/web/src/types/recommend.ts`
- Modify: `apps/toss/src/types/recommend.ts`
- Modify: `apps/web/src/lib/api.ts`
- Modify: `apps/toss/src/lib/api.ts`
- Create: `apps/web/src/app/api/recommend/premium/route.ts`
- Create: `apps/toss/src/app/api/recommend/premium/route.ts`

**Step 1: Add premium request/response client types**
- Keep free types unchanged for backward compatibility.

**Step 2: Add `fetchPremiumRecommendations`**
- Add response-shape guards for premium payload.

**Step 3: Add premium API routes**
- Use engine premium service and keep toss CORS behavior consistent.

### Task 5: Route Restructure + Premium UI In apps/web

**Files:**
- Create: `apps/web/src/store/usePremiumRecommendStore.ts`
- Create: `apps/web/src/app/free/page.tsx`
- Create: `apps/web/src/app/free/loading/page.tsx`
- Create: `apps/web/src/app/free/result/page.tsx`
- Create: `apps/web/src/app/premium/page.tsx`
- Create: `apps/web/src/app/premium/loading/page.tsx`
- Create: `apps/web/src/app/premium/result/page.tsx`
- Modify: `apps/web/src/app/page.tsx`
- Modify: `apps/web/src/app/globals.css`
- Modify tests under `apps/web/src/app/*.test.ts`

**Step 1: Move existing free flow to `/free`**
- Preserve all current free behavior and feedback actions.

**Step 2: Add premium input/loading/result pages**
- Use specified fields/messages/text and per-card stars.

**Step 3: Implement `/` policy**
- If `FEATURE_PREMIUM_DEFAULT_ROUTE=true` and today(KST) <= `FEATURE_PREMIUM_FREE_UNTIL`, redirect to `/premium`; otherwise show chooser landing.

**Step 4: Update web tests**
- Update path-sensitive assertions to new route/file targets and add premium-route checks.

### Task 6: Route Restructure + Premium UI In apps/toss

**Files:**
- Create: `apps/toss/src/store/usePremiumRecommendStore.ts`
- Create: `apps/toss/src/app/free/page.tsx`
- Create: `apps/toss/src/app/free/loading/page.tsx`
- Create: `apps/toss/src/app/free/result/page.tsx`
- Create: `apps/toss/src/app/premium/page.tsx`
- Create: `apps/toss/src/app/premium/loading/page.tsx`
- Create: `apps/toss/src/app/premium/result/page.tsx`
- Modify: `apps/toss/src/app/page.tsx`
- Modify: `apps/toss/src/app/feature/recommend/page.tsx`
- Modify: `apps/toss/src/app/feature/result/page.tsx`
- Modify: `apps/toss/src/app/loading/page.tsx`
- Modify: `apps/toss/src/app/result/page.tsx`
- Modify: `apps/toss/src/app/globals.css`
- Modify toss route/layout tests

**Step 1: Keep backward compatibility for legacy toss paths**
- Re-export or redirect legacy paths to new `/free` flow.

**Step 2: Add premium pages and top warning/free banner**
- Match TDS style and premium requirements.

**Step 3: Apply `/` redirect policy**
- Same env logic as web.

**Step 4: Update toss tests**
- Route redirection and layout assertions aligned to new structure.

### Task 7: Verification Before Completion

**Files:**
- Modify as required by implementation.

**Step 1: Run focused engine tests**
- `npx ts-node -P packages/name-engine/tsconfig.scripts.json packages/name-engine/src/core/premium/sajuScore.test.ts`
- `npx ts-node -P packages/name-engine/tsconfig.scripts.json packages/name-engine/src/service/premiumRecommend.test.ts`

**Step 2: Run app regression tests touched by routing**
- `npx ts-node -P apps/web/tsconfig.scripts.json apps/web/src/app/page.layout.test.ts`
- `npx ts-node -P apps/web/tsconfig.scripts.json apps/web/src/app/basic-mode-flow.test.ts`
- `npx ts-node -P apps/toss/tsconfig.scripts.json apps/toss/src/app/page.layout.test.ts`
- `npx ts-node -P apps/toss/tsconfig.scripts.json apps/toss/src/app/route-redirect-paths.test.ts`

**Step 3: Run typechecks**
- `npm run typecheck --workspace @namefit/engine` (or `npx tsc --noEmit -p packages/name-engine/tsconfig.json`)
- `npm run typecheck --workspace @namefit/web`
- `npm run typecheck --workspace @namefit/toss`

**Step 4: Confirm completion checklist**
- `/premium -> /premium/loading -> /premium/result` works in both apps.
- 3주/4주 handling verified.
- Harmony mode + top2 부족 labels visible.
- Card-level saju/sound stars visible.
- Premium sorting uses saju first.
- Free flow unchanged under `/free`.
