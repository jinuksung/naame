# Surname Influence Ranking Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 성씨(한자)가 바뀔 때 top10 추천 구성/순위가 뚜렷하게 달라지도록 surname 영향 점수를 랭킹/프루닝 모두에 반영한다.

**Architecture:** 기존 2글자 이름 기반 점수를 `baseNameScore`로 유지하고, 별도 `surname influence` 모듈을 추가해 `surnameSynergy`, `surnamePronFlow`, `balance3`를 계산한다. 후보 탐색 단계에 surname-aware beam을 도입해 first/second reading topK를 줄이면서 성씨 영향을 조기에 반영한다. prior gate/final prior blend는 그대로 유지한다.

**Tech Stack:** TypeScript, Node assert 테스트(ts-node), existing name-engine scoring pipeline.

---

### Task 1: RED - 성씨 영향 스코어 모듈 테스트 작성

**Files:**
- Create: `/Users/JINUKSOUNG/Desktop/jinuk/name/packages/name-engine/src/engine/scoring/surnameInfluence.test.ts`

**Step 1: Write failing tests**
- `elementSynergy` 상생/상극/동일 규칙 검증
- `scoreSurnameSynergy`가 surname element 변경 시 점수 차이를 내는지 검증
- `scoreSurnamePronunciationFlow` 반복/충돌 감점 검증
- `scoreBalance3`가 균형/쏠림을 구분하는지 검증

**Step 2: Run test to verify RED**
- Run: `npm run test:engine:surname`
- Expected: 모듈 미존재/함수 미구현으로 FAIL

### Task 2: GREEN - surname influence 모듈 구현

**Files:**
- Create: `/Users/JINUKSOUNG/Desktop/jinuk/name/packages/name-engine/src/engine/scoring/surnameInfluence.ts`
- Modify: `/Users/JINUKSOUNG/Desktop/jinuk/name/packages/name-engine/src/types.ts`
- Modify: `/Users/JINUKSOUNG/Desktop/jinuk/name/packages/name-engine/src/index.ts`

**Step 1: Minimal implementation**
- `elementSynergy`, `scoreSurnameSynergy`, `scoreBalance3`, `scoreSurnamePronunciationFlow`
- `DEFAULT_SURNAME_INFLUENCE_CONFIG` + env override resolver
- 타입에 surname component score 필드 추가

**Step 2: Run tests**
- Run: `npm run test:engine:surname`
- Expected: PASS

### Task 3: RED - 성씨 변경 시 top10 차이 통합 테스트 작성

**Files:**
- Create: `/Users/JINUKSOUNG/Desktop/jinuk/name/packages/name-engine/src/engine/recommendSurnameSensitivity.test.ts`

**Step 1: Write failing test**
- 김(金), 이(李), 최(崔) 동일 조건으로 `recommendNames` 호출
- 각 top10 출력 + 교집합 비율 계산
- pairwise overlap <= 0.60 assert
- 후보 점수 디버그 출력(base/surname/balance/pron/final)

**Step 2: Run test to verify RED**
- Run: `npm run test:engine:sensitivity`
- Expected: FAIL (현재 성씨 영향 약함)

### Task 4: GREEN - recommend pipeline에 surname scoring + surname-aware beam 적용

**Files:**
- Modify: `/Users/JINUKSOUNG/Desktop/jinuk/name/packages/name-engine/src/engine/recommend.ts`

**Step 1: Final score update**
- `baseNameScore`, `surnameSynergyScore`, `surnamePronunciationFlowScore`, `balance3Score` 계산
- `final = base*0.55 + synergy*0.30 + pron*0.10 + balance*0.05` 적용
- component scores/reasons 저장

**Step 2: Candidate pruning update**
- first reading beam: surname partial 반영한 topK 유지
- second reading beam: surname-aware partial 반영한 topK 유지

**Step 3: Diagnostics**
- `SURNAME_DIAGNOSTICS=1`에서 candidate component 로그 출력

**Step 4: Run sensitivity test**
- Run: `npm run test:engine:sensitivity`
- Expected: PASS

### Task 5: Scripts and verification

**Files:**
- Modify: `/Users/JINUKSOUNG/Desktop/jinuk/name/packages/name-engine/package.json`
- Modify: `/Users/JINUKSOUNG/Desktop/jinuk/name/package.json`

**Step 1: Add scripts**
- `test:surname`, `test:sensitivity`
- root wrapper scripts 추가

**Step 2: Full verification**
- Run: `npm run test:engine:surname`
- Run: `npm run test:engine:sensitivity`
- Run: `npm run test:engine:prior`
- Run: `npm run typecheck:toss`
- Run: `npm run typecheck:web`

**Step 3: Report evidence**
- top10 목록, 교집합 비율, component 로그 요약 제공
