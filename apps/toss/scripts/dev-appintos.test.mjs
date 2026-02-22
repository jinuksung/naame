import assert from "node:assert/strict";

import {
  DEFAULT_PORT,
  buildNextDevExecution,
} from "./dev-appintos.mjs";

function testUsesDefaultPortWhenArgMissing() {
  const execution = buildNextDevExecution([]);
  assert.equal(execution.port, DEFAULT_PORT);
  assert.equal(execution.args.join(" "), "dev -p 3000");
}

function testUsesProvidedPort() {
  const execution = buildNextDevExecution(["--port", "4123"]);
  assert.equal(execution.port, 4123);
  assert.equal(execution.args.join(" "), "dev -p 4123");
}

function testFallsBackToDefaultWhenPortInvalid() {
  const execution = buildNextDevExecution(["--port", "-1"]);
  assert.equal(execution.port, DEFAULT_PORT);
}

function testDoesNotForceNextDistDir() {
  const execution = buildNextDevExecution([]);
  assert.equal(
    execution.env.NEXT_DIST_DIR,
    undefined,
    "dev:appintoss는 NEXT_DIST_DIR를 강제로 주입하지 않아야 기본 .next 경로로 안정적으로 동작합니다.",
  );
}

function run() {
  testUsesDefaultPortWhenArgMissing();
  testUsesProvidedPort();
  testFallsBackToDefaultWhenPortInvalid();
  testDoesNotForceNextDistDir();
  console.log("[test:dev-appintos] all tests passed");
}

run();
