import assert from "node:assert/strict";
import {
  QUICK_SURNAME_PRESETS,
  buildQuickExploreSeed,
  buildQuickSurnameCandidates,
  isQuickComboEnabled,
  pickPreferredSurnameHanja,
} from "./quickCombo";

function testBuildQuickSurnameCandidatesPrioritizesCurrent(): void {
  const list = buildQuickSurnameCandidates("윤", ["김", "이", "윤", "박"], 4);
  assert.deepEqual(list, ["윤", "김", "이", "박"]);
}

function testBuildQuickSurnameCandidatesFallsBackToPresets(): void {
  const list = buildQuickSurnameCandidates(" ", QUICK_SURNAME_PRESETS, 3);
  assert.deepEqual(list, QUICK_SURNAME_PRESETS.slice(0, 3));
}

function testPickPreferredSurnameHanjaUsesAutoSelected(): void {
  const picked = pickPreferredSurnameHanja({
    autoSelectedHanja: "金",
    options: [{ hanja: "金", isDefault: false, popularityRank: 2 }],
  });
  assert.equal(picked, "金");
}

function testPickPreferredSurnameHanjaFallsBackToFirstOption(): void {
  const picked = pickPreferredSurnameHanja({
    autoSelectedHanja: null,
    options: [{ hanja: "李", isDefault: true, popularityRank: 1 }],
  });
  assert.equal(picked, "李");
}

function testIsQuickComboEnabledByNodeEnv(): void {
  const env = process.env as Record<string, string | undefined>;
  const original = process.env.NODE_ENV;
  try {
    env.NODE_ENV = "development";
    assert.equal(isQuickComboEnabled(), true);
    env.NODE_ENV = "production";
    assert.equal(isQuickComboEnabled(), false);
  } finally {
    if (original === undefined) {
      delete env.NODE_ENV;
    } else {
      env.NODE_ENV = original;
    }
  }
}

function testBuildQuickExploreSeedUsesClickCounter(): void {
  const nowMs = 1735707600000;
  const first = buildQuickExploreSeed(1, nowMs);
  const second = buildQuickExploreSeed(2, nowMs);
  const secondAgain = buildQuickExploreSeed(2, nowMs);

  assert.ok(Number.isInteger(first) && first > 0);
  assert.ok(Number.isInteger(second) && second > 0);
  assert.notEqual(first, second);
  assert.equal(second, secondAgain);
}

function run(): void {
  testBuildQuickSurnameCandidatesPrioritizesCurrent();
  testBuildQuickSurnameCandidatesFallsBackToPresets();
  testPickPreferredSurnameHanjaUsesAutoSelected();
  testPickPreferredSurnameHanjaFallsBackToFirstOption();
  testIsQuickComboEnabledByNodeEnv();
  testBuildQuickExploreSeedUsesClickCounter();
  console.log("[test:quick-combo] all tests passed");
}

run();
