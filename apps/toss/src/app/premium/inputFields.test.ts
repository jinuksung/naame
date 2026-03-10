import assert from "node:assert/strict";
import {
  buildIsoDate,
  buildTime24h,
  resolveHourInput,
  resolveMonthInput,
  splitIsoDate,
  splitTime24h
} from "./inputFields";

function testResolveMonthInputRules(): void {
  assert.deepEqual(resolveMonthInput("1"), { value: "1", moveNext: false });
  assert.deepEqual(resolveMonthInput("11"), { value: "11", moveNext: true });
  assert.deepEqual(resolveMonthInput("12"), { value: "12", moveNext: true });
  assert.deepEqual(resolveMonthInput("10"), { value: "10", moveNext: true });
  assert.deepEqual(resolveMonthInput("8"), { value: "8", moveNext: true });
}

function testResolveHourInputRules(): void {
  assert.deepEqual(resolveHourInput("1"), { value: "1", moveNext: false });
  assert.deepEqual(resolveHourInput("11"), { value: "11", moveNext: true });
  assert.deepEqual(resolveHourInput("12"), { value: "12", moveNext: true });
  assert.deepEqual(resolveHourInput("10"), { value: "10", moveNext: true });
  assert.deepEqual(resolveHourInput("9"), { value: "9", moveNext: true });
}

function testDateConversion(): void {
  assert.deepEqual(splitIsoDate("1998-03-07"), { year: "1998", month: "3", day: "7" });
  assert.equal(buildIsoDate("1998", "3", "7"), "1998-03-07");
  assert.equal(buildIsoDate("1998", "13", "7"), null);
}

function testTimeConversion(): void {
  assert.deepEqual(splitTime24h("00:05"), { meridiem: "AM", hour: "12", minute: "5" });
  assert.deepEqual(splitTime24h("13:40"), { meridiem: "PM", hour: "1", minute: "40" });
  assert.equal(buildTime24h("AM", "12", "5"), "00:05");
  assert.equal(buildTime24h("PM", "1", "5"), "13:05");
  assert.equal(buildTime24h("PM", "", ""), null);
}

function run(): void {
  testResolveMonthInputRules();
  testResolveHourInputRules();
  testDateConversion();
  testTimeConversion();
  console.log("[test:premium-input-fields:toss] all tests passed");
}

run();
