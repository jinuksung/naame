import assert from "node:assert/strict";
import { resolvePremiumLoadingPath } from "./localQuickPremium";

function testResolvePremiumLoadingPath(): void {
  assert.equal(resolvePremiumLoadingPath("/premium/result"), "/premium/loading");
  assert.equal(resolvePremiumLoadingPath("/premium/result/"), "/premium/loading");
  assert.equal(resolvePremiumLoadingPath("/feature/premium/result"), "/feature/premium/loading");
}

function run(): void {
  testResolvePremiumLoadingPath();
  console.log("[test:local-quick-premium:toss] all tests passed");
}

run();
