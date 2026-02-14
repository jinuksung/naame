import type { FreeRecommendResultItem } from "@/types/recommend";
import {
  buildFeedbackNameKey,
  type NameFeedbackStatsMap,
} from "./feedbackScoring";

export type FeedbackVoteType = "like" | "dislike";

interface RecordFeedbackVoteInput {
  nameHangul: string;
  hanjaPair: [string, string];
  vote: FeedbackVoteType;
}

interface FeedbackStatRow {
  name_key: string;
  likes: number | null;
  dislikes: number | null;
}

function resolveSupabaseConfig(): {
  baseUrl: string;
  serviceRoleKey: string;
} {
  const baseUrl = process.env.SUPABASE_URL?.trim() ?? "";
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim() ?? "";
  if (!baseUrl || !serviceRoleKey) {
    throw new Error("supabase feedback env is missing");
  }
  return {
    baseUrl: baseUrl.replace(/\/+$/, ""),
    serviceRoleKey,
  };
}

function toInt(value: number | null): number {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return 0;
  }
  return Math.max(0, Math.round(value));
}

export function isSupabaseFeedbackEnabled(): boolean {
  return Boolean(process.env.SUPABASE_URL?.trim()) && Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY?.trim());
}

async function callSupabaseRpc<ResponseShape>(
  functionName: string,
  payload: Record<string, unknown>,
): Promise<ResponseShape> {
  const config = resolveSupabaseConfig();

  const response = await fetch(`${config.baseUrl}/rest/v1/rpc/${functionName}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      apikey: config.serviceRoleKey,
      Authorization: `Bearer ${config.serviceRoleKey}`,
    },
    body: JSON.stringify(payload),
    cache: "no-store",
  });

  if (!response.ok) {
    const bodyText = await response.text();
    throw new Error(`[feedback] supabase rpc failed: ${response.status} ${bodyText}`);
  }

  if (response.status === 204) {
    return undefined as ResponseShape;
  }

  return (await response.json()) as ResponseShape;
}

export async function getFeedbackStatsMap(
  items: Array<Pick<FreeRecommendResultItem, "nameHangul" | "hanjaPair">>,
): Promise<NameFeedbackStatsMap> {
  const keySet = new Set<string>();
  for (const item of items) {
    keySet.add(buildFeedbackNameKey(item));
  }
  const keys = Array.from(keySet);
  if (keys.length === 0 || !isSupabaseFeedbackEnabled()) {
    return new Map();
  }

  const rows = await callSupabaseRpc<FeedbackStatRow[]>("get_name_feedback_stats", {
    name_keys: keys,
  });

  const map: NameFeedbackStatsMap = new Map();
  for (const row of rows ?? []) {
    if (!row || typeof row.name_key !== "string") {
      continue;
    }
    map.set(row.name_key, {
      likes: toInt(row.likes),
      dislikes: toInt(row.dislikes),
    });
  }
  return map;
}

export async function recordFeedbackVote({
  nameHangul,
  hanjaPair,
  vote,
}: RecordFeedbackVoteInput): Promise<void> {
  if (!isSupabaseFeedbackEnabled()) {
    throw new Error("supabase feedback is not enabled");
  }

  const item = {
    nameHangul,
    hanjaPair,
  };
  const nameKey = buildFeedbackNameKey(item);
  await callSupabaseRpc<unknown>("record_name_feedback_vote", {
    p_name_key: nameKey,
    p_name_hangul: nameHangul.trim(),
    p_vote: vote,
  });
}
