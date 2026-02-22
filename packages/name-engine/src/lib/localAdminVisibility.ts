interface LocalAdminVisibilityOptions {
  nodeEnv?: string;
  vercel?: string;
  hostname?: string;
}

const BLOCKED_HOST_SUFFIXES = [
  ".vercel.app",
  ".apps.tossmini.com",
  ".private-apps.tossmini.com",
] as const;

function normalizeHostname(hostname: string): string {
  return hostname.trim().toLowerCase();
}

export function isLoopbackHostname(hostname: string): boolean {
  const normalized = normalizeHostname(hostname);
  return normalized === "localhost" || normalized === "127.0.0.1" || normalized === "::1";
}

function isBlockedHostname(hostname: string): boolean {
  const normalized = normalizeHostname(hostname);
  return BLOCKED_HOST_SUFFIXES.some((suffix) => normalized.endsWith(suffix));
}

export function isLocalAdminToolsEnabled({
  nodeEnv = process.env.NODE_ENV,
  vercel = process.env.VERCEL,
  hostname = "",
}: LocalAdminVisibilityOptions): boolean {
  if ((nodeEnv ?? "").trim() !== "development") {
    return false;
  }

  if ((vercel ?? "").trim().length > 0) {
    return false;
  }

  if (!hostname.trim()) {
    return false;
  }

  if (isBlockedHostname(hostname)) {
    return false;
  }

  return isLoopbackHostname(hostname);
}
