import assert from "node:assert/strict";
import { buildApiPath } from "./api";

function testReturnsRelativePathWhenBaseUrlMissing(): void {
  const env = process.env as Record<string, string | undefined>;
  const original = env.NEXT_PUBLIC_NAMEFIT_API_BASE_URL;
  delete env.NEXT_PUBLIC_NAMEFIT_API_BASE_URL;
  try {
    assert.equal(buildApiPath("/api/recommend/free"), "/api/recommend/free");
  } finally {
    if (original === undefined) {
      delete env.NEXT_PUBLIC_NAMEFIT_API_BASE_URL;
    } else {
      env.NEXT_PUBLIC_NAMEFIT_API_BASE_URL = original;
    }
  }
}

function testPrependsBaseUrlWhenProvided(): void {
  const env = process.env as Record<string, string | undefined>;
  const original = env.NEXT_PUBLIC_NAMEFIT_API_BASE_URL;
  env.NEXT_PUBLIC_NAMEFIT_API_BASE_URL = "https://api.namefit.example/";
  try {
    assert.equal(
      buildApiPath("/api/recommend/free"),
      "https://api.namefit.example/api/recommend/free",
    );
  } finally {
    if (original === undefined) {
      delete env.NEXT_PUBLIC_NAMEFIT_API_BASE_URL;
    } else {
      env.NEXT_PUBLIC_NAMEFIT_API_BASE_URL = original;
    }
  }
}

function run(): void {
  testReturnsRelativePathWhenBaseUrlMissing();
  testPrependsBaseUrlWhenProvided();
  console.log("[test:api-base-url:toss] all tests passed");
}

run();
