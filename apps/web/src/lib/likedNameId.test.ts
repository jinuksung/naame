import assert from "node:assert/strict";
import { buildLikedNameId } from "./likedNameId";

function testBuildLikedNameIdIsStableForSameInput(): void {
  const first = buildLikedNameId({
    surnameHanja: "金",
    gender: "MALE",
    nameHangul: "지안",
    hanjaPair: ["智", "安"]
  });
  const second = buildLikedNameId({
    surnameHanja: "金",
    gender: "MALE",
    nameHangul: "지안",
    hanjaPair: ["智", "安"]
  });

  assert.equal(first, second);
}

function testBuildLikedNameIdChangesWhenIdentityChanges(): void {
  const male = buildLikedNameId({
    surnameHanja: "金",
    gender: "MALE",
    nameHangul: "지안",
    hanjaPair: ["智", "安"]
  });
  const female = buildLikedNameId({
    surnameHanja: "金",
    gender: "FEMALE",
    nameHangul: "지안",
    hanjaPair: ["智", "安"]
  });

  assert.notEqual(male, female);
}

function testBuildLikedNameIdNormalizesWhitespaceAndUnicode(): void {
  const compact = buildLikedNameId({
    surnameHanja: "金",
    gender: "UNISEX",
    nameHangul: "지안",
    hanjaPair: ["智", "安"]
  });
  const expanded = buildLikedNameId({
    surnameHanja: " 金 ",
    gender: "UNISEX",
    nameHangul: " 지안 ",
    hanjaPair: ["智", "安"]
  });

  assert.equal(compact, expanded);
}

function run(): void {
  testBuildLikedNameIdIsStableForSameInput();
  testBuildLikedNameIdChangesWhenIdentityChanges();
  testBuildLikedNameIdNormalizesWhitespaceAndUnicode();
  console.log("[test:liked-name-id:web] all tests passed");
}

run();
