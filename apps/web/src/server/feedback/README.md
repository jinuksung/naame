# Supabase Feedback Setup

## 1) SQL 실행
- Supabase SQL Editor에서 `supabase.schema.sql` 내용을 실행합니다.

## 2) Vercel 환경변수
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`

두 값은 `@namefit/web` 프로젝트의 Production/Preview에 설정합니다.

## 3) 동작
- 결과 페이지에서 이름별 `좋아요/싫어요`를 클릭하면 `POST /api/feedback/name` 호출
- 서버는 `record_name_feedback_vote` RPC로 집계
- 추천 API(`POST /api/recommend/free`)는 `get_name_feedback_stats` RPC를 읽어 점수를 소폭 가중치 반영

## 4) 반영 정책(현재)
- 표본이 너무 적으면(2 미만) 가중치 미적용
- 좋아요/싫어요 순증감에 따라 최대 ±8점 범위에서만 조정
- 조정 후 점수 동률이면 기존 순서를 유지
