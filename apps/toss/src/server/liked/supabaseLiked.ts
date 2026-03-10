import type { LikedNameEntry } from "@/lib/likedNamesRepository";

interface SupabaseLikedRow {
  liked_id: string | null;
  full_name: string | null;
  name_hangul: string | null;
  surname_hangul: string | null;
  surname_hanja: string | null;
  gender: string | null;
  hanja_pair: string[] | null;
  reading_pair: string[] | null;
  meaning_pair: string[] | null;
  score: number | null;
  reason: string | null;
  source: "FREE" | "PREMIUM" | null;
  created_at: string | null;
}

function resolveSupabaseConfig(): {
  baseUrl: string;
  serviceRoleKey: string;
} {
  const baseUrl = process.env.SUPABASE_URL?.trim() ?? "";
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim() ?? "";
  if (!baseUrl || !serviceRoleKey) {
    throw new Error("supabase liked env is missing");
  }
  return {
    baseUrl: baseUrl.replace(/\/+$/, ""),
    serviceRoleKey
  };
}

export function isSupabaseLikedEnabled(): boolean {
  return Boolean(process.env.SUPABASE_URL?.trim()) && Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY?.trim());
}

async function callSupabase(
  path: string,
  init: RequestInit
): Promise<Response> {
  const config = resolveSupabaseConfig();
  const response = await fetch(`${config.baseUrl}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      apikey: config.serviceRoleKey,
      Authorization: `Bearer ${config.serviceRoleKey}`,
      ...(init.headers ?? {})
    },
    cache: "no-store"
  });

  if (!response.ok) {
    const bodyText = await response.text();
    throw new Error(`[liked] supabase request failed: ${response.status} ${bodyText}`);
  }

  return response;
}

function toPair(value: string[] | null): [string, string] {
  const first = value?.[0] ?? "";
  const second = value?.[1] ?? "";
  return [first, second];
}

function toMeaningPair(value: string[] | null): [string, string] | undefined {
  if (!value || value.length < 2) {
    return undefined;
  }
  return [value[0] ?? "", value[1] ?? ""];
}

function toLikedEntry(row: SupabaseLikedRow): LikedNameEntry | null {
  if (
    !row.liked_id ||
    !row.full_name ||
    !row.name_hangul ||
    !row.surname_hangul ||
    !row.surname_hanja ||
    !row.gender ||
    !row.reason ||
    !row.created_at ||
    (row.source !== "FREE" && row.source !== "PREMIUM")
  ) {
    return null;
  }

  const hanjaPair = toPair(row.hanja_pair);
  const readingPair = toPair(row.reading_pair);
  if (!hanjaPair[0] || !hanjaPair[1] || !readingPair[0] || !readingPair[1]) {
    return null;
  }

  const score = typeof row.score === "number" && Number.isFinite(row.score) ? row.score : undefined;

  return {
    id: row.liked_id,
    fullName: row.full_name,
    nameHangul: row.name_hangul,
    surnameHangul: row.surname_hangul,
    surnameHanja: row.surname_hanja,
    gender: row.gender,
    hanjaPair,
    readingPair,
    meaningPair: toMeaningPair(row.meaning_pair),
    score,
    reason: row.reason,
    createdAt: row.created_at,
    source: row.source
  };
}

function buildSessionFilter(sessionId: string): string {
  return encodeURIComponent(`eq.${sessionId.trim()}`);
}

export async function getLikedNameEntries(sessionId: string): Promise<LikedNameEntry[]> {
  const encodedSession = buildSessionFilter(sessionId);
  const response = await callSupabase(
    `/rest/v1/name_liked_entries?session_id=${encodedSession}&select=liked_id,full_name,name_hangul,surname_hangul,surname_hanja,gender,hanja_pair,reading_pair,meaning_pair,score,reason,source,created_at&order=created_at.desc`,
    {
      method: "GET"
    }
  );
  const rows = (await response.json()) as SupabaseLikedRow[];
  const entries: LikedNameEntry[] = [];
  for (const row of rows ?? []) {
    const entry = toLikedEntry(row);
    if (!entry) {
      continue;
    }
    entries.push(entry);
  }
  return entries;
}

export async function upsertLikedNameEntry(
  sessionId: string,
  entry: LikedNameEntry
): Promise<void> {
  await callSupabase("/rest/v1/name_liked_entries", {
    method: "POST",
    headers: {
      Prefer: "resolution=merge-duplicates"
    },
    body: JSON.stringify([
      {
        session_id: sessionId.trim(),
        liked_id: entry.id.trim(),
        full_name: entry.fullName.trim(),
        name_hangul: entry.nameHangul.trim(),
        surname_hangul: entry.surnameHangul.trim(),
        surname_hanja: entry.surnameHanja.trim(),
        gender: String(entry.gender).trim(),
        hanja_pair: entry.hanjaPair,
        reading_pair: entry.readingPair,
        meaning_pair: entry.meaningPair ?? null,
        score: typeof entry.score === "number" && Number.isFinite(entry.score) ? entry.score : null,
        reason: entry.reason.trim(),
        source: entry.source,
        created_at: entry.createdAt.trim(),
        updated_at: new Date().toISOString()
      }
    ])
  });
}

export async function removeLikedNameEntry(sessionId: string, likedId: string): Promise<void> {
  const encodedSession = buildSessionFilter(sessionId);
  const encodedLikedId = encodeURIComponent(`eq.${likedId.trim()}`);
  await callSupabase(
    `/rest/v1/name_liked_entries?session_id=${encodedSession}&liked_id=${encodedLikedId}`,
    {
      method: "DELETE"
    }
  );
}
