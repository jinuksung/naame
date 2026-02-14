# 희소하고 세련된 이름 풀 생성기 Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 단일 입력 JSON에서 남/여 각각 400개 이상 추천 이름 풀(JSON)과 디버그 리포트(Markdown)를 생성하는 TypeScript CLI를 구현한다.

**Architecture:** 생성 파이프라인을 `load -> syllables -> generate -> filter -> score -> diversify -> write`로 분리하고, Tier A/B/C를 공통 엔진에서 점수화한 뒤 성별별로 다양성 제한을 적용해 최종 결과를 출력한다. 테스트는 스크립트형 `assert` 기반으로 핵심 품질 조건(반복 음절 0, 400개 이상, 편중 제한)을 고정한다.

**Tech Stack:** TypeScript, Node.js(fs/path), ts-node(assert test runner)

---

### Task 1: 타입/입력 로더 골격

**Files:**
- Create: `src/types.ts`
- Create: `src/core/load.ts`

**Step 1: Write the failing test**
- `src/tests/namePoolGenerator.test.ts`에 입력 로더가 `items`를 읽고 성별/음절 길이 카운트를 반환하는 기대값 작성

**Step 2: Run test to verify it fails**
- Run: `npx ts-node -P tsconfig.scripts.json src/tests/namePoolGenerator.test.ts`
- Expected: FAIL (모듈/함수 미구현)

**Step 3: Write minimal implementation**
- 입력 스키마/타입 가드
- 한글 1~3글자 필터 및 원본 이름 집합 구성

**Step 4: Run test to verify it passes**
- 같은 명령 재실행, 해당 검증 통과

### Task 2: 음절 통계/후보 생성/하드 필터

**Files:**
- Create: `src/core/syllables.ts`
- Create: `src/core/generate.ts`
- Create: `src/core/filter.ts`

**Step 1: Write the failing test**
- AA 반복 제거, blacklist 제거, 2음절 분해 통계 검증 추가

**Step 2: Run test to verify it fails**
- Run: `npx ts-node -P tsconfig.scripts.json src/tests/namePoolGenerator.test.ts`
- Expected: FAIL (필터/통계 미구현)

**Step 3: Write minimal implementation**
- 성별별 start/end/all 빈도, top set, 공통 set 계산
- Tier A/B/C 후보 생성
- 하드 필터(반복, blacklist, 문자셋) 적용

**Step 4: Run test to verify it passes**
- 같은 명령 재실행

### Task 3: 점수/다양성/최종 선택

**Files:**
- Create: `src/core/score.ts`
- Create: `src/core/diversify.ts`

**Step 1: Write the failing test**
- 남/여 각각 최소 400개, 상위 50개 편중 제한, score breakdown 존재 검증 추가

**Step 2: Run test to verify it fails**
- Run: `npx ts-node -P tsconfig.scripts.json src/tests/namePoolGenerator.test.ts`
- Expected: FAIL (점수/선택 미구현)

**Step 3: Write minimal implementation**
- `total = base + style + stability + genderFit`
- tier 보너스, common set 패널티, 중간 빈도 보너스, 종성 충돌 패널티
- 시작/끝 음절 개수 제한으로 다양성 채우기

**Step 4: Run test to verify it passes**
- 같은 명령 재실행

### Task 4: CLI/출력/리포트

**Files:**
- Create: `src/core/write.ts`
- Create: `src/cli.ts`

**Step 1: Write the failing test**
- 샘플 실행 시 출력 파일 3개 생성 및 구조 검증 추가

**Step 2: Run test to verify it fails**
- Run: `npx ts-node -P tsconfig.scripts.json src/tests/namePoolGenerator.test.ts`
- Expected: FAIL (CLI/쓰기 미구현)

**Step 3: Write minimal implementation**
- CLI 인자 파싱(`--input`, `--out`)
- JSON 2개/Markdown 1개 저장
- report에 top syllable, 필터 집계, tier 분포, top 30, 다양성 통계 기록

**Step 4: Run test to verify it passes**
- 같은 명령 재실행

### Task 5: 빌드/실행 스크립트 및 최종 검증

**Files:**
- Modify: `package.json`
- Modify: `tsconfig.json`

**Step 1: Build command wiring**
- `build: tsc -p tsconfig.json`
- `start: node dist/cli.js --input /tmp/names_repo_check/data/data.json --out out`

**Step 2: Full verification**
- Run: `npm run build`
- Run: `node dist/cli.js --input birth_registered_names_gender.json --out out`
- Run: `npx ts-node -P tsconfig.scripts.json src/tests/namePoolGenerator.test.ts`

**Step 3: Check outputs**
- `out/name_pool_M.json`, `out/name_pool_F.json`, `out/report.md` 존재/구조/개수 확인
