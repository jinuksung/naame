import assert from "node:assert/strict";
import { buildApiPath, markHanjaAsNotInmyong } from "./api";

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
  const originalNodeEnv = env.NODE_ENV;
  env.NEXT_PUBLIC_NAMEFIT_API_BASE_URL = "https://api.namefit.example/";
  env.NODE_ENV = "production";
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
    if (originalNodeEnv === undefined) {
      delete env.NODE_ENV;
    } else {
      env.NODE_ENV = originalNodeEnv;
    }
  }
}

function testUsesSameOriginPathInDevelopmentEvenWhenBaseUrlExists(): void {
  const env = process.env as Record<string, string | undefined>;
  const original = env.NEXT_PUBLIC_NAMEFIT_API_BASE_URL;
  const originalNodeEnv = env.NODE_ENV;
  env.NEXT_PUBLIC_NAMEFIT_API_BASE_URL = "https://api.namefit.example/";
  env.NODE_ENV = "development";
  try {
    assert.equal(
      buildApiPath("/api/recommend/free"),
      "/api/recommend/free",
      "development 환경에서는 same-origin 경로를 사용해야 합니다.",
    );
  } finally {
    if (original === undefined) {
      delete env.NEXT_PUBLIC_NAMEFIT_API_BASE_URL;
    } else {
      env.NEXT_PUBLIC_NAMEFIT_API_BASE_URL = original;
    }
    if (originalNodeEnv === undefined) {
      delete env.NODE_ENV;
    } else {
      env.NODE_ENV = originalNodeEnv;
    }
  }
}

async function testLocalAdminApiDoesNotUseExternalBaseUrl(): Promise<void> {
  const env = process.env as Record<string, string | undefined>;
  const original = env.NEXT_PUBLIC_NAMEFIT_API_BASE_URL;
  env.NEXT_PUBLIC_NAMEFIT_API_BASE_URL = "https://naametoss.vercel.app";

  const originalFetch = globalThis.fetch;
  let calledUrl = "";
  globalThis.fetch = (async (input: RequestInfo | URL): Promise<Response> => {
    calledUrl = String(input);
    return new Response("{}", { status: 200 });
  }) as typeof fetch;

  try {
    await markHanjaAsNotInmyong("智");
    assert.equal(
      calledUrl,
      "/api/admin/local/hanja/not-inmyong",
      "로컬 전용 admin API는 외부 base url이 아니라 same-origin 상대 경로를 사용해야 합니다.",
    );
  } finally {
    globalThis.fetch = originalFetch;
    if (original === undefined) {
      delete env.NEXT_PUBLIC_NAMEFIT_API_BASE_URL;
    } else {
      env.NEXT_PUBLIC_NAMEFIT_API_BASE_URL = original;
    }
  }
}

async function run(): Promise<void> {
  testReturnsRelativePathWhenBaseUrlMissing();
  testPrependsBaseUrlWhenProvided();
  testUsesSameOriginPathInDevelopmentEvenWhenBaseUrlExists();
  await testLocalAdminApiDoesNotUseExternalBaseUrl();
  console.log("[test:api-base-url:toss] all tests passed");
}

void run();
