# Namefit Apps in Toss Release Runbook

## 1. Console prerequisites

- Create/register the app in Apps in Toss console.
- Fix `appName` in console first. The same value must be used in `APPS_IN_TOSS_APP_NAME`.
- Register at least one `앱 내 기능` (non-game requirement).

Suggested features:

- `이름 추천받기`: `intoss://{appName}/feature/recommend`
- `결과 다시보기`: `intoss://{appName}/feature/result`

## 2. Local config

Set environment variables before running Granite:

```bash
export APPS_IN_TOSS_APP_NAME=namefit
export APPS_IN_TOSS_BRAND_ICON_URL='https://.../namefit-mark.png'
export APPS_IN_TOSS_HOST=localhost
export APPS_IN_TOSS_PORT=3000
```

Optional API server override:

```bash
export NEXT_PUBLIC_NAMEFIT_API_BASE_URL='https://api.example.com'
```

`build:appintos`는 정적 번들을 생성하므로 `NEXT_PUBLIC_NAMEFIT_API_BASE_URL`이 필수예요.
값이 없으면 빌드를 실패시켜 잘못된 배포를 막습니다.

반복 입력을 줄이려면 `apps/toss/.env.production`에 기본값을 저장해두세요.

## 3. Build and package

```bash
# Next build
npm run build --workspace @namefit/toss

# .ait artifact build
npm run build:appintos --workspace @namefit/toss
```

## 4. Upload and test

```bash
# One-off upload
npx ait deploy --api-key {API_KEY}

# or with saved token profile
npx ait token add default {API_KEY}
npx ait deploy --profile default
```

자동 입력을 쓰려면 `apps/toss/.env.local` 또는 `apps/toss/.env.production.local`에 아래를 넣고:

```bash
APPS_IN_TOSS_API_KEY=your_api_key_here
```

아래처럼 실행하면 `deploy:appintoss`가 키를 읽어서 `ait deploy --api-key ...`를 자동 실행해요:

```bash
npm run deploy:appintoss --workspace @namefit/toss
```

레거시 호환으로, `.env.local` 마지막 줄의 bare token(키=값 형식 아님)도 읽을 수 있지만
`APPS_IN_TOSS_API_KEY=` 형태를 권장합니다.

Test via console QR (`intoss-private://...`) and verify:

- deep links `/feature/recommend`, `/feature/result`
- back navigation behavior
- CORS allowlist is set for:
  - `https://<appName>.apps.tossmini.com`
  - `https://<appName>.private-apps.tossmini.com`

## 5. Policy checks before review request

- No external app install prompts
- External links only for permitted cases
- Non-game nav and UX checklist satisfied
- If AI-generated output is shown: AI usage notice + AI result labeling

## 6. Non-game checklist gate (2026-02 update)

아래 항목은 Toss 비게임 체크리스트 기준으로 배포 전 반드시 확인합니다.

Automated gates:

- 확대/축소 제스처 비활성화 (`viewport`에 `maximumScale: 1`, `userScalable: false`)
- 다크모드 비활성화 (`color-scheme: light`)
- 앱 소스 내 `intoss-private://` 직접 노출 금지
- 앱 설치 유도 문구/스토어 스킴(`itms-apps://`, `market://`) 금지
- 바텀시트 자동 노출 API 사용 금지
- 필수 입력 전 제출 버튼 비활성화
- 입력값 session scope 복원(sessionStorage)
- 응답 지연 시 로딩 안내 화면 제공

Run:

```bash
npx ts-node -P apps/toss/tsconfig.scripts.json apps/toss/src/app/page.layout.test.ts
npm run test:nongame-checklist --workspace @namefit/toss
```

Manual console/product checks:

- 네비게이션 바를 비게임 가이드(타이틀/아이콘/우측 액션 규칙)대로 설정했는지 확인
- 앱 내 기능 딥링크가 `intoss://{appName}/...`로 등록되어 있는지 확인
- 홈 인입/뒤로가기/엣지 스와이프 시 화면 전환이 자연스러운지 실기기 점검
- 로그인/결제/개인정보 처리 등 미사용 기능이 노출되지 않는지 점검
