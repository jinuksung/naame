import { NextResponse } from "next/server";
import { recommendFreeNames } from "@namefit/engine";
import { applyFeedbackScores } from "@/server/feedback/feedbackScoring";
import { getFeedbackStatsMap } from "@/server/feedback/supabaseFeedback";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

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
    const statsMap = await getFeedbackStatsMap(result.response.results);
    const adjustedResults = applyFeedbackScores(result.response.results, statsMap);
    return NextResponse.json({ results: adjustedResults });
  } catch (error) {
    console.error("[api] feedback weight apply failed", error);
    return NextResponse.json(result.response);
  }
}
