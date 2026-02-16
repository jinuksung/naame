import { NextResponse } from "next/server";
import {
  isSupabaseFeedbackEnabled,
  recordFeedbackVote,
  type FeedbackVoteType,
} from "@/server/feedback/supabaseFeedback";
import { preflight, withCors } from "@/app/api/_lib/cors";

interface FeedbackPayload {
  surnameHangul?: unknown;
  surnameHanja?: unknown;
  nameHangul?: unknown;
  hanjaPair?: unknown;
  vote?: unknown;
}

function isVoteType(value: unknown): value is FeedbackVoteType {
  return value === "like" || value === "dislike";
}

function toSafeNameHangul(value: unknown): string {
  if (typeof value !== "string") {
    return "";
  }
  return value.trim();
}

function toSafeSurname(value: unknown): string {
  if (typeof value !== "string") {
    return "";
  }
  return value.trim();
}

function toSafeHanjaPair(value: unknown): [string, string] | null {
  if (!Array.isArray(value) || value.length !== 2) {
    return null;
  }
  const left = typeof value[0] === "string" ? value[0].trim() : "";
  const right = typeof value[1] === "string" ? value[1].trim() : "";
  if (!left || !right) {
    return null;
  }
  return [left, right];
}

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
const ALLOWED_METHODS = "POST,OPTIONS";

export async function OPTIONS(request: Request): Promise<NextResponse> {
  return preflight(request, ALLOWED_METHODS);
}

export async function POST(request: Request): Promise<NextResponse> {
  if (!isSupabaseFeedbackEnabled()) {
    return withCors(
      request,
      NextResponse.json({
        ok: true,
        skipped: true,
        reason: "feedback_backend_not_configured",
      }),
      ALLOWED_METHODS
    );
  }

  let payload: FeedbackPayload;
  try {
    payload = (await request.json()) as FeedbackPayload;
  } catch {
    return withCors(
      request,
      NextResponse.json({ error: "Invalid JSON body" }, { status: 400 }),
      ALLOWED_METHODS
    );
  }

  const nameHangul = toSafeNameHangul(payload.nameHangul);
  const surnameHangul = toSafeSurname(payload.surnameHangul);
  const surnameHanja = toSafeSurname(payload.surnameHanja);
  const hanjaPair = toSafeHanjaPair(payload.hanjaPair);
  const vote = payload.vote;

  if (!surnameHangul || !surnameHanja || !nameHangul || !hanjaPair || !isVoteType(vote)) {
    return withCors(
      request,
      NextResponse.json({ error: "Invalid payload" }, { status: 400 }),
      ALLOWED_METHODS
    );
  }

  try {
    await recordFeedbackVote({
      surnameHangul,
      surnameHanja,
      nameHangul,
      hanjaPair,
      vote,
    });
    return withCors(request, NextResponse.json({ ok: true }), ALLOWED_METHODS);
  } catch (error) {
    console.error("[feedback] failed to record vote", error);
    return withCors(
      request,
      NextResponse.json({ error: "Failed to record feedback" }, { status: 500 }),
      ALLOWED_METHODS
    );
  }
}
