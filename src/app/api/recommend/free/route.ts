import { NextResponse } from "next/server";
import { buildMockResults } from "@/lib/mock";
import { FreeRecommendInput, FreeRecommendResponse } from "@/types/recommend";

interface RawPayload {
  surnameHangul?: unknown;
  birth?: {
    calendar?: unknown;
    date?: unknown;
    time?: unknown;
  };
  gender?: unknown;
}

function isGender(value: unknown): value is FreeRecommendInput["gender"] {
  return value === "MALE" || value === "FEMALE" || value === "UNISEX";
}

function toInput(payload: RawPayload): FreeRecommendInput | null {
  const surnameHangul = typeof payload.surnameHangul === "string" ? payload.surnameHangul.trim() : "";
  const calendar = payload.birth?.calendar;
  const date = typeof payload.birth?.date === "string" ? payload.birth.date : "";
  const time = typeof payload.birth?.time === "string" ? payload.birth.time : undefined;

  if (surnameHangul.length < 1 || surnameHangul.length > 2) {
    return null;
  }
  if (calendar !== "SOLAR") {
    return null;
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return null;
  }
  if (!isGender(payload.gender)) {
    return null;
  }
  if (time && !/^\d{2}:\d{2}$/.test(time)) {
    return null;
  }

  return {
    surnameHangul,
    birth: {
      calendar: "SOLAR",
      date,
      time
    },
    gender: payload.gender
  };
}

function isValidResponse(data: unknown): data is FreeRecommendResponse {
  if (!data || typeof data !== "object") {
    return false;
  }
  const results = (data as FreeRecommendResponse).results;
  if (!Array.isArray(results)) {
    return false;
  }
  return results.every((item) => {
    if (!item || typeof item !== "object") {
      return false;
    }
    return (
      typeof item.nameHangul === "string" &&
      Array.isArray(item.hanjaPair) &&
      item.hanjaPair.length === 2 &&
      typeof item.hanjaPair[0] === "string" &&
      typeof item.hanjaPair[1] === "string" &&
      Array.isArray(item.reasons)
    );
  });
}

export async function POST(request: Request): Promise<NextResponse> {
  let payload: RawPayload;
  try {
    payload = (await request.json()) as RawPayload;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const input = toInput(payload);
  if (!input) {
    return NextResponse.json({ error: "Invalid request payload" }, { status: 400 });
  }

  const upstreamUrl = process.env.FREE_RECOMMEND_UPSTREAM_URL;
  if (upstreamUrl) {
    try {
      const upstreamResponse = await fetch(upstreamUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(input),
        cache: "no-store"
      });

      if (upstreamResponse.ok) {
        const data = (await upstreamResponse.json()) as unknown;
        if (isValidResponse(data)) {
          return NextResponse.json({ results: data.results.slice(0, 5) });
        }
      } else {
        console.error(
          `[api/recommend/free] upstream status=${upstreamResponse.status} fallback to mock`
        );
      }
    } catch (error) {
      console.error("[api/recommend/free] upstream fetch failed, fallback to mock", error);
    }
  }

  return NextResponse.json({
    results: buildMockResults(input)
  } satisfies FreeRecommendResponse);
}
