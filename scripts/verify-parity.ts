const { mkdir, writeFile } = require("node:fs/promises");
const { dirname, resolve } = require("node:path");
const { POST: tossRecommendPost } = require("../apps/toss/src/app/api/recommend/free/route");
const { POST: webRecommendPost } = require("../apps/web/src/app/api/recommend/free/route");

type FreeRecommendInput = import("@namefit/engine").FreeRecommendInput;
type FreeRecommendResponse = import("@namefit/engine").FreeRecommendResponse;

type RecommendHandler = (request: Request) => Promise<Response>;

const SNAPSHOT_PATH = resolve("docs/recommend-parity-snapshot.json");

const SAMPLE_INPUT: FreeRecommendInput = {
  surnameHangul: "김",
  surnameHanja: "金",
  birth: {
    calendar: "SOLAR",
    date: "2024-05-21",
    time: "08:30"
  },
  gender: "UNISEX"
};

async function runHandler(handler: RecommendHandler): Promise<FreeRecommendResponse> {
  const request = new Request("http://localhost/api/recommend/free", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(SAMPLE_INPUT)
  });

  const response = await handler(request);
  if (!response.ok) {
    const bodyText = await response.text();
    throw new Error(`[verify-parity] request failed: ${response.status} ${bodyText}`);
  }

  return (await response.json()) as FreeRecommendResponse;
}

async function main(): Promise<void> {
  const [tossResult, webResult] = await Promise.all([
    runHandler(tossRecommendPost),
    runHandler(webRecommendPost)
  ]);

  const tossJson = JSON.stringify(tossResult);
  const webJson = JSON.stringify(webResult);

  if (tossJson !== webJson) {
    throw new Error("[verify-parity] toss/web recommendation results differ");
  }

  const snapshot = {
    generatedAt: new Date().toISOString(),
    input: SAMPLE_INPUT,
    toss: tossResult,
    web: webResult,
    identical: true
  };

  await mkdir(dirname(SNAPSHOT_PATH), { recursive: true });
  await writeFile(SNAPSHOT_PATH, `${JSON.stringify(snapshot, null, 2)}\n`, "utf8");

  console.log(`[verify-parity] snapshot saved: ${SNAPSHOT_PATH}`);
}

void main().catch((error: unknown) => {
  const message = error instanceof Error ? error.stack ?? error.message : String(error);
  console.error(message);
  process.exitCode = 1;
});
