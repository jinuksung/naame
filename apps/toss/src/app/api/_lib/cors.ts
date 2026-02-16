import { NextResponse } from "next/server";

const DEFAULT_ALLOW_HEADERS = "Content-Type, Authorization";
const DEFAULT_MAX_AGE_SECONDS = "86400";
const TOSS_ALLOWED_HOST_SUFFIXES = [".apps.tossmini.com", ".private-apps.tossmini.com"] as const;

function parseUrl(value: string): URL | null {
  try {
    return new URL(value);
  } catch {
    return null;
  }
}

function normalizeList(raw: string | undefined): string[] {
  if (!raw) {
    return [];
  }
  return raw
    .split(",")
    .map((item) => item.trim())
    .filter((item) => item.length > 0);
}

function isAllowedHost(host: string, requestHost: string): boolean {
  if (host === requestHost) {
    return true;
  }

  if (host === "localhost" || host === "127.0.0.1") {
    return true;
  }

  return TOSS_ALLOWED_HOST_SUFFIXES.some((suffix) => host.endsWith(suffix));
}

function resolveAllowedOrigin(request: Request): string | null {
  const origin = request.headers.get("origin");
  if (!origin) {
    return null;
  }

  const originUrl = parseUrl(origin);
  const requestUrl = parseUrl(request.url);
  if (!originUrl || !requestUrl) {
    return null;
  }

  const originHost = originUrl.hostname.toLowerCase();
  const requestHost = requestUrl.hostname.toLowerCase();

  if (isAllowedHost(originHost, requestHost)) {
    return origin;
  }

  const explicitAllowedOrigins = normalizeList(process.env.CORS_ALLOWED_ORIGINS);
  if (explicitAllowedOrigins.includes(origin)) {
    return origin;
  }

  return null;
}

function applyCorsHeaders(
  request: Request,
  response: NextResponse,
  allowedMethods: string
): NextResponse {
  response.headers.set("Vary", "Origin");

  const allowedOrigin = resolveAllowedOrigin(request);
  if (!allowedOrigin) {
    return response;
  }

  const requestedHeaders = request.headers.get("access-control-request-headers")?.trim();
  response.headers.set("Access-Control-Allow-Origin", allowedOrigin);
  response.headers.set("Access-Control-Allow-Credentials", "true");
  response.headers.set("Access-Control-Allow-Methods", allowedMethods);
  response.headers.set(
    "Access-Control-Allow-Headers",
    requestedHeaders && requestedHeaders.length > 0 ? requestedHeaders : DEFAULT_ALLOW_HEADERS
  );
  response.headers.set("Access-Control-Max-Age", DEFAULT_MAX_AGE_SECONDS);
  return response;
}

export function withCors(request: Request, response: NextResponse, allowedMethods: string): NextResponse {
  return applyCorsHeaders(request, response, allowedMethods);
}

export function preflight(request: Request, allowedMethods: string): NextResponse {
  const origin = request.headers.get("origin");
  const allowedOrigin = resolveAllowedOrigin(request);
  if (origin && !allowedOrigin) {
    return NextResponse.json({ error: "CORS origin not allowed" }, { status: 403 });
  }
  return applyCorsHeaders(request, new NextResponse(null, { status: 204 }), allowedMethods);
}
