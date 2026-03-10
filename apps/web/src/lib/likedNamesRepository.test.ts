import assert from "node:assert/strict";
import {
  createLikedNamesRepository,
  LikedNameEntry
} from "./likedNamesRepository";

class MemoryStorage implements Storage {
  private map = new Map<string, string>();

  get length(): number {
    return this.map.size;
  }

  clear(): void {
    this.map.clear();
  }

  getItem(key: string): string | null {
    return this.map.has(key) ? this.map.get(key) ?? null : null;
  }

  key(index: number): string | null {
    return Array.from(this.map.keys())[index] ?? null;
  }

  removeItem(key: string): void {
    this.map.delete(key);
  }

  setItem(key: string, value: string): void {
    this.map.set(key, value);
  }
}

function buildSampleEntry(id: string, createdAt: string): LikedNameEntry {
  return {
    id,
    fullName: "김지안",
    nameHangul: "지안",
    surnameHangul: "김",
    surnameHanja: "金",
    gender: "UNISEX",
    hanjaPair: ["智", "安"],
    readingPair: ["지", "안"],
    score: 91,
    reason: "이름 흐름이 안정적이에요.",
    createdAt,
    source: "FREE"
  };
}

function testRepositorySupportsUpsertAndDeduplication(): void {
  const storage = new MemoryStorage();
  const repository = createLikedNamesRepository({
    storage,
    storageKey: "liked-names-test"
  });
  const first = buildSampleEntry("kim-unisex-jian", "2026-03-09T00:00:00.000Z");
  const second = {
    ...first,
    reason: "업데이트된 추천 이유",
    createdAt: "2026-03-10T00:00:00.000Z"
  };

  repository.upsert(first);
  repository.upsert(second);

  const all = repository.getAll();
  assert.equal(all.length, 1);
  assert.equal(all[0]?.reason, "업데이트된 추천 이유");
  assert.equal(repository.exists(first.id), true);
}

function testRepositorySupportsRemoveAndClear(): void {
  const storage = new MemoryStorage();
  const repository = createLikedNamesRepository({
    storage,
    storageKey: "liked-names-test"
  });
  const first = buildSampleEntry("first", "2026-03-09T00:00:00.000Z");
  const second = buildSampleEntry("second", "2026-03-10T00:00:00.000Z");

  repository.upsert(first);
  repository.upsert(second);
  repository.remove(first.id);
  assert.deepEqual(
    repository.getAll().map((item) => item.id),
    ["second"]
  );

  repository.clear();
  assert.deepEqual(repository.getAll(), []);
}

function testRepositoryReturnsEmptyListForCorruptedStorage(): void {
  const storage = new MemoryStorage();
  storage.setItem("liked-names-test", "{broken json");
  const repository = createLikedNamesRepository({
    storage,
    storageKey: "liked-names-test"
  });
  const originalConsoleError = console.error;
  console.error = () => undefined;
  try {
    assert.deepEqual(repository.getAll(), []);
  } finally {
    console.error = originalConsoleError;
  }
}

function testRepositoryFallsBackToSessionStorageWhenLocalStorageIsBlocked(): void {
  const previousWindow = (globalThis as { window?: Window }).window;
  const sessionStorage = new MemoryStorage();
  const localStorage = {
    getItem(): string | null {
      throw new Error("blocked");
    },
    setItem(): void {
      throw new Error("blocked");
    },
    removeItem(): void {
      throw new Error("blocked");
    },
    key(): string | null {
      return null;
    },
    clear(): void {
      throw new Error("blocked");
    },
    get length(): number {
      return 0;
    }
  } as Storage;

  try {
    (globalThis as { window?: Window }).window = {
      localStorage,
      sessionStorage
    } as unknown as Window;
    const repository = createLikedNamesRepository({
      storageKey: "liked-names-fallback-test"
    });
    const entry = buildSampleEntry("fallback-id", "2026-03-10T00:00:00.000Z");

    repository.upsert(entry);
    const raw = sessionStorage.getItem("liked-names-fallback-test");
    assert.notEqual(raw, null);
    assert.equal(repository.exists("fallback-id"), true);
  } finally {
    if (previousWindow === undefined) {
      delete (globalThis as { window?: Window }).window;
    } else {
      (globalThis as { window?: Window }).window = previousWindow;
    }
  }
}

function run(): void {
  testRepositorySupportsUpsertAndDeduplication();
  testRepositorySupportsRemoveAndClear();
  testRepositoryReturnsEmptyListForCorruptedStorage();
  testRepositoryFallsBackToSessionStorageWhenLocalStorageIsBlocked();
  console.log("[test:liked-names-repository:web] all tests passed");
}

run();
