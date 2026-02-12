import { NextResponse } from "next/server";
import {
  resolveSurnameHanjaSelection,
  SurnameHanjaOptionsResponse
} from "@namefit/engine";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function countChars(text: string): number {
  return Array.from(text).length;
}

export async function GET(request: Request): Promise<NextResponse> {
  const reading = new URL(request.url).searchParams.get("reading")?.trim() ?? "";
  if (!reading) {
    return NextResponse.json({
      surnameReading: "",
      options: [],
      autoSelectedHanja: null
    } satisfies SurnameHanjaOptionsResponse);
  }

  if (countChars(reading) > 2) {
    return NextResponse.json({ error: "Invalid reading length" }, { status: 400 });
  }

  try {
    const resolved = await resolveSurnameHanjaSelection(reading);
    return NextResponse.json({
      surnameReading: reading,
      options: resolved.options,
      autoSelectedHanja: resolved.selectedHanja
    } satisfies SurnameHanjaOptionsResponse);
  } catch (error) {
    console.error("[api/surname/options] 조회 실패", error);
    return NextResponse.json({ error: "Failed to load surname options" }, { status: 500 });
  }
}
