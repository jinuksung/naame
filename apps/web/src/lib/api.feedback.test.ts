import assert from "node:assert/strict";
import { submitNameFeedback } from "./api";

const SAMPLE_INPUT = {
  surnameHangul: "김",
  surnameHanja: "金",
  nameHangul: "지안",
  hanjaPair: ["智", "安"] as [string, string],
  vote: "like" as const,
};

type FetchLike = typeof fetch;

function mockResponse(status: number, body: string): Response {
  return new Response(body, {
    status,
    headers: {
      "Content-Type": "application/json",
    },
  });
}

async function withMockedFetch(fn: FetchLike): Promise<void> {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = fn;
  try {
    await submitNameFeedback(SAMPLE_INPUT);
  } finally {
    globalThis.fetch = originalFetch;
  }
}

async function testIgnoresDisabledBackendResponse(): Promise<void> {
  await withMockedFetch(async () =>
    mockResponse(503, JSON.stringify({ error: "Feedback backend is not configured" })),
  );
}

async function testThrowsOnOtherServerErrors(): Promise<void> {
  let threw = false;

  try {
    await withMockedFetch(async () => mockResponse(500, "internal"));
  } catch (error) {
    threw = true;
    assert.equal(
      (error as Error).message.includes("[api] feedback submit failed: 500"),
      true,
      "503 이외 서버 오류는 예외를 던져야 합니다.",
    );
  }

  assert.equal(threw, true, "500 응답에서는 submitNameFeedback이 실패해야 합니다.");
}

async function run(): Promise<void> {
  await testIgnoresDisabledBackendResponse();
  await testThrowsOnOtherServerErrors();
  console.log("[test:api-feedback:web] all tests passed");
}

void run();
