import assert from "node:assert/strict";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { shouldBlockFinalResultName } from "./finalResultSsotFilters";

function withPatchedEnv<T>(patch: Record<string, string | undefined>, run: () => T): T {
  const backup = new Map<string, string | undefined>();
  for (const [key, value] of Object.entries(patch)) {
    backup.set(key, process.env[key]);
    if (value === undefined) {
      delete process.env[key];
    } else {
      process.env[key] = value;
    }
  }
  try {
    return run();
  } finally {
    for (const [key, value] of backup.entries()) {
      if (value === undefined) {
        delete process.env[key];
      } else {
        process.env[key] = value;
      }
    }
  }
}

function writeJsonl(path: string, rows: unknown[]): void {
  writeFileSync(path, rows.map((row) => JSON.stringify(row)).join("\n") + "\n", "utf8");
}

function run(): void {
  const tempDir = mkdtempSync(join(tmpdir(), "namefit-final-ssot-filters-"));
  const blacklistWordsPath = join(tempDir, "blacklist_words.jsonl");
  const blacklistInitialsPath = join(tempDir, "blacklist_initials.jsonl");
  const nameBlockRulesPath = join(tempDir, "name_block_syllable_rules.jsonl");
  const positionRulesPath = join(tempDir, "name_pool_syllable_position_rules.jsonl");

  try {
    writeJsonl(blacklistWordsPath, [{ pattern: "가지" }]);
    writeJsonl(blacklistInitialsPath, [{ pattern: "ㅂㅅ" }]);
    writeJsonl(nameBlockRulesPath, [{ enabled: true, s1_has_jong: true, s2_has_jong: false }]);
    writeJsonl(positionRulesPath, [
      {
        enabled: true,
        syllable: "린",
        gender: "ALL",
        blockedPosition: "START",
        tierScope: "NON_A",
      },
    ]);

    withPatchedEnv(
      {
        BLACKLIST_WORDS_PATH: blacklistWordsPath,
        BLACKLIST_INITIALS_PATH: blacklistInitialsPath,
        NAME_BLOCK_SYLLABLE_RULES_PATH: nameBlockRulesPath,
        NAME_POOL_SYLLABLE_POSITION_RULES_PATH: positionRulesPath,
      },
      () => {
        const byWord = shouldBlockFinalResultName({
          nameHangul: "가지",
          requestGender: "ANY",
          poolTier: "None",
        });
        assert.equal(byWord.blocked, true);
        assert.equal(byWord.reason, "blacklist_word");

        const byInitials = shouldBlockFinalResultName({
          nameHangul: "방석",
          requestGender: "ANY",
          poolTier: "None",
        });
        assert.equal(byInitials.blocked, true);
        assert.equal(byInitials.reason, "blacklist_initials");

        const bySyllableRule = shouldBlockFinalResultName({
          nameHangul: "준아",
          requestGender: "ANY",
          poolTier: "None",
        });
        assert.equal(bySyllableRule.blocked, true);
        assert.equal(bySyllableRule.reason, "name_block_syllable_rule");

        const byPositionRule = shouldBlockFinalResultName({
          nameHangul: "린원",
          requestGender: "FEMALE",
          poolTier: "C",
        });
        assert.equal(byPositionRule.blocked, true);
        assert.equal(byPositionRule.reason, "name_pool_syllable_position_rule");

        const aTierExempt = shouldBlockFinalResultName({
          nameHangul: "린원",
          requestGender: "FEMALE",
          poolTier: "A",
        });
        assert.equal(aTierExempt.blocked, false);

        const pass = shouldBlockFinalResultName({
          nameHangul: "서윤",
          requestGender: "FEMALE",
          poolTier: "A",
        });
        assert.equal(pass.blocked, false);
      },
    );

    console.log("[test:final-result-ssot-filters] all tests passed");
  } finally {
    rmSync(tempDir, { recursive: true, force: true });
  }
}

run();
