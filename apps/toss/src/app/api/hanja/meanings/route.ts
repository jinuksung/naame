import { NextResponse } from "next/server";
import { preflight, withCors } from "@/app/api/_lib/cors";
import { fetchHanjaMeaningKeywords } from "@/server/ssotAdmin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
const ALLOWED_METHODS = "GET,OPTIONS";

function parseChars(raw: string): string[] {
  const tokens = raw
    .split(",")
    .map((token) => token.trim().normalize("NFC"))
    .filter((token) => token.length > 0);

  const chars: string[] = [];
  for (const token of tokens) {
    for (const ch of Array.from(token)) {
      chars.push(ch);
    }
  }

  return Array.from(new Set(chars)).slice(0, 40);
}

export async function OPTIONS(request: Request): Promise<NextResponse> {
  return preflight(request, ALLOWED_METHODS);
}

export async function GET(request: Request): Promise<NextResponse> {
  const rawChars = new URL(request.url).searchParams.get("chars") ?? "";
  const chars = parseChars(rawChars);
  if (chars.length === 0) {
    return withCors(
      request,
      NextResponse.json({ meanings: {} as Record<string, string> }),
      ALLOWED_METHODS
    );
  }

  try {
    const meanings = await fetchHanjaMeaningKeywords(chars);
    return withCors(request, NextResponse.json({ meanings }), ALLOWED_METHODS);
  } catch (error) {
    console.error("[api/hanja/meanings] 조회 실패", error);
    return withCors(
      request,
      NextResponse.json({ error: "Failed to load hanja meanings" }, { status: 500 }),
      ALLOWED_METHODS
    );
  }
}
