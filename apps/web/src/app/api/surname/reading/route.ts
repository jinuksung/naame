import { NextResponse } from "next/server";
import { resolveSurnameReadingByHanja } from "@namefit/engine";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function countChars(text: string): number {
  return Array.from(text).length;
}

export async function GET(request: Request): Promise<NextResponse> {
  const rawHanja = new URL(request.url).searchParams.get("hanja") ?? "";
  const hanja = rawHanja.trim().normalize("NFC");
  if (!hanja) {
    return NextResponse.json({ surnameReading: "" });
  }

  if (countChars(hanja) > 2) {
    return NextResponse.json({ error: "Invalid hanja length" }, { status: 400 });
  }

  try {
    const surnameReading = await resolveSurnameReadingByHanja(hanja);
    if (!surnameReading) {
      return NextResponse.json({ error: "Unsupported surname hanja" }, { status: 400 });
    }
    return NextResponse.json({ surnameReading });
  } catch (error) {
    console.error("[api/surname/reading] 조회 실패", error);
    return NextResponse.json({ error: "Failed to load surname reading" }, { status: 500 });
  }
}
