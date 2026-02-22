import { isLocalAdminToolsEnabled } from "@namefit/engine/lib/localAdminVisibility";

export function isLocalAdminRequest(request: Request): boolean {
  const hostname = new URL(request.url).hostname;
  return isLocalAdminToolsEnabled({
    nodeEnv: process.env.NODE_ENV,
    vercel: process.env.VERCEL,
    hostname,
  });
}
