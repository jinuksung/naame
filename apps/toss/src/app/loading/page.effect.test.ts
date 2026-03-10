import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";

const LOADING_PAGE_PATH = path.resolve(__dirname, "page.tsx");

function testLoadingEffectUsesStableRequestBaseInput(): void {
  const source = readFileSync(LOADING_PAGE_PATH, "utf8");

  assert.equal(
    source.includes("useMemo"),
    true,
    "무료 로딩 화면은 입력 전체 객체 의존 루프를 피하기 위해 useMemo 기반 요청 입력을 사용해야 합니다.",
  );
  assert.equal(
    source.includes("const requestBaseInput = useMemo"),
    true,
    "무료 로딩 화면에는 requestBaseInput(useMemo) 구성이 있어야 합니다.",
  );
  assert.equal(
    source.includes("const seededInput = { ...requestBaseInput, exploreSeed: buildFreeExploreSeed() };"),
    true,
    "무료 로딩 API 호출 입력은 requestBaseInput 기준으로 exploreSeed만 추가해야 합니다.",
  );
  assert.equal(
    source.includes("}, [hasHydrated, hasInput, input, router, setInput, setResults]);"),
    false,
    "무료 로딩 effect 의존성에 input 전체 객체를 직접 넣으면 무한 업데이트 루프가 발생할 수 있습니다.",
  );
}

function run(): void {
  testLoadingEffectUsesStableRequestBaseInput();
  console.log("[test:loading-effect:toss] all tests passed");
}

run();
