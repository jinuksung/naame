import assert from "node:assert/strict";
import type { LikedNameEntry } from "@/lib/likedNamesRepository";
import {
  fetchServerLikedNames,
  removeServerLikedName,
  upsertServerLikedName
} from "./api";

type FetchLike = typeof fetch;

function mockResponse(status: number, body: string): Response {
  return new Response(body, {
    status,
    headers: {
      "Content-Type": "application/json"
    }
  });
}

function buildSampleEntry(id: string): LikedNameEntry {
  return {
    id,
    fullName: "김지안",
    nameHangul: "지안",
    surnameHangul: "김",
    surnameHanja: "金",
    gender: "UNISEX",
    hanjaPair: ["智", "安"],
    readingPair: ["지", "안"],
    meaningPair: ["슬기로울 지", "편안할 안"],
    score: 91,
    reason: "흐름이 안정적이에요.",
    createdAt: "2026-03-10T00:00:00.000Z",
    source: "FREE"
  };
}

async function withMockedFetch<T>(fn: FetchLike, task: () => Promise<T>): Promise<T> {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = fn;
  try {
    return await task();
  } finally {
    globalThis.fetch = originalFetch;
  }
}

async function testFetchServerLikedNamesParsesEntries(): Promise<void> {
  const sample = buildSampleEntry("liked-id-1");
  let capturedCredentials: RequestCredentials | undefined;
  const entries = await withMockedFetch(async (_input, init) => {
    capturedCredentials = init?.credentials;
    return mockResponse(200, JSON.stringify({ entries: [sample] }));
  }, () => fetchServerLikedNames());
  assert.equal(entries.length, 1);
  assert.equal(entries[0]?.id, sample.id);
  assert.equal(capturedCredentials, "include");
}

async function testUpsertServerLikedNameCallsApi(): Promise<void> {
  const sample = buildSampleEntry("liked-id-upsert");
  let called = false;
  await withMockedFetch(async (input, init) => {
    called = true;
    const url = String(input);
    assert.equal(url.includes("/api/liked/names"), true);
    assert.equal(init?.method, "POST");
    assert.equal(init?.credentials, "include");
    return mockResponse(200, JSON.stringify({ ok: true }));
  }, async () => {
    await upsertServerLikedName(sample);
  });
  assert.equal(called, true);
}

async function testRemoveServerLikedNameThrowsOnServerError(): Promise<void> {
  let threw = false;
  await withMockedFetch(async (_input, init) => {
    assert.equal(init?.method, "DELETE");
    assert.equal(init?.credentials, "include");
    return mockResponse(500, "internal");
  }, async () => {
    try {
      await removeServerLikedName("liked-id-remove");
    } catch (error) {
      threw = true;
      assert.equal(
        (error as Error).message.includes("[api] server liked remove failed: 500"),
        true
      );
    }
  });
  assert.equal(threw, true, "500 응답에서는 removeServerLikedName이 실패해야 합니다.");
}

async function testLikedApisIncludeNativeSessionHeaderWhenDeviceIdExists(): Promise<void> {
  const previousWindow = (globalThis as { window?: Window }).window;
  const sample = buildSampleEntry("liked-id-device-header");
  try {
    (globalThis as { window?: Window }).window = {
      __CONSTANT_HANDLER_MAP: {
        getDeviceId: () => "device-123"
      }
    } as unknown as Window;

    let getHeader = "";
    let postHeader = "";
    await withMockedFetch(async (_input, init) => {
      const method = init?.method ?? "GET";
      const headers = new Headers(init?.headers);
      const sessionHeader = headers.get("x-namefit-liked-session") ?? "";
      if (method === "GET") {
        getHeader = sessionHeader;
        return mockResponse(200, JSON.stringify({ entries: [] }));
      }
      postHeader = sessionHeader;
      return mockResponse(200, JSON.stringify({ ok: true }));
    }, async () => {
      await fetchServerLikedNames();
      await upsertServerLikedName(sample);
    });

    assert.equal(getHeader.length > 0, true);
    assert.equal(postHeader.length > 0, true);
  } finally {
    if (previousWindow === undefined) {
      delete (globalThis as { window?: Window }).window;
    } else {
      (globalThis as { window?: Window }).window = previousWindow;
    }
  }
}

async function run(): Promise<void> {
  await testFetchServerLikedNamesParsesEntries();
  await testUpsertServerLikedNameCallsApi();
  await testRemoveServerLikedNameThrowsOnServerError();
  await testLikedApisIncludeNativeSessionHeaderWhenDeviceIdExists();
  console.log("[test:api-liked:toss] all tests passed");
}

void run();
