# Supabase SSOT 운영 가이드

이 문서는 다음 파일을 Supabase를 단일 원본(SSOT)으로 운영하는 절차를 정리합니다.

- `hanname_master.jsonl`
- `surname_map.jsonl`
- `hanja_tags.jsonl`
- `blacklist_words.jsonl`
- `blacklist_initials.jsonl`
- `out/name_pool_M.json`
- `out/name_pool_F.json`
- `hanname_master_conflicts.jsonl`
- `hanname_metrics.jsonl`

## 1) 스키마 생성

Supabase SQL Editor에서 다음 파일을 실행합니다.

- `scripts/ssot/supabase.ssot.schema.sql`

파일별 물리 테이블 9개를 생성합니다.

- `public.ssot_hanname_master`
- `public.ssot_surname_map`
- `public.ssot_hanja_tags`
- `public.ssot_blacklist_words`
- `public.ssot_blacklist_initials`
- `public.ssot_name_pool_m`
- `public.ssot_name_pool_f`
- `public.ssot_hanname_master_conflicts`
- `public.ssot_hanname_metrics`

각 테이블 공통 컬럼:

- `row_index integer primary key`
- `updated_at timestamptz`

그리고 파일별 JSON 속성이 실제 컬럼으로 생성됩니다.

- `ssot_hanname_master`
  - `char, detail_url, element_pronunciation, element_resource, fetched_at, is_inmyong, meanings, radical_char, radical_label, reading_c, reading_e, reading_initials, readings, source, strokes`
- `ssot_surname_map`
  - `surname_reading, hanja, is_default, popularity_rank`
- `ssot_hanja_tags`
  - `char, created_at, evidence, risk_flags, tag_scores, tags`
- `ssot_blacklist_words`
  - `pattern`
- `ssot_blacklist_initials`
  - `pattern`
- `ssot_name_pool_m`, `ssot_name_pool_f`
  - `generated_at, input, gender, total_count, name, tier, score, score_breakdown, features`
- `ssot_hanname_master_conflicts`
  - `char, detected_at, existing, incoming`
- `ssot_hanname_metrics`
  - `char, checked_at, page, reading_level, source_url, usage_count, warnings, writing_level`

의미: JSON/JSONL 레코드 1개가 해당 파일 전용 테이블의 row 1개로 저장되며, 속성별 컬럼으로 조회/필터링할 수 있습니다.

## 2) 데이터 업로드 (로컬 -> Supabase)

필수 환경 변수:

- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`

실행:

```bash
npm run ssot:push
```

## 3) 데이터 동기화 (Supabase -> 로컬)

실행:

```bash
npm run ssot:pull
```

## 4) 런타임에서 SSOT 사용

추천 API 런타임에서 아래 플래그를 켭니다.

- `SUPABASE_SSOT_ENABLED=1`
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- (선택) `SUPABASE_SSOT_CACHE_DIR=.cache/ssot`
- (선택) `SUPABASE_SSOT_STRICT=1` (SSOT 로딩 실패 시 즉시 에러)

엔진은 시작 시 Supabase에서 파일 스냅샷을 내려받아 캐시에 저장하고, 내부 파일 경로 env를 자동 주입합니다.

## 5) 검증

```bash
npm run test:engine:ssot
```

## 6) 트러블슈팅

`npm run ssot:push` 또는 `npm run ssot:pull`에서 아래와 같은 404가 나오면:

- `Could not find the table 'public.ssot_hanname_master' in the schema cache`

원인: Supabase에 per-file 물리 테이블(현재 9개)이 아직 생성되지 않은 상태입니다.

조치: SQL Editor에서 `scripts/ssot/supabase.ssot.schema.sql`를 먼저 실행한 뒤, 다시 `npm run ssot:push`를 실행하세요.
