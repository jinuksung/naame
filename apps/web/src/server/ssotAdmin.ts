interface SupabaseConfig {
  baseUrl: string;
  serviceRoleKey: string;
}

async function readTextSafely(response: Response): Promise<string> {
  try {
    return await response.text();
  } catch {
    return "";
  }
}

function resolveSupabaseConfig(): SupabaseConfig {
  const baseUrl = process.env.SUPABASE_URL?.trim() ?? "";
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim() ?? "";
  if (!baseUrl || !serviceRoleKey) {
    throw new Error("ssot admin env is missing");
  }
  return {
    baseUrl: baseUrl.replace(/\/+$/, ""),
    serviceRoleKey,
  };
}

function buildHeaders(config: SupabaseConfig): HeadersInit {
  return {
    "Content-Type": "application/json",
    apikey: config.serviceRoleKey,
    Authorization: `Bearer ${config.serviceRoleKey}`,
  };
}

function normalizeSingleChar(value: string): string {
  return Array.from(value.trim().normalize("NFC")).slice(0, 1).join("");
}

export async function markCharAsNotInmyong(rawChar: string): Promise<void> {
  const char = normalizeSingleChar(rawChar);
  if (!char) {
    throw new Error("invalid hanja char");
  }

  const config = resolveSupabaseConfig();
  const endpoint = `${config.baseUrl}/rest/v1/ssot_hanname_master?char=eq.${encodeURIComponent(char)}`;
  const response = await fetch(endpoint, {
    method: "PATCH",
    headers: {
      ...buildHeaders(config),
      Prefer: "return=minimal",
    },
    cache: "no-store",
    body: JSON.stringify({ is_inmyong: false }),
  });

  if (!response.ok) {
    const body = await readTextSafely(response);
    throw new Error(`[ssot-admin] not-inmyong update failed: ${response.status} ${body}`);
  }
}

async function hasBlacklistWord(config: SupabaseConfig, word: string): Promise<boolean> {
  const endpoint = `${config.baseUrl}/rest/v1/ssot_blacklist_words?select=id&pattern=eq.${encodeURIComponent(word)}&limit=1`;
  const response = await fetch(endpoint, {
    method: "GET",
    headers: buildHeaders(config),
    cache: "no-store",
  });
  if (!response.ok) {
    const body = await readTextSafely(response);
    throw new Error(`[ssot-admin] blacklist lookup failed: ${response.status} ${body}`);
  }
  const rows = (await response.json()) as unknown;
  return Array.isArray(rows) && rows.length > 0;
}

export async function addBlacklistWord(rawWord: string): Promise<{ inserted: boolean }> {
  const word = rawWord.trim().normalize("NFC");
  if (!word) {
    throw new Error("invalid blacklist word");
  }

  const config = resolveSupabaseConfig();
  if (await hasBlacklistWord(config, word)) {
    return { inserted: false };
  }

  const endpoint = `${config.baseUrl}/rest/v1/ssot_blacklist_words`;
  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      ...buildHeaders(config),
      Prefer: "return=minimal",
    },
    cache: "no-store",
    body: JSON.stringify({ pattern: word }),
  });
  if (!response.ok) {
    const body = await readTextSafely(response);
    throw new Error(`[ssot-admin] blacklist insert failed: ${response.status} ${body}`);
  }

  return { inserted: true };
}
