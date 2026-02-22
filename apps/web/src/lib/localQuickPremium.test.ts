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
  const legacySurnameHanja = new Set(["金", "李", "朴", "崔", "鄭"]);
  assert.equal(legacySurnameHanja.has(payload.input.surnameHanja), false);
}

function run(): void {
  testResolvePremiumLoadingPath();
  testBuildLocalQuickPremiumPayloadIncludesExploreSeed();
  testBuildLocalQuickPremiumPayloadUsesExpandedSurnamePresets();
  console.log("[test:local-quick-premium:web] all tests passed");
}

run();
