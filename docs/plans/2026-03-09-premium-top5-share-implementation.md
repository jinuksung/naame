# Premium Top5 Detailed Report + Share Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 프리미엄 결과를 TOP5 상세 리포트(단일 아코디언)로 전환하고, 무료/프리미엄 카드 공유 이미지를 OS 공유 시트로 보낼 수 있게 만든다.

**Architecture:** 추천 엔진은 유지하고, 엔진 출력 위에 리포트 컴포저 계층을 추가한다. UI는 결과 카드 렌더 계층에서 단일 아코디언 + 2단 액션 버튼(좋아요/싫어요, 공유하기)을 적용한다. 공유는 화면 캡처가 아닌 전용 템플릿 컴포넌트를 이미지화한 뒤 `navigator.share`로 전달하고, 미지원 브라우저는 다운로드로 폴백한다.

**Tech Stack:** Next.js 14, React 18, TypeScript, Zustand, `@namefit/engine`, `html-to-image`(신규)

---

### Task 1: Contract + Layout Tests 먼저 깨기 (TDD Red)

**Files:**
- Modify: `packages/name-engine/src/types/recommend.ts`
- Create: `packages/name-engine/src/service/premiumReportComposer.test.ts`
- Modify: `packages/name-engine/src/service/premiumRecommend.test.ts`
- Modify: `apps/toss/src/app/premium/result/page.layout.test.ts`
- Modify: `apps/web/src/app/premium/result/page.layout.test.ts`
- Modify: `apps/toss/src/app/result.reason-render.test.ts`
- Modify: `apps/web/src/app/result.reason-render.test.ts`

**Step 1: 리포트 출력 타입에 대한 failing test 작성**

```ts
assert.ok(result.report, "프리미엄 후보는 상세 리포트를 포함해야 합니다.");
assert.equal(result.report.ageBands.length, 5);
assert.ok(result.report.ageBands.every((band) => band.lines.length === 2));
```

**Step 2: 프리미엄 화면 레이아웃 failing test 작성**

```ts
assert.equal(source.includes("results.slice(0, 5)"), true);
assert.equal(source.includes("expandedCardId"), true);
assert.equal(source.includes("좋아요 | 싫어요"), false); // 문자열 대신 구조 체크
assert.equal(source.includes("공유하기"), true);
```

**Step 3: 무료 결과 화면 공유 버튼 failing test 작성**

```ts
assert.equal(source.includes("공유하기"), true);
assert.equal(source.includes("shareFreeResultCard"), true);
```

**Step 4: 테스트 실행 (실패 확인)**

Run:
- `npx ts-node -P packages/name-engine/tsconfig.scripts.json packages/name-engine/src/service/premiumReportComposer.test.ts`
- `npx ts-node -P apps/toss/tsconfig.scripts.json apps/toss/src/app/premium/result/page.layout.test.ts`
- `npx ts-node -P apps/web/tsconfig.scripts.json apps/web/src/app/premium/result/page.layout.test.ts`
- `npx ts-node -P apps/toss/tsconfig.scripts.json apps/toss/src/app/result.reason-render.test.ts`
- `npx ts-node -P apps/web/tsconfig.scripts.json apps/web/src/app/result.reason-render.test.ts`

Expected: 신규 단언에서 FAIL

**Step 5: Commit**

```bash
git add packages/name-engine/src/types/recommend.ts \
  packages/name-engine/src/service/premiumReportComposer.test.ts \
  packages/name-engine/src/service/premiumRecommend.test.ts \
  apps/toss/src/app/premium/result/page.layout.test.ts \
  apps/web/src/app/premium/result/page.layout.test.ts \
  apps/toss/src/app/result.reason-render.test.ts \
  apps/web/src/app/result.reason-render.test.ts
git commit -m "test: define top5 report and share UI contract"
```

---

### Task 2: 프리미엄 리포트 컴포저(240 문장 슬롯) 구현

**Files:**
- Create: `packages/name-engine/src/service/premiumReportPhraseCatalog.ts`
- Create: `packages/name-engine/src/service/premiumReportComposer.ts`
- Modify: `packages/name-engine/src/service/premiumRecommend.ts`
- Modify: `packages/name-engine/src/types/recommend.ts`
- Modify: `packages/name-engine/src/service/premiumRecommend.test.ts`
- Test: `packages/name-engine/src/service/premiumReportComposer.test.ts`

**Step 1: failing test 기준으로 최소 컴포저 구현**

```ts
export interface PremiumReport {
  summary: string;
  bullets: string[];
  ageBands: Array<{ label: string; lines: [string, string] }>;
}

export function composePremiumReport(input: ComposeInput): PremiumReport {
  return {
    summary: "...",
    bullets: ["...", "...", "...", "..."],
    ageBands: AGE_BANDS.map((label) => ({ label, lines: [lineA, lineB] })),
  };
}
```

**Step 2: 240 문장 카탈로그 스키마 작성**

```ts
export const REPORT_PHRASES = {
  toneOpeners: [...30],
  ageBandSlots: { "0-19": { flow: [...10], fill: [...10], caution: [...10] }, ... },
  conditionAdjusters: [...40],
  connectors: [...20],
} as const;
```

**Step 3: `premiumRecommend.ts`에서 `result.report` 채우기**

```ts
why: buildWhyLines(...),
report: composePremiumReport({ summary, weakTop3, item, ... })
```

**Step 4: 테스트 실행 (pass 확인)**

Run:
- `npx ts-node -P packages/name-engine/tsconfig.scripts.json packages/name-engine/src/service/premiumReportComposer.test.ts`
- `npx ts-node -P packages/name-engine/tsconfig.scripts.json packages/name-engine/src/service/premiumRecommend.test.ts`

Expected: PASS

**Step 5: Commit**

```bash
git add packages/name-engine/src/service/premiumReportPhraseCatalog.ts \
  packages/name-engine/src/service/premiumReportComposer.ts \
  packages/name-engine/src/service/premiumRecommend.ts \
  packages/name-engine/src/types/recommend.ts \
  packages/name-engine/src/service/premiumRecommend.test.ts \
  packages/name-engine/src/service/premiumReportComposer.test.ts
git commit -m "feat(engine): add premium detailed report composer"
```

---

### Task 3: Premium UI를 TOP5 단일 아코디언 + 2단 버튼으로 전환

**Files:**
- Modify: `apps/toss/src/app/premium/result/page.tsx`
- Modify: `apps/web/src/app/premium/result/page.tsx`
- Modify: `apps/toss/src/app/globals.css`
- Modify: `apps/web/src/app/globals.css`
- Modify: `apps/toss/src/store/premiumResultSanitizer.ts`
- Modify: `apps/web/src/store/premiumResultSanitizer.ts`
- Modify: `apps/toss/src/store/premiumResultSanitizer.test.ts`
- Modify: `apps/web/src/store/premiumResultSanitizer.test.ts`

**Step 1: 표시 개수 TOP5로 축소**

```ts
const top5 = useMemo(() => results.slice(0, 5), [results]);
```

**Step 2: 단일 아코디언 상태 추가**

```ts
const [expandedCardId, setExpandedCardId] = useState<string | null>(top5[0]?.id ?? null);
const isExpanded = expandedCardId === cardId;
```

**Step 3: 액션 버튼 2단 레이아웃으로 변경**

```tsx
<div className="feedback-row is-split">...</div>
<div className="share-row">
  <button className="feedback-btn is-share">공유하기</button>
</div>
```

**Step 4: 테스트 실행 (pass 확인)**

Run:
- `npx ts-node -P apps/toss/tsconfig.scripts.json apps/toss/src/app/premium/result/page.layout.test.ts`
- `npx ts-node -P apps/web/tsconfig.scripts.json apps/web/src/app/premium/result/page.layout.test.ts`
- `npx ts-node -P apps/toss/tsconfig.scripts.json apps/toss/src/store/premiumResultSanitizer.test.ts`
- `npx ts-node -P apps/web/tsconfig.scripts.json apps/web/src/store/premiumResultSanitizer.test.ts`

Expected: PASS

**Step 5: Commit**

```bash
git add apps/toss/src/app/premium/result/page.tsx \
  apps/web/src/app/premium/result/page.tsx \
  apps/toss/src/app/globals.css \
  apps/web/src/app/globals.css \
  apps/toss/src/store/premiumResultSanitizer.ts \
  apps/web/src/store/premiumResultSanitizer.ts \
  apps/toss/src/store/premiumResultSanitizer.test.ts \
  apps/web/src/store/premiumResultSanitizer.test.ts
git commit -m "feat(ui): switch premium results to top5 accordion layout"
```

---

### Task 4: 공유 유틸 + 전용 템플릿 컴포넌트 구현 (무료/프리미엄 공통)

**Files:**
- Modify: `apps/web/package.json`
- Modify: `apps/toss/package.json`
- Create: `apps/web/src/lib/share/shareResultCardImage.ts`
- Create: `apps/toss/src/lib/share/shareResultCardImage.ts`
- Create: `apps/web/src/components/share/FreeResultShareCard.tsx`
- Create: `apps/toss/src/components/share/FreeResultShareCard.tsx`
- Create: `apps/web/src/components/share/PremiumResultShareCard.tsx`
- Create: `apps/toss/src/components/share/PremiumResultShareCard.tsx`

**Step 1: 공유 이미지 변환 의존성 추가**

Run:
- `npm i html-to-image --workspace @namefit/web --workspace @namefit/toss`

**Step 2: 공유 유틸 구현 (`navigator.share` + fallback)**

```ts
export async function shareResultCardImage(opts: ShareOptions): Promise<void> {
  const blob = await toBlob(opts.element, { pixelRatio: 2 });
  const file = new File([blob], opts.fileName, { type: "image/png" });
  if (navigator.canShare?.({ files: [file] })) {
    await navigator.share({ files: [file], title: opts.title });
    return;
  }
  downloadBlob(blob, opts.fileName);
}
```

**Step 3: 무료/프리미엄 전용 템플릿 컴포넌트 구현**

무료 템플릿 요구사항:
- 현재 카드 프레임과 동일 톤
- 좌상단: 성 포함 이름
- 하단 중앙: 한자 2블록
- 블록 내 순서: 한자 -> 음 -> 뜻
- 점수/이유/버튼 미포함

프리미엄 템플릿 요구사항:
- 리포트 전용 레이아웃으로만 캡처 (추천 입력/상단 안내 영역 제외)
- 현재 펼쳐진 카드의 상세 리포트 본문만 반영
- 카드 액션 버튼(좋아요/싫어요/공유하기) 미포함

**Step 4: 타입체크 실행**

Run:
- `npm run typecheck --workspace @namefit/web`
- `npm run typecheck --workspace @namefit/toss`

Expected: PASS

**Step 5: Commit**

```bash
git add apps/web/package.json apps/toss/package.json \
  apps/web/src/lib/share/shareResultCardImage.ts \
  apps/toss/src/lib/share/shareResultCardImage.ts \
  apps/web/src/components/share/FreeResultShareCard.tsx \
  apps/toss/src/components/share/FreeResultShareCard.tsx \
  apps/web/src/components/share/PremiumResultShareCard.tsx \
  apps/toss/src/components/share/PremiumResultShareCard.tsx
git commit -m "feat(share): add result card image sharing utility and templates"
```

---

### Task 5: 무료/프리미엄 결과 화면에 공유하기 연결

**Files:**
- Modify: `apps/toss/src/app/result/page.tsx`
- Modify: `apps/web/src/app/result/page.tsx`
- Modify: `apps/toss/src/app/premium/result/page.tsx`
- Modify: `apps/web/src/app/premium/result/page.tsx`
- Modify: `apps/toss/src/app/globals.css`
- Modify: `apps/web/src/app/globals.css`
- Modify: `apps/toss/src/app/result.reason-render.test.ts`
- Modify: `apps/web/src/app/result.reason-render.test.ts`
- Modify: `apps/toss/src/app/premium/result/page.layout.test.ts`
- Modify: `apps/web/src/app/premium/result/page.layout.test.ts`

**Step 1: 공유 상태 + 핸들러 추가**

```ts
const [sharingCardId, setSharingCardId] = useState<string | null>(null);
const handleShare = async (item: ...) => { ... }
```

**Step 2: 버튼 배치 적용**

```tsx
<div className="feedback-row is-split">좋아요/싫어요</div>
<div className="share-row">
  <button type="button" className="feedback-btn is-share">공유하기</button>
</div>
```

**Step 3: 무료 공유 템플릿 연결**
- 무료 결과: `FreeResultShareCard`에 이름+한자(한자->음->뜻)만 전달

**Step 4: 테스트 실행 (pass 확인)**

Run:
- `npx ts-node -P apps/toss/tsconfig.scripts.json apps/toss/src/app/result.reason-render.test.ts`
- `npx ts-node -P apps/web/tsconfig.scripts.json apps/web/src/app/result.reason-render.test.ts`
- `npx ts-node -P apps/toss/tsconfig.scripts.json apps/toss/src/app/premium/result/page.layout.test.ts`
- `npx ts-node -P apps/web/tsconfig.scripts.json apps/web/src/app/premium/result/page.layout.test.ts`

Expected: PASS

**Step 5: Commit**

```bash
git add apps/toss/src/app/result/page.tsx \
  apps/web/src/app/result/page.tsx \
  apps/toss/src/app/premium/result/page.tsx \
  apps/web/src/app/premium/result/page.tsx \
  apps/toss/src/app/globals.css \
  apps/web/src/app/globals.css \
  apps/toss/src/app/result.reason-render.test.ts \
  apps/web/src/app/result.reason-render.test.ts \
  apps/toss/src/app/premium/result/page.layout.test.ts \
  apps/web/src/app/premium/result/page.layout.test.ts
git commit -m "feat(ui): wire free/premium card share actions"
```

---

### Task 6: 무료모드 유료 안내 카피를 현재 범위 기준으로 정리

**Files:**
- Modify: `apps/toss/src/app/result/page.tsx`
- Modify: `apps/web/src/app/result/page.tsx`
- Modify: `apps/toss/src/app/result.reason-render.test.ts`
- Modify: `apps/web/src/app/result.reason-render.test.ts`

**Step 1: 안내 문구를 아래 3포인트로 교체**

```tsx
<h3>프리미엄 리포트 곧 오픈</h3>
<li>사주 기반 상위 5개 이름 추천</li>
<li>후보별 상세 리포트(연령대 5구간)</li>
<li>부족/과중 오행 중심 해설</li>
```

**Step 2: 보조문구 없음 정책 유지 확인**
- 추가 문장(예: "지금은 무료 추천...") 삽입 금지

**Step 3: 테스트 보강**
- 기존 "20개 확대" 등 과거 문구가 남아있지 않음을 assert

**Step 4: 테스트 실행 (pass 확인)**

Run:
- `npx ts-node -P apps/toss/tsconfig.scripts.json apps/toss/src/app/result.reason-render.test.ts`
- `npx ts-node -P apps/web/tsconfig.scripts.json apps/web/src/app/result.reason-render.test.ts`

Expected: PASS

**Step 5: Commit**

```bash
git add apps/toss/src/app/result/page.tsx \
  apps/web/src/app/result/page.tsx \
  apps/toss/src/app/result.reason-render.test.ts \
  apps/web/src/app/result.reason-render.test.ts
git commit -m "copy: align premium teaser with current launch scope"
```

---

### Task 7: 최종 검증 + 문서 동기화 + 푸시

**Files:**
- Modify: `docs/plans/2026-03-09-premium-report-expansion-design.md`
- Optional: `docs/plans/2026-03-09-premium-top5-share-implementation.md` (진행 체크 업데이트)

**Step 1: 전체 검증 명령 실행**

Run:
- `npm run typecheck --workspace @namefit/web`
- `npm run typecheck --workspace @namefit/toss`
- `npx ts-node -P apps/web/tsconfig.scripts.json apps/web/src/app/result.reason-render.test.ts`
- `npx ts-node -P apps/toss/tsconfig.scripts.json apps/toss/src/app/result.reason-render.test.ts`
- `npx ts-node -P apps/web/tsconfig.scripts.json apps/web/src/app/premium/result/page.layout.test.ts`
- `npx ts-node -P apps/toss/tsconfig.scripts.json apps/toss/src/app/premium/result/page.layout.test.ts`
- `npx ts-node -P packages/name-engine/tsconfig.scripts.json packages/name-engine/src/service/premiumReportComposer.test.ts`
- `npx ts-node -P packages/name-engine/tsconfig.scripts.json packages/name-engine/src/service/premiumRecommend.test.ts`

Expected: All PASS

**Step 2: 수동 QA 체크**
- 프리미엄 5개만 노출
- TOP1 기본 펼침 / 단일 아코디언
- 좋아요/싫어요와 공유 버튼 2단 구조
- 무료 공유 이미지 레이아웃이 현재 카드와 동일(좌상단 이름, 하단 중앙 한자블록)
- OS 공유 시트 호출 + 미지원 fallback

**Step 3: 설계 문서 상태 반영**
- 완료된 정책/예외사항을 설계 문서에 반영

**Step 4: 최종 커밋**

```bash
git add docs/plans/2026-03-09-premium-report-expansion-design.md \
  docs/plans/2026-03-09-premium-top5-share-implementation.md
git commit -m "docs: sync implementation status for premium top5 share rollout"
```

**Step 5: Push**

```bash
git push origin codex/premium-feature
```

---

## Notes for Implementation Order
- DRY: 공유 유틸은 web/toss 각각 복붙으로 시작하되, API 시그니처는 동일하게 유지한다.
- YAGNI: 공유 이미지 포맷은 PNG 1종만 지원한다.
- TDD: 각 Task의 테스트를 먼저 깨고 최소 구현으로 통과시킨다.
- Commit Cadence: Task 단위로 쪼개어 작은 커밋을 유지한다.
