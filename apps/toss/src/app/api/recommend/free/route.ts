import { NextResponse } from "next/server";
import { recommendFreeNames } from "@namefit/engine";
import { applyFeedbackScores } from "@/server/feedback/feedbackScoring";
import { getFeedbackStatsMap } from "@/server/feedback/supabaseFeedback";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function toFeedbackSurnameContext(payload: unknown): { surnameHangul: string; surnameHanja: string } | null {
  if (!payload || typeof payload !== "object") {
    return null;
  }
  const raw = payload as { surnameHangul?: unknown; surnameHanja?: unknown };
  const surnameHangul = typeof raw.surnameHangul === "string" ? raw.surnameHangul.trim() : "";
  const surnameHanja = typeof raw.surnameHanja === "string" ? raw.surnameHanja.trim() : "";
  if (!surnameHangul || !surnameHanja) {
    return null;
  }
  return {
    surnameHangul,
    surnameHanja,
  };
}

export async function POST(request: Request): Promise<NextResponse> {
  let payload: unknown;

  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const result = await recommendFreeNames(payload);
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }

  try {
    const surnameContext = toFeedbackSurnameContext(payload);
    if (!surnameContext) {
      return NextResponse.json(result.response);
    }

    const statsMap = await getFeedbackStatsMap(result.response.results, surnameContext);
    const adjustedResults = applyFeedbackScores(result.response.results, statsMap, surnameContext);
    return NextResponse.json({ results: adjustedResults });
  } catch (error) {
    console.error("[api] feedback weight apply failed", error);
    return NextResponse.json(result.response);
  }
}
