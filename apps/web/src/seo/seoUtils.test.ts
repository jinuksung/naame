import assert from "node:assert/strict";
import { buildSeoMetadata } from "./buildMeta";
import {
  TOP_SURNAMES,
  isIndexableSurname,
  isValidSurnameParam,
  normalizeGenderParam,
} from "./seoConfig";
import { pickDeterministicNames } from "./sampleNames";

function testSurnameValidation(): void {
  assert.equal(isValidSurnameParam("김"), true);
  assert.equal(isValidSurnameParam("남궁"), true);
  assert.equal(isValidSurnameParam("김a"), false);
  assert.equal(isValidSurnameParam(""), false);
  assert.equal(isValidSurnameParam("세글자"), false);
}

function testGenderNormalization(): void {
  assert.equal(normalizeGenderParam("M"), "M");
  assert.equal(normalizeGenderParam("male"), "M");
  assert.equal(normalizeGenderParam("F"), "F");
  assert.equal(normalizeGenderParam("female"), "F");
  assert.equal(normalizeGenderParam("unknown"), null);
}

function testDeterministicPick(): void {
  const first = pickDeterministicNames({
    routeKey: "surname",
    surname: "김",
    gender: "M",
    count: 10,
  });
  const second = pickDeterministicNames({
    routeKey: "surname",
    surname: "김",
    gender: "M",
    count: 10,
  });
  const third = pickDeterministicNames({
    routeKey: "surname",
    surname: "이",
    gender: "M",
    count: 10,
  });

  assert.deepEqual(first, second);
  assert.equal(first.length, 10);
  assert.notDeepEqual(first, third);
}

function testIndexablePolicy(): void {
  const topSurname = TOP_SURNAMES[0];
  assert.equal(isIndexableSurname(topSurname), true);
  assert.equal(isIndexableSurname("남궁"), false);
}

function testMetadataBuilder(): void {
  const meta = buildSeoMetadata({
    title: "김 아기 이름 추천 | 네임핏",
    description: "성씨와 성별, 생년월일 정보를 바탕으로 이름 추천 흐름을 안내합니다.",
    pathname: "/surname/김",
    noIndex: true,
  });

  const canonical = meta.alternates?.canonical;
  assert.equal(typeof canonical, "string");
  if (typeof canonical === "string") {
    assert.ok(canonical.endsWith("/surname/%EA%B9%80"));
  }
  assert.equal(meta.openGraph?.url, canonical);
  const robots = meta.robots;
  assert.notEqual(robots, undefined);
  if (robots && typeof robots !== "string") {
    assert.equal(robots.index, false);
  }
}

function run(): void {
  testSurnameValidation();
  testGenderNormalization();
  testDeterministicPick();
  testIndexablePolicy();
  testMetadataBuilder();
  console.log("[test:seo-utils] all tests passed");
}

run();
