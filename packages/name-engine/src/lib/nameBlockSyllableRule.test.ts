import assert from "node:assert/strict";
import { analyzeNameBlockSyllableRule } from "./nameBlockSyllableRule";

function runTests(): void {
  const yuna = analyzeNameBlockSyllableRule("윤아");
  assert.ok(yuna, "윤아는 2음절 한글 이름으로 분석 가능해야 합니다.");
  assert.equal(yuna?.nameHangul, "윤아");
  assert.equal(yuna?.s1.jung, "ㅠ");
  assert.equal(yuna?.s1.jong, "ㄴ");
  assert.equal(yuna?.s1.hasJong, true);
  assert.equal(yuna?.s2.jung, "ㅏ");
  assert.equal(yuna?.s2.jong, null);
  assert.equal(yuna?.s2.hasJong, false);

  const boram = analyzeNameBlockSyllableRule(" 보람 ");
  assert.ok(boram, "앞뒤 공백은 무시하고 분석해야 합니다.");
  assert.equal(boram?.nameHangul, "보람");
  assert.equal(boram?.s1.jung, "ㅗ");
  assert.equal(boram?.s1.jong, null);
  assert.equal(boram?.s1.hasJong, false);
  assert.equal(boram?.s2.jung, "ㅏ");
  assert.equal(boram?.s2.jong, "ㅁ");
  assert.equal(boram?.s2.hasJong, true);

  assert.equal(
    analyzeNameBlockSyllableRule("가"),
    null,
    "1음절 이름은 패턴 룰로 저장할 수 없어야 합니다.",
  );
  assert.equal(
    analyzeNameBlockSyllableRule("A가"),
    null,
    "완성형 한글 음절이 아닌 문자가 섞이면 실패해야 합니다.",
  );

  console.log("[test:name-block-syllable-rule] all tests passed");
}

runTests();
