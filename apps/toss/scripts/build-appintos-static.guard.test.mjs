import assert from "node:assert/strict";
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";

import {
  detectConflictingDevProcesses,
  assertNoConflictingDevProcesses,
  resetNextBuildDir,
} from "./build-appintos-static.mjs";

function testDetectsDevProcessesInCurrentProject() {
  const rootDir = "/Users/example/work/name/apps/toss";
  const processList = [
    "12345 node /Users/example/work/name/node_modules/.bin/granite dev",
    "12346 node /Users/example/work/name/node_modules/.bin/next dev -p 3000",
    "12347 node /Users/example/other/node_modules/.bin/next dev -p 3000",
  ].join("\n");

  const conflicts = detectConflictingDevProcesses(processList, rootDir);
  assert.equal(conflicts.length, 2, "현재 프로젝트 dev 프로세스 2개가 감지되어야 합니다.");
}

function testIgnoresUnrelatedProcesses() {
  const rootDir = "/Users/example/work/name/apps/toss";
  const processList = [
    "22345 node /Users/example/other/node_modules/.bin/granite dev",
    "22346 node /Users/example/other/node_modules/.bin/next dev -p 3000",
  ].join("\n");

  const conflicts = detectConflictingDevProcesses(processList, rootDir);
  assert.equal(conflicts.length, 0, "다른 프로젝트 프로세스는 무시되어야 합니다.");
}

function testThrowsWhenConflictExists() {
  const rootDir = "/Users/example/work/name/apps/toss";
  const processList = "32345 node /Users/example/work/name/node_modules/.bin/granite dev";

  assert.throws(
    () => assertNoConflictingDevProcesses(rootDir, () => processList),
    /Stop dev server before build:appintoss/,
    "충돌 프로세스가 있으면 빌드를 중단해야 합니다.",
  );
}

async function testResetNextBuildDirRemovesDotNext() {
  const tempRootDir = path.join(tmpdir(), `namefit-build-clean-${Date.now()}`);
  const nextDir = path.join(tempRootDir, ".next");
  const buildIdPath = path.join(nextDir, "BUILD_ID");

  try {
    mkdirSync(path.join(nextDir, "static"), { recursive: true });
    writeFileSync(buildIdPath, "dummy-build-id", "utf8");
    assert.equal(existsSync(nextDir), true, "테스트 준비 단계에서 .next가 존재해야 합니다.");

    await resetNextBuildDir(tempRootDir);
    assert.equal(
      existsSync(nextDir),
      false,
      "resetNextBuildDir 호출 후 .next 디렉터리가 제거되어야 합니다.",
    );
  } finally {
    rmSync(tempRootDir, { recursive: true, force: true });
  }
}

function testRouteSourceMapIncludesPremiumRoutes() {
  const scriptPath = new URL("./build-appintos-static.mjs", import.meta.url);
  const source = readFileSync(scriptPath, "utf8");
  assert.equal(
    source.includes('route: "/premium"'),
    true,
    "appintos 정적 빌드는 /premium 라우트를 포함해야 합니다.",
  );
  assert.equal(
    source.includes('route: "/premium/loading"'),
    true,
    "appintos 정적 빌드는 /premium/loading 라우트를 포함해야 합니다.",
  );
  assert.equal(
    source.includes('route: "/premium/result"'),
    true,
    "appintos 정적 빌드는 /premium/result 라우트를 포함해야 합니다.",
  );
  assert.equal(
    source.includes('route: "/free"'),
    true,
    "appintos 정적 빌드는 /free 라우트를 포함해야 합니다.",
  );
}

async function run() {
  testDetectsDevProcessesInCurrentProject();
  testIgnoresUnrelatedProcesses();
  testThrowsWhenConflictExists();
  testRouteSourceMapIncludesPremiumRoutes();
  await testResetNextBuildDirRemovesDotNext();
  console.log("[test:build-appintoss-guard] all tests passed");
}

void run();
