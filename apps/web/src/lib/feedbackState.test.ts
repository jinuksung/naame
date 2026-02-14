import assert from "node:assert/strict";
import { syncFeedbackStatus, syncFeedbackVote } from "./feedbackState";

function testStatusKeepsReferenceWhenKeysAreStable(): void {
  const prev = {
    "a:1": "idle",
    "b:2": "done",
  } as const;
  const next = syncFeedbackStatus(prev, ["a:1", "b:2"]);
  assert.equal(next, prev);
}

function testStatusPrunesRemovedKeysAndAddsNewIdleKeys(): void {
  const prev = {
    "a:1": "pending",
    "b:2": "done",
  } as const;
  const next = syncFeedbackStatus(prev, ["b:2", "c:3"]);
  assert.deepEqual(next, {
    "b:2": "done",
    "c:3": "idle",
  });
}

function testVoteKeepsReferenceWhenKeysAreStable(): void {
  const prev = {
    "a:1": "like",
    "b:2": undefined,
  } as const;
  const next = syncFeedbackVote(prev, ["a:1", "b:2"]);
  assert.equal(next, prev);
}

function testVotePrunesRemovedKeys(): void {
  const prev = {
    "a:1": "dislike",
    "b:2": undefined,
  } as const;
  const next = syncFeedbackVote(prev, ["b:2"]);
  assert.deepEqual(next, {
    "b:2": undefined,
  });
}

function run(): void {
  testStatusKeepsReferenceWhenKeysAreStable();
  testStatusPrunesRemovedKeysAndAddsNewIdleKeys();
  testVoteKeepsReferenceWhenKeysAreStable();
  testVotePrunesRemovedKeys();
  console.log("[test:feedback-state] all tests passed");
}

run();
