import { NextResponse } from "next/server";
import {
  isSupabaseFeedbackEnabled,
  recordFeedbackVote,
  type FeedbackVoteType,
} from "@/server/feedback/supabaseFeedback";

interface FeedbackPayload {
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

export async function POST(request: Request): Promise<NextResponse> {
  if (!isSupabaseFeedbackEnabled()) {
    return NextResponse.json(
      { error: "Feedback backend is not configured" },
      { status: 503 },
    );
  }

  let payload: FeedbackPayload;
  try {
    payload = (await request.json()) as FeedbackPayload;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const nameHangul = toSafeNameHangul(payload.nameHangul);
  const hanjaPair = toSafeHanjaPair(payload.hanjaPair);
  const vote = payload.vote;

  if (!nameHangul || !hanjaPair || !isVoteType(vote)) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  try {
    await recordFeedbackVote({
      nameHangul,
      hanjaPair,
      vote,
    });
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[feedback] failed to record vote", error);
    return NextResponse.json({ error: "Failed to record feedback" }, { status: 500 });
  }
}
