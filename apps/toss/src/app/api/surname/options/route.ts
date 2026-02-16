import { NextResponse } from "next/server";
import {
  normalizeHangulReading,
  resolveSurnameHanjaSelection,
  SurnameHanjaOptionsResponse
} from "@namefit/engine";
import { preflight, withCors } from "@/app/api/_lib/cors";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
const ALLOWED_METHODS = "GET,OPTIONS";

function countChars(text: string): number {
  return Array.from(text).length;
}

export async function OPTIONS(request: Request): Promise<NextResponse> {
  return preflight(request, ALLOWED_METHODS);
}

export async function GET(request: Request): Promise<NextResponse> {
  const rawReading = new URL(request.url).searchParams.get("reading") ?? "";
  const reading = normalizeHangulReading(rawReading);
  if (!reading) {
    return withCors(
      request,
      NextResponse.json({
        surnameReading: "",
        options: [],
        autoSelectedHanja: null
      } satisfies SurnameHanjaOptionsResponse),
      ALLOWED_METHODS
    );
  }

  if (countChars(reading) > 2) {
    return withCors(
      request,
      NextResponse.json({ error: "Invalid reading length" }, { status: 400 }),
      ALLOWED_METHODS
    );
  }

  try {
    const resolved = await resolveSurnameHanjaSelection(reading);
    return withCors(
      request,
      NextResponse.json({
        surnameReading: reading,
        options: resolved.options,
        autoSelectedHanja: resolved.selectedHanja
      } satisfies SurnameHanjaOptionsResponse),
      ALLOWED_METHODS
    );
  } catch (error) {
    console.error("[api/surname/options] 조회 실패", error);
    return withCors(
      request,
      NextResponse.json({ error: "Failed to load surname options" }, { status: 500 }),
      ALLOWED_METHODS
    );
  }
}
