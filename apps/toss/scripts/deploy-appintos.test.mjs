import assert from "node:assert/strict";

import { resolveAitApiKey } from "./deploy-appintos.mjs";

function testUsesExplicitEnvKeyFirst() {
  const apiKey = resolveAitApiKey({
    env: {
      APPS_IN_TOSS_API_KEY: "env-key",
      AIT_API_KEY: "fallback-key",
    },
    envFileText: "APPS_IN_TOSS_API_KEY=file-key",
  });
  assert.equal(apiKey, "env-key");
}

function testUsesNamedKeyInEnvFile() {
  const apiKey = resolveAitApiKey({
    env: {},
    envFileText: [
      "NEXT_PUBLIC_SITE_URL=https://naame.vercel.app",
      "APPS_IN_TOSS_API_KEY=file-key",
    ].join("\n"),
  });
  assert.equal(apiKey, "file-key");
}

function testSupportsLegacyBareTokenLine() {
  const apiKey = resolveAitApiKey({
    env: {},
    envFileText: [
      "NEXT_PUBLIC_SITE_URL=https://naame.vercel.app",
      "",
      "this-is-a-legacy-token-line",
    ].join("\n"),
  });
  assert.equal(apiKey, "this-is-a-legacy-token-line");
}

function testReturnsEmptyWhenNoApiKey() {
  const apiKey = resolveAitApiKey({
    env: {},
    envFileText: "NEXT_PUBLIC_SITE_URL=https://naame.vercel.app",
  });
  assert.equal(apiKey, "");
}

function run() {
  testUsesExplicitEnvKeyFirst();
  testUsesNamedKeyInEnvFile();
  testSupportsLegacyBareTokenLine();
  testReturnsEmptyWhenNoApiKey();
  console.log("[test:deploy-appintoss] all tests passed");
}

run();

