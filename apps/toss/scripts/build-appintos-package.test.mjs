import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function testBuildScriptAlwaysRegeneratesStaticWebBundle() {
  const packageJsonPath = path.join(__dirname, "..", "package.json");
  const packageJson = JSON.parse(readFileSync(packageJsonPath, "utf8"));
  const buildScript = String(packageJson?.scripts?.["build:appintoss"] ?? "");

  assert.equal(
    buildScript.includes("node scripts/build-appintos-static.mjs"),
    true,
    "build:appintoss는 배포 전에 dist-appintos 정적 웹 번들을 반드시 재생성해야 합니다.",
  );
  assert.equal(
    buildScript.includes("ait build"),
    true,
    "build:appintoss는 정적 번들 생성 뒤 ait build를 실행해야 합니다.",
  );
}

function run() {
  testBuildScriptAlwaysRegeneratesStaticWebBundle();
  console.log("[test:build-appintoss-package] all tests passed");
}

run();
