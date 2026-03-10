# Supabase Feedback Setup

## 1) SQL 실행
- Supabase SQL Editor에서 `/Users/JINUKSOUNG/Desktop/jinuk/name/apps/web/src/server/feedback/supabase.schema.sql` 내용을 실행합니다.

## 2) Vercel 환경변수
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`

두 값은 `@namefit/toss` 프로젝트의 Production/Preview에 설정합니다.

## 3) 동작
- 결과 페이지에서 이름별 `좋아요/싫어요`를 클릭하면 `POST /api/feedback/name` 호출
- 서버는 사용자 입력 성씨(`surnameHangul`, `surnameHanja`)와 이름 조합 키로 `record_name_feedback_vote` RPC 집계
- 추천 API(`POST /api/recommend/free`)는 같은 성씨 한글(`surname_hangul`) + 이름 한글(`name_hangul`) 집계(`get_name_feedback_stats_by_hangul`)를 읽어 점수를 소폭 가중치 반영
- 찜 목록은 `GET/POST/DELETE /api/liked/names`로 서버 저장되며, 사용자 식별은 HttpOnly 쿠키 `namefit_liked_session` 기반입니다.
- 토스 웹뷰에서 Web Storage가 제한되어도 찜 기능은 서버 저장 경로로 동작합니다.

## 4) 반영 정책(현재)
- 표본이 너무 적으면(2 미만) 가중치 미적용
- 좋아요/싫어요 순증감에 따라 최대 ±8점 범위에서만 조정
- 조정 후 점수 동률이면 기존 순서를 유지
