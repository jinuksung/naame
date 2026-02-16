# Namefit Split Apps

이 레포는 다음 3개 단위로 분리되어 있습니다.

- `apps/toss`: 토스 미니앱 전용 Next.js 앱
- `apps/web`: 외부 웹 전용 Next.js 앱
- `packages/name-engine`: 두 앱이 공통으로 사용하는 순수 TypeScript 추천 엔진

## 로컬 실행

사전 준비:

- Node.js 20+
- npm workspaces

실행:

```bash
npm run dev:web
npm run dev:toss
```

앱인토스(Granite) 개발 실행:

```bash
npm run dev:toss:appintos
```

빌드:

```bash
npm run build:web
npm run build:toss
```

앱인토스 `.ait` 번들 빌드:

```bash
NEXT_PUBLIC_NAMEFIT_API_BASE_URL=https://api.example.com \
npm run build:toss:appintos
```

## 배포 방식

- `apps/web`는 웹 전용 도메인(또는 루트 경로)으로 배포
- `apps/toss`는 토스 전용 도메인 루트(`/`)로 배포

동일 도메인에서 함께 서비스하려면 리버스 프록시 또는 Next.js Multi-Zones 방식으로 경로 라우팅이 필요합니다.

## 공통 엔진 원칙

`packages/name-engine`는 다음 제약을 지킵니다.

- React/Next 의존 없음
- Node + TypeScript 기반 순수 모듈
- 두 앱이 동일 모듈을 import 해서 추천 결과를 생성

## Supabase SSOT

추천 데이터 파일을 Supabase를 SSOT로 운영하려면 아래 문서를 참고하세요.

- `docs/ssot-supabase.md`
