import { randomUUID } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import type { LikedNameEntry } from "@/lib/likedNamesRepository";
import { preflight, withCors } from "@/app/api/_lib/cors";
import {
  getLikedNameEntries,
  isSupabaseLikedEnabled,
  removeLikedNameEntry,
  upsertLikedNameEntry
} from "@/server/liked/supabaseLiked";

interface LikedUpsertPayload {
  entry?: unknown;
}

interface LikedRemovePayload {
  id?: unknown;
}

const LIKED_SESSION_COOKIE = "namefit_liked_session";
const SESSION_ID_PATTERN = /^[0-9a-f-]{36}$/i;

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
const ALLOWED_METHODS = "GET,POST,DELETE,OPTIONS";

function toStringPair(value: unknown): [string, string] | null {
  if (!Array.isArray(value) || value.length !== 2) {
    return null;
  }
  const first = typeof value[0] === "string" ? value[0].trim() : "";
  const second = typeof value[1] === "string" ? value[1].trim() : "";
  if (!first || !second) {
    return null;
  }
  return [first, second];
}

function toOptionalMeaningPair(value: unknown): [string, string] | undefined {
  if (value === null || value === undefined) {
    return undefined;
  }
  return toStringPair(value) ?? undefined;
}

function toSafeLikedNameEntry(value: unknown): LikedNameEntry | null {
  if (!value || typeof value !== "object") {
    return null;
  }
  const candidate = value as Partial<LikedNameEntry>;

  if (
    typeof candidate.id !== "string" ||
    typeof candidate.fullName !== "string" ||
    typeof candidate.nameHangul !== "string" ||
    typeof candidate.surnameHangul !== "string" ||
    typeof candidate.surnameHanja !== "string" ||
    typeof candidate.gender !== "string" ||
    typeof candidate.reason !== "string" ||
    typeof candidate.createdAt !== "string" ||
    (candidate.source !== "FREE" && candidate.source !== "PREMIUM")
  ) {
    return null;
  }

  const hanjaPair = toStringPair(candidate.hanjaPair);
  const readingPair = toStringPair(candidate.readingPair);
  const meaningPair = toOptionalMeaningPair(candidate.meaningPair);
  if (!hanjaPair || !readingPair) {
    return null;
  }

  const score =
    typeof candidate.score === "number" && Number.isFinite(candidate.score)
      ? candidate.score
      : undefined;

  return {
    id: candidate.id.trim(),
    fullName: candidate.fullName.trim(),
    nameHangul: candidate.nameHangul.trim(),
    surnameHangul: candidate.surnameHangul.trim(),
    surnameHanja: candidate.surnameHanja.trim(),
    gender: candidate.gender.trim(),
    hanjaPair,
    readingPair,
    meaningPair,
    score,
    reason: candidate.reason.trim(),
    createdAt: candidate.createdAt.trim(),
    source: candidate.source
  };
}

function resolveSession(request: NextRequest): { sessionId: string; shouldSetCookie: boolean } {
  const existing = request.cookies.get(LIKED_SESSION_COOKIE)?.value?.trim() ?? "";
  if (SESSION_ID_PATTERN.test(existing)) {
    return {
      sessionId: existing,
      shouldSetCookie: false
    };
  }
  return {
    sessionId: randomUUID(),
    shouldSetCookie: true
  };
}

function attachSessionCookie(response: NextResponse, sessionId: string): void {
  response.cookies.set({
    name: LIKED_SESSION_COOKIE,
    value: sessionId,
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 365
  });
}

function withSession(
  request: NextRequest,
  response: NextResponse,
  session: { sessionId: string; shouldSetCookie: boolean }
): NextResponse {
  const corsResponse = withCors(request, response, ALLOWED_METHODS);
  if (session.shouldSetCookie) {
    attachSessionCookie(corsResponse, session.sessionId);
  }
  return corsResponse;
}

export async function OPTIONS(request: NextRequest): Promise<NextResponse> {
  return preflight(request, ALLOWED_METHODS);
}

export async function GET(request: NextRequest): Promise<NextResponse> {
  const session = resolveSession(request);
  if (!isSupabaseLikedEnabled()) {
    return withSession(
      request,
      NextResponse.json({
        ok: true,
        skipped: true,
        reason: "liked_backend_not_configured",
        entries: []
      }),
      session
    );
  }

  try {
    const entries = await getLikedNameEntries(session.sessionId);
    return withSession(request, NextResponse.json({ ok: true, entries }), session);
  } catch (error) {
    console.error("[liked] failed to fetch liked names", error);
    return withSession(
      request,
      NextResponse.json({ error: "Failed to fetch liked names" }, { status: 500 }),
      session
    );
  }
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  const session = resolveSession(request);
  if (!isSupabaseLikedEnabled()) {
    return withSession(
      request,
      NextResponse.json({
        ok: true,
        skipped: true,
        reason: "liked_backend_not_configured"
      }),
      session
    );
  }

  let payload: LikedUpsertPayload;
  try {
    payload = (await request.json()) as LikedUpsertPayload;
  } catch {
    return withSession(
      request,
      NextResponse.json({ error: "Invalid JSON body" }, { status: 400 }),
      session
    );
  }

  const entry = toSafeLikedNameEntry(payload.entry);
  if (!entry) {
    return withSession(
      request,
      NextResponse.json({ error: "Invalid payload" }, { status: 400 }),
      session
    );
  }

  try {
    await upsertLikedNameEntry(session.sessionId, entry);
    return withSession(request, NextResponse.json({ ok: true }), session);
  } catch (error) {
    console.error("[liked] failed to upsert liked name", error);
    return withSession(
      request,
      NextResponse.json({ error: "Failed to upsert liked name" }, { status: 500 }),
      session
    );
  }
}

export async function DELETE(request: NextRequest): Promise<NextResponse> {
  const session = resolveSession(request);
  if (!isSupabaseLikedEnabled()) {
    return withSession(
      request,
      NextResponse.json({
        ok: true,
        skipped: true,
        reason: "liked_backend_not_configured"
      }),
      session
    );
  }

  let payload: LikedRemovePayload;
  try {
    payload = (await request.json()) as LikedRemovePayload;
  } catch {
    return withSession(
      request,
      NextResponse.json({ error: "Invalid JSON body" }, { status: 400 }),
      session
    );
  }

  const id = typeof payload.id === "string" ? payload.id.trim() : "";
  if (!id) {
    return withSession(
      request,
      NextResponse.json({ error: "Invalid payload" }, { status: 400 }),
      session
    );
  }

  try {
    await removeLikedNameEntry(session.sessionId, id);
    return withSession(request, NextResponse.json({ ok: true }), session);
  } catch (error) {
    console.error("[liked] failed to remove liked name", error);
    return withSession(
      request,
      NextResponse.json({ error: "Failed to remove liked name" }, { status: 500 }),
      session
    );
  }
}
