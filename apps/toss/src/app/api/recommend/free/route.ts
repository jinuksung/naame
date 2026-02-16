import { NextResponse } from "next/server";
import { recommendFreeNames } from "@namefit/engine";
import { applyFeedbackScores } from "@/server/feedback/feedbackScoring";
import { getFeedbackStatsMap } from "@/server/feedback/supabaseFeedback";
import { preflight, withCors } from "@/app/api/_lib/cors";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
const ALLOWED_METHODS = "POST,OPTIONS";

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

  const result = await recommendFreeNames(payload);
  if (!result.ok) {
    return withCors(
      request,
      NextResponse.json({ error: result.error }, { status: result.status }),
      ALLOWED_METHODS
    );
  }

  try {
    const surnameContext = toFeedbackSurnameContext(payload);
    if (!surnameContext) {
      return withCors(request, NextResponse.json(result.response), ALLOWED_METHODS);
    }

    const statsMap = await getFeedbackStatsMap(result.response.results, surnameContext);
    const adjustedResults = applyFeedbackScores(result.response.results, statsMap, surnameContext);
    return withCors(request, NextResponse.json({ results: adjustedResults }), ALLOWED_METHODS);
  } catch (error) {
    console.error("[api] feedback weight apply failed", error);
    return withCors(request, NextResponse.json(result.response), ALLOWED_METHODS);
  }
}
