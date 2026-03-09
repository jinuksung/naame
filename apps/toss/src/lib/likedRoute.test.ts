import assert from "node:assert/strict";
import { resolveLikedPath, resolveRecommendInputPath } from "./likedRoute";

function testResolveLikedPath(): void {
  assert.equal(resolveLikedPath("/feature/recommend"), "/feature/liked");
  assert.equal(resolveLikedPath("/feature/result"), "/feature/liked");
  assert.equal(resolveLikedPath("/free"), "/liked");
}

function testResolveRecommendInputPath(): void {
  assert.equal(resolveRecommendInputPath("/feature/liked"), "/feature/recommend");
  assert.equal(resolveRecommendInputPath("/liked"), "/free");
}

function run(): void {
  testResolveLikedPath();
  testResolveRecommendInputPath();
  console.log("[test:liked-route:toss] all tests passed");
}

run();
