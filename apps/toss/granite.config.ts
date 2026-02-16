import { defineConfig } from "@apps-in-toss/web-framework/config";

function toPort(value: string | undefined, fallback: number): number {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
}

const appName = process.env.APPS_IN_TOSS_APP_NAME?.trim() || "namefit";
const host = process.env.APPS_IN_TOSS_HOST?.trim() || "localhost";
const port = toPort(process.env.APPS_IN_TOSS_PORT, 3000);

export default defineConfig({
  appName,
  brand: {
    displayName: "네임핏",
    primaryColor: "#3182F6",
    icon: process.env.APPS_IN_TOSS_BRAND_ICON_URL?.trim() || "",
  },
  permissions: [],
  web: {
    host,
    // 192.168.219.111 내 맥 아이피
    port,
    //5173
    commands: {
      dev: `next dev -p ${port}`,
      //
      build: "node scripts/build-appintos-static.mjs",
    },
  },
  webViewProps: {
    type: "partner",
  },
  outdir: "dist-appintos",
});
