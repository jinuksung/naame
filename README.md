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

빌드:

```bash
npm run build:web
npm run build:toss
```

## 배포 방식

이 레포는 `/toss` 경로 분리 방식을 적용했습니다.

- `apps/web`는 도메인 루트(`/*`)를 담당
- `apps/toss`는 `basePath: "/toss"`로 동작하여 `/toss/*`를 담당

동일 도메인에서 함께 서비스하려면 리버스 프록시 또는 Next.js Multi-Zones 방식으로 경로 라우팅이 필요합니다.

예시 개념:

- `/toss/*` 요청은 `apps/toss` 배포로 전달
- 그 외 `/*` 요청은 `apps/web` 배포로 전달

## basePath 주의사항

`apps/toss`의 `basePath`는 빌드 타임 고정값입니다.

- 현재 값: `/toss`
- 런타임에서 동적으로 변경할 수 없습니다.

## 공통 엔진 원칙

`packages/name-engine`는 다음 제약을 지킵니다.

- React/Next 의존 없음
- Node + TypeScript 기반 순수 모듈
- 두 앱이 동일 모듈을 import 해서 추천 결과를 생성
