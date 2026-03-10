import { spawn } from "node:child_process";
import { createRequire } from "node:module";
import { pathToFileURL } from "node:url";

const require = createRequire(import.meta.url);
const nextCliPath = require.resolve("next/dist/bin/next");

export const DEFAULT_PORT = 3000;

function toPort(value, fallback = DEFAULT_PORT) {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
}

function readFlagValue(argv, flag) {
  const index = argv.indexOf(flag);
  if (index === -1) {
    return undefined;
  }
  return argv[index + 1];
}

export function buildNextDevExecution(argv = [], env = process.env) {
  const selectedPort = readFlagValue(argv, "--port") ?? env.APPS_IN_TOSS_PORT;
  const port = toPort(selectedPort, DEFAULT_PORT);

  return {
    port,
    args: ["dev", "-p", String(port)],
    env: { ...env },
  };
}

export function runNextDev(argv = process.argv.slice(2), env = process.env) {
  const execution = buildNextDevExecution(argv, env);
  const child = spawn(process.execPath, [nextCliPath, ...execution.args], {
    stdio: "inherit",
    env: execution.env,
  });

  child.on("exit", (code, signal) => {
    if (signal) {
      process.kill(process.pid, signal);
      return;
    }
    process.exit(code ?? 1);
  });
}

const isDirectRun = Boolean(
  process.argv[1] && pathToFileURL(process.argv[1]).href === import.meta.url,
);

if (isDirectRun) {
  runNextDev();
}
