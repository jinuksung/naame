import {
  FreeRecommendInput,
  FreeRecommendResponse,
  SurnameHanjaOptionsResponse
} from "@/types/recommend";

const API_BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

function withBasePath(path: string): string {
  return `${API_BASE_PATH}${path}`;
}

function isValidResponse(value: unknown): value is FreeRecommendResponse {
  if (!value || typeof value !== "object") {
    return false;
  }
  const results = (value as FreeRecommendResponse).results;
  if (!Array.isArray(results)) {
    return false;
  }
  return results.every((item) => {
    if (!item || typeof item !== "object") {
      return false;
    }
    const result = item as FreeRecommendResponse["results"][number];
    return (
      typeof result.nameHangul === "string" &&
      Array.isArray(result.hanjaPair) &&
      result.hanjaPair.length === 2 &&
      typeof result.hanjaPair[0] === "string" &&
      typeof result.hanjaPair[1] === "string" &&
      Array.isArray(result.readingPair) &&
      result.readingPair.length === 2 &&
      typeof result.readingPair[0] === "string" &&
      typeof result.readingPair[1] === "string" &&
      Array.isArray(result.meaningKwPair) &&
      result.meaningKwPair.length === 2 &&
      typeof result.meaningKwPair[0] === "string" &&
      typeof result.meaningKwPair[1] === "string" &&
      typeof result.score === "number" &&
      Number.isFinite(result.score) &&
      Array.isArray(result.reasons)
    );
  });
}

function isValidSurnameHanjaOptionsResponse(value: unknown): value is SurnameHanjaOptionsResponse {
  if (!value || typeof value !== "object") {
    return false;
  }

  const response = value as SurnameHanjaOptionsResponse;
  if (typeof response.surnameReading !== "string") {
    return false;
  }
  if (!Array.isArray(response.options)) {
    return false;
  }
  if (!(typeof response.autoSelectedHanja === "string" || response.autoSelectedHanja === null)) {
    return false;
  }

  return response.options.every((option) => {
    if (!option || typeof option !== "object") {
      return false;
    }
    return (
      typeof option.hanja === "string" &&
      typeof option.isDefault === "boolean" &&
      typeof option.popularityRank === "number" &&
      Number.isFinite(option.popularityRank)
    );
  });
}

export async function fetchSurnameHanjaOptions(
  surnameReading: string,
  signal?: AbortSignal
): Promise<SurnameHanjaOptionsResponse> {
  const reading = surnameReading.trim();
  if (!reading) {
    return {
      surnameReading: "",
      options: [],
      autoSelectedHanja: null
    };
  }

  const response = await fetch(
    withBasePath(`/api/surname/options?reading=${encodeURIComponent(reading)}`),
    {
      method: "GET",
      cache: "no-store",
      signal
    }
  );

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`[api] surname options failed: ${response.status} ${text}`);
  }

  const data = (await response.json()) as unknown;
  if (!isValidSurnameHanjaOptionsResponse(data)) {
    throw new Error("[api] invalid surname options response");
  }
  return data;
}

export async function fetchFreeRecommendations(
  input: FreeRecommendInput
): Promise<FreeRecommendResponse> {
  const response = await fetch(withBasePath("/api/recommend/free"), {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    cache: "no-store",
    body: JSON.stringify(input)
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`[api] free recommend failed: ${response.status} ${text}`);
  }

  const data = (await response.json()) as unknown;
  if (!isValidResponse(data)) {
    throw new Error("[api] invalid response shape");
  }

  return {
    results: data.results.slice(0, 5)
  };
}

export async function submitNameFeedback(input: {
  surnameHangul: string;
  surnameHanja: string;
  nameHangul: string;
  hanjaPair: [string, string];
  vote: "like" | "dislike";
}): Promise<void> {
  const response = await fetch(withBasePath("/api/feedback/name"), {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    cache: "no-store",
    body: JSON.stringify(input)
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`[api] feedback submit failed: ${response.status} ${text}`);
  }
}
