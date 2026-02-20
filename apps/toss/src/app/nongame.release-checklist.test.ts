import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";

const APP_PAGE_PATH = path.resolve(__dirname, "page.tsx");
const LOADING_PAGE_PATH = path.resolve(__dirname, "loading", "page.tsx");
const GLOBAL_STYLE_PATH = path.resolve(__dirname, "globals.css");
const STORE_PATH = path.resolve(__dirname, "..", "store", "useRecommendStore.ts");
const SOURCE_ROOT = path.resolve(__dirname, "..");

const SOURCE_EXTENSIONS = new Set([".ts", ".tsx", ".css"]);

function collectSourceFiles(dirPath: string): string[] {
  const entries = readdirSync(dirPath, { withFileTypes: true });
  const filePaths: string[] = [];

  for (const entry of entries) {
    const nextPath = path.join(dirPath, entry.name);
    if (entry.isDirectory()) {
      filePaths.push(...collectSourceFiles(nextPath));
      continue;
    }

    if (!entry.isFile()) {
      continue;
    }

    if (entry.name.endsWith(".test.ts") || entry.name.endsWith(".test.tsx")) {
      continue;
    }

    if (SOURCE_EXTENSIONS.has(path.extname(entry.name))) {
      filePaths.push(nextPath);
    }
  }

  return filePaths;
}

function readAllSourceFiles(): Array<{ filePath: string; source: string }> {
  return collectSourceFiles(SOURCE_ROOT).map((filePath) => ({
    filePath,
    source: readFileSync(filePath, "utf8"),
  }));
}

function testNoPrivateDeepLinksInAppSource(): void {
  const offenders = readAllSourceFiles()
    .filter(({ source }) => source.includes("intoss-private://"))
    .map(({ filePath }) => filePath);

  assert.deepEqual(
    offenders,
    [],
    "앱 소스에 intoss-private:// 링크를 직접 노출하면 안 됩니다.",
  );
}

function testNoInstallPromptOrStoreSchemeInAppSource(): void {
  const disallowedPatterns = ["앱 설치", "itms-apps://", "market://", "play.google.com/store/apps"];
  const offenders = readAllSourceFiles()
    .filter(({ source }) => disallowedPatterns.some((pattern) => source.includes(pattern)))
    .map(({ filePath }) => filePath);

  assert.deepEqual(
    offenders,
    [],
    "앱 소스에 외부 앱 설치 유도 문구/스토어 스킴이 포함되면 안 됩니다.",
  );
}

function testNoAutomaticBottomSheetInvocation(): void {
  const disallowedPatterns = [
    "openBottomSheet(",
    "showBottomSheet(",
    "bottomSheet.open(",
    "bottomsheet.open(",
  ];
  const offenders = readAllSourceFiles()
    .filter(({ source }) => disallowedPatterns.some((pattern) => source.includes(pattern)))
    .map(({ filePath }) => filePath);

  assert.deepEqual(
    offenders,
    [],
    "앱 진입 시 바텀시트 자동 노출 로직이 없어야 합니다.",
  );
}

function testInputSubmitIsDisabledUntilRequiredFieldsAreFilled(): void {
  const source = readFileSync(APP_PAGE_PATH, "utf8");
  assert.equal(
    source.includes("const isSubmitDisabled = useMemo"),
    true,
    "입력 페이지는 버튼 활성 상태를 계산하는 로직이 있어야 합니다.",
  );
  assert.equal(
    source.includes("!surnameHangul.trim() || !surnameHanja.trim()"),
    true,
    "필수값(성 음/한자)이 비어 있으면 제출 버튼이 비활성화되어야 합니다.",
  );
  assert.equal(
    source.includes('<TdsPrimaryButton type="submit" disabled={isSubmitDisabled}>'),
    true,
    "입력 완료 버튼은 필수값 미입력 시 비활성화되어야 합니다.",
  );
}

function testLightModeIsForced(): void {
  const source = readFileSync(GLOBAL_STYLE_PATH, "utf8");
  assert.equal(
    source.includes("color-scheme: light"),
    true,
    "비게임 가이드에 맞게 앱은 라이트 모드로 고정되어야 합니다.",
  );
}

function testInputStatePersistsInSessionScope(): void {
  const source = readFileSync(STORE_PATH, "utf8");
  assert.equal(
    source.includes("window.sessionStorage"),
    true,
    "뒤로가기/재진입 시 입력값 복구를 위해 sessionStorage를 사용해야 합니다.",
  );
}

function testLoadingExperienceExistsForSlowResponse(): void {
  const source = readFileSync(LOADING_PAGE_PATH, "utf8");
  assert.equal(
    source.includes("const MIN_LOADING_MS = 1700"),
    true,
    "응답 지연 시 로딩 화면을 유지하는 최소 시간 설정이 필요합니다.",
  );
  assert.equal(
    source.includes("LOADING_MESSAGES"),
    true,
    "로딩 중 사용자 안내 문구가 있어야 합니다.",
  );
}

function run(): void {
  testNoPrivateDeepLinksInAppSource();
  testNoInstallPromptOrStoreSchemeInAppSource();
  testNoAutomaticBottomSheetInvocation();
  testInputSubmitIsDisabledUntilRequiredFieldsAreFilled();
  testLightModeIsForced();
  testInputStatePersistsInSessionScope();
  testLoadingExperienceExistsForSlowResponse();
  console.log("[test:nongame-release-checklist:toss] all tests passed");
}

run();
