const fs = require("node:fs");
const path = require("node:path");

function readTraceFile(filePath) {
  const raw = fs.readFileSync(filePath, "utf8");
  return JSON.parse(raw);
}

function hasSurnameMap(files) {
  return files.some((item) => item.includes("surname_map.jsonl"));
}

function assertTrace(tracePath, label) {
  if (!fs.existsSync(tracePath)) {
    throw new Error(`[assert-surname-map-trace] missing trace file: ${tracePath}`);
  }

  const trace = readTraceFile(tracePath);
  const files = Array.isArray(trace.files) ? trace.files : [];
  if (!hasSurnameMap(files)) {
    throw new Error(
      `[assert-surname-map-trace] ${label} trace does not include surname_map.jsonl`
    );
  }
}

function run() {
  const root = process.cwd();
  const webTrace = path.resolve(
    root,
    "apps/web/.next/server/app/api/surname/options/route.js.nft.json"
  );
  const tossTrace = path.resolve(
    root,
    "apps/toss/.next/server/app/api/surname/options/route.js.nft.json"
  );

  assertTrace(webTrace, "web");
  assertTrace(tossTrace, "toss");

  console.log("[assert-surname-map-trace] all traces include surname_map.jsonl");
}

run();
