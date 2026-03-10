import { NextResponse } from "next/server";
import { recommendPremiumNames } from "@namefit/engine";
import { preflight, withCors } from "@/app/api/_lib/cors";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
const ALLOWED_METHODS = "POST,OPTIONS";

export async function OPTIONS(request: Request): Promise<NextResponse> {
  return preflight(request, ALLOWED_METHODS);
}

export async function POST(request: Request): Promise<NextResponse> {
  let payload: unknown;

  try {
    payload = await request.json();
  } catch {
    return withCors(
      request,
      NextResponse.json({ error: "Invalid JSON body" }, { status: 400 }),
      ALLOWED_METHODS
    );
  }

  const result = await recommendPremiumNames(payload);
  if (!result.ok) {
    return withCors(
      request,
      NextResponse.json({ error: result.error }, { status: result.status }),
      ALLOWED_METHODS
    );
  }

  return withCors(request, NextResponse.json(result.response), ALLOWED_METHODS);
}
