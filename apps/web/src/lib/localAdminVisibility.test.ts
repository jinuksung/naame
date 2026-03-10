import assert from "node:assert/strict";
import {
  isLocalAdminToolsEnabled,
  isLoopbackHostname,
} from "@namefit/engine";

function testLoopbackHostnameDetection(): void {
  assert.equal(isLoopbackHostname("localhost"), true);
  assert.equal(isLoopbackHostname("127.0.0.1"), true);
  assert.equal(isLoopbackHostname("::1"), true);
  assert.equal(isLoopbackHostname("namefit.vercel.app"), false);
}

function testLocalAdminToolsEnabledInLocalDevelopmentOnly(): void {
  assert.equal(
    isLocalAdminToolsEnabled({
      nodeEnv: "development",
      vercel: "",
      hostname: "localhost",
    }),
    true,
    "로컬 개발(host=localhost)에서는 local admin tools가 활성화되어야 합니다.",
  );

  assert.equal(
    isLocalAdminToolsEnabled({
      nodeEnv: "production",
      vercel: "",
      hostname: "localhost",
    }),
    false,
    "production 빌드에서는 로컬 admin tools가 비활성화되어야 합니다.",
  );

  assert.equal(
    isLocalAdminToolsEnabled({
      nodeEnv: "development",
      vercel: "1",
      hostname: "localhost",
    }),
    false,
    "Vercel 런타임에서는 로컬 admin tools가 비활성화되어야 합니다.",
  );

  assert.equal(
    isLocalAdminToolsEnabled({
      nodeEnv: "development",
      vercel: "",
      hostname: "namefit.apps.tossmini.com",
    }),
    false,
    "Toss 배포 도메인에서는 로컬 admin tools가 비활성화되어야 합니다.",
  );
}

function run(): void {
  testLoopbackHostnameDetection();
  testLocalAdminToolsEnabledInLocalDevelopmentOnly();
  console.log("[test:local-admin-visibility:web] all tests passed");
}

run();
