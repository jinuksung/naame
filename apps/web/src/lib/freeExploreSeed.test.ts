import assert from "node:assert/strict";
import { buildFreeExploreSeed } from "./freeExploreSeed";

function testBuildFreeExploreSeedReturnsPositiveInteger(): void {
  const seed = buildFreeExploreSeed({ nowMs: 1735707600000, sequence: 1 });
  assert.equal(Number.isInteger(seed), true);
  assert.ok(seed > 0);
}

function testBuildFreeExploreSeedChangesWithSequence(): void {
  const nowMs = 1735707600000;
  const first = buildFreeExploreSeed({ nowMs, sequence: 1 });
  const second = buildFreeExploreSeed({ nowMs, sequence: 2 });
  const secondAgain = buildFreeExploreSeed({ nowMs, sequence: 2 });

  assert.notEqual(first, second);
  assert.equal(second, secondAgain);
}

function testBuildFreeExploreSeedUsesAutoSequenceByDefault(): void {
  const nowMs = 1735707600000;
  const first = buildFreeExploreSeed({ nowMs });
  const second = buildFreeExploreSeed({ nowMs });
  assert.notEqual(first, second);
}

function run(): void {
  testBuildFreeExploreSeedReturnsPositiveInteger();
  testBuildFreeExploreSeedChangesWithSequence();
  testBuildFreeExploreSeedUsesAutoSequenceByDefault();
  console.log("[test:free-explore-seed:web] all tests passed");
}

run();
