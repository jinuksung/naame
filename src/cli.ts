import path from "node:path";
import { runNamePoolPipeline } from "./pipeline";

interface CliArgs {
  inputPath: string;
  outDir: string;
}

function parseArgs(argv: string[]): CliArgs {
  let inputPath = "";
  let outDir = "out";

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === "--input") {
      inputPath = argv[i + 1] ?? "";
      i += 1;
      continue;
    }
    if (arg.startsWith("--input=")) {
      inputPath = arg.slice("--input=".length);
      continue;
    }
    if (arg === "--out") {
      outDir = argv[i + 1] ?? outDir;
      i += 1;
      continue;
    }
    if (arg.startsWith("--out=")) {
      outDir = arg.slice("--out=".length);
    }
  }

  if (!inputPath) {
    throw new Error("Missing required --input <path>");
  }

  return {
    inputPath,
    outDir
  };
}

function main(): void {
  const args = parseArgs(process.argv.slice(2));
  const result = runNamePoolPipeline({
    inputPath: args.inputPath,
    outDir: args.outDir,
    targetCount: 600,
    minCount: 400
  });

  const outputDir = path.resolve(args.outDir);
  console.log(`[name-pool] M count: ${result.male.count}`);
  console.log(`[name-pool] F count: ${result.female.count}`);
  console.log(`[name-pool] report: ${path.join(outputDir, "report.md")}`);
}

if (require.main === module) {
  try {
    main();
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`[name-pool] failed: ${message}`);
    process.exitCode = 1;
  }
}
