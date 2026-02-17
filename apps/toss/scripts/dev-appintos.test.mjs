import assert from "node:assert/strict";

import {
  DEFAULT_NEXT_DIST_DIR,
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

function testInjectsGraniteDistDirEnv() {
  const execution = buildNextDevExecution([]);
  assert.equal(execution.env.NEXT_DIST_DIR, DEFAULT_NEXT_DIST_DIR);
}

function run() {
  testUsesDefaultPortWhenArgMissing();
  testUsesProvidedPort();
  testFallsBackToDefaultWhenPortInvalid();
  testInjectsGraniteDistDirEnv();
  console.log("[test:dev-appintos] all tests passed");
}

run();
