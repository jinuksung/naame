import assert from "node:assert/strict";
import { recommendFreeNames } from "./freeRecommend";

async function testBasicModePayloadWithoutBirthIsAccepted(): Promise<void> {
  const result = await recommendFreeNames({
    surnameHangul: "김",
    surnameHanja: "金",
    gender: "UNISEX",
  });

  assert.equal(
    result.ok && "source" in result ? true : result.status !== 400,
    true,
    "기본모드에서는 birth 입력 없이도 유효한 요청으로 처리되어야 합니다.",
  );
}

async function run(): Promise<void> {
  await testBasicModePayloadWithoutBirthIsAccepted();
  console.log("[test:free-recommend:basic-mode] all tests passed");
}

void run();
