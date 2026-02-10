import { FreeRecommendInput, FreeRecommendResponse } from "@/types/recommend";

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
      Array.isArray(result.reasons)
    );
  });
}

export async function fetchFreeRecommendations(
  input: FreeRecommendInput
): Promise<FreeRecommendResponse> {
  const response = await fetch("/api/recommend/free", {
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
