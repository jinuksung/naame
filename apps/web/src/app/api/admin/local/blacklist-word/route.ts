import { NextResponse } from "next/server";
import { isLocalAdminRequest } from "@/app/api/_lib/localAdmin";
import { addBlacklistWord } from "@/server/ssotAdmin";

interface Payload {
  nameHangul?: unknown;
}

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request): Promise<NextResponse> {
  if (!isLocalAdminRequest(request)) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  let payload: Payload;
  try {
    payload = (await request.json()) as Payload;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const nameHangul = typeof payload.nameHangul === "string" ? payload.nameHangul.trim() : "";
  if (!nameHangul) {
    return NextResponse.json({ error: "Invalid nameHangul" }, { status: 400 });
  }

  try {
    const result = await addBlacklistWord(nameHangul);
    return NextResponse.json({ ok: true, inserted: result.inserted });
  } catch (error) {
    console.error("[admin] blacklist update failed", error);
    return NextResponse.json({ error: "Failed to update blacklist" }, { status: 500 });
  }
}
