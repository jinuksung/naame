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
