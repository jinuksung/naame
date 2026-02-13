# SEO 랜딩 운영 메모

## 상위 성씨 리스트 갱신
- 파일: `apps/web/src/seo/seoConfig.ts`
- `TOP_SURNAMES` 배열을 수정하면 아래 항목이 함께 갱신됩니다.
  - `/surname/[surname]` 사전 생성 경로
  - `/combo/[surname]/[gender]` 사전 생성 경로
  - `/seo` 허브 성씨 링크
  - `/sitemap.xml` 동적 URL 목록
- 상위 성씨 외 요청은 동적 렌더링되며, 메타데이터에서 `noindex`가 적용됩니다.

## 메타데이터 규칙
- 공용 헬퍼: `apps/web/src/seo/buildMeta.ts`
- 개별 페이지 `generateMetadata`에서 `title`, `description`, `pathname`, `noIndex`를 전달합니다.
- canonical/OG/twitter/robots는 공용 헬퍼에서 통일합니다.

## FAQ JSON-LD
- 컴포넌트: `apps/web/src/seo/faqJsonLd.tsx`
- 페이지에서는 `FaqSection` 컴포넌트를 사용하면 FAQ 본문과 JSON-LD가 동시에 렌더링됩니다.

## 샘플 이름 데이터
- 데이터 파일: `apps/web/src/data/name_pool_M.json`, `apps/web/src/data/name_pool_F.json`
- 샘플 선택 로직: `apps/web/src/seo/sampleNames.ts`
- `Math.random` 대신 seed 기반 셔플을 사용해 URL별 샘플이 고정됩니다.

## 검증 커맨드
- `npx ts-node -P apps/web/tsconfig.scripts.json apps/web/src/seo/seoUtils.test.ts`
- `npm run lint --workspace @namefit/web`
- `npm run typecheck --workspace @namefit/web`
- `npm run build --workspace @namefit/web`
