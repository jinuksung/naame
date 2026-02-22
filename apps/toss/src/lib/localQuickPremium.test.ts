import assert from "node:assert/strict";
import {
  buildLocalQuickPremiumPayload,
  resolvePremiumLoadingPath,
} from "./localQuickPremium";

function testResolvePremiumLoadingPath(): void {
  assert.equal(resolvePremiumLoadingPath("/premium/result"), "/premium/loading");
  assert.equal(resolvePremiumLoadingPath("/premium/result/"), "/premium/loading");
  assert.equal(resolvePremiumLoadingPath("/feature/premium/result"), "/feature/premium/loading");
}

function testBuildLocalQuickPremiumPayloadIncludesExploreSeed(): void {
  const payload = buildLocalQuickPremiumPayload(() => 0);
  assert.equal(typeof payload.input.exploreSeed, "number");
  assert.equal(Number.isInteger(payload.input.exploreSeed), true);
  assert.ok((payload.input.exploreSeed ?? 0) > 0);
}

function testBuildLocalQuickPremiumPayloadUsesExpandedSurnamePresets(): void {
  const payload = buildLocalQuickPremiumPayload(() => 0.999999);
  const legacySurnames = new Set(["김", "이", "박", "최", "정"]);
  assert.equal(legacySurnames.has(payload.surnameHangul), false);
}

function run(): void {
  testResolvePremiumLoadingPath();
  testBuildLocalQuickPremiumPayloadIncludesExploreSeed();
  testBuildLocalQuickPremiumPayloadUsesExpandedSurnamePresets();
  console.log("[test:local-quick-premium:toss] all tests passed");
}

run();
