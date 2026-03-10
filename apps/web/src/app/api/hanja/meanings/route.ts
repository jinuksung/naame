import { NextResponse } from "next/server";
import { fetchHanjaMeaningKeywords } from "@/server/ssotAdmin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

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

export async function GET(request: Request): Promise<NextResponse> {
  const rawChars = new URL(request.url).searchParams.get("chars") ?? "";
  const chars = parseChars(rawChars);
  if (chars.length === 0) {
    return NextResponse.json({ meanings: {} as Record<string, string> });
  }

  try {
    const meanings = await fetchHanjaMeaningKeywords(chars);
    return NextResponse.json({ meanings });
  } catch (error) {
    console.error("[api/hanja/meanings] 조회 실패", error);
    return NextResponse.json({ error: "Failed to load hanja meanings" }, { status: 500 });
  }
}
