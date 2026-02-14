import fs from "node:fs";
import path from "node:path";
import type { NamePoolOutput } from "../types";

export function writeArtifacts(
  outDir: string,
  male: NamePoolOutput,
  female: NamePoolOutput,
  report: string
): void {
  fs.mkdirSync(outDir, { recursive: true });

  fs.writeFileSync(path.join(outDir, "name_pool_M.json"), JSON.stringify(male, null, 2), "utf8");
  fs.writeFileSync(path.join(outDir, "name_pool_F.json"), JSON.stringify(female, null, 2), "utf8");
  fs.writeFileSync(path.join(outDir, "report.md"), report, "utf8");
}
