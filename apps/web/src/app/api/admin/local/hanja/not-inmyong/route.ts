import { NextResponse } from "next/server";
import { isLocalAdminRequest } from "@/app/api/_lib/localAdmin";
import { markCharAsNotInmyong } from "@/server/ssotAdmin";

interface Payload {
  char?: unknown;
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

  const char = typeof payload.char === "string" ? payload.char.trim() : "";
  if (!char) {
    return NextResponse.json({ error: "Invalid char" }, { status: 400 });
  }

  try {
    await markCharAsNotInmyong(char);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[admin] not-inmyong update failed", error);
    return NextResponse.json({ error: "Failed to update is_inmyong" }, { status: 500 });
  }
}
