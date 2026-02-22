import { analyzeNameBlockSyllableRule } from "@namefit/engine/lib/nameBlockSyllableRule";

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

interface NameBlockSyllableRuleRow {
  s1_jung: string;
  s1_jong: string | null;
  s1_has_jong: boolean;
  s2_jung: string;
  s2_jong: string | null;
  s2_has_jong: boolean;
  note: string;
}

function buildSupabaseFilter(column: string, value: string | boolean | null): string {
  if (value === null) {
    return `${column}=is.null`;
  }
  return `${column}=eq.${encodeURIComponent(String(value))}`;
}

function buildNameBlockSyllableRuleRow(rawNameHangul: string): NameBlockSyllableRuleRow {
  const analyzed = analyzeNameBlockSyllableRule(rawNameHangul);
  if (!analyzed) {
    throw new Error("invalid 2-syllable hangul name");
  }

  const s1JongLabel = analyzed.s1.jong ?? "없음";
  const s2JongLabel = analyzed.s2.jong ?? "없음";
  return {
    s1_jung: analyzed.s1.jung,
    s1_jong: analyzed.s1.jong,
    s1_has_jong: analyzed.s1.hasJong,
    s2_jung: analyzed.s2.jung,
    s2_jong: analyzed.s2.jong,
    s2_has_jong: analyzed.s2.hasJong,
    note: `[local-admin] ${analyzed.nameHangul} / 1음절 중성:${analyzed.s1.jung} 종성:${s1JongLabel} 받침:${analyzed.s1.hasJong ? "Y" : "N"} / 2음절 중성:${analyzed.s2.jung} 종성:${s2JongLabel} 받침:${analyzed.s2.hasJong ? "Y" : "N"}`,
  };
}

async function hasNameBlockSyllableRule(
  config: SupabaseConfig,
  row: Omit<NameBlockSyllableRuleRow, "note">,
): Promise<boolean> {
  const filters = [
    "select=id",
    "limit=1",
    buildSupabaseFilter("s1_jung", row.s1_jung),
    buildSupabaseFilter("s1_jong", row.s1_jong),
    buildSupabaseFilter("s1_has_jong", row.s1_has_jong),
    buildSupabaseFilter("s2_jung", row.s2_jung),
    buildSupabaseFilter("s2_jong", row.s2_jong),
    buildSupabaseFilter("s2_has_jong", row.s2_has_jong),
  ];
  const endpoint = `${config.baseUrl}/rest/v1/ssot_name_block_syllable_rules?${filters.join("&")}`;
  const response = await fetch(endpoint, {
    method: "GET",
    headers: buildHeaders(config),
    cache: "no-store",
  });
  if (!response.ok) {
    const body = await readTextSafely(response);
    throw new Error(`[ssot-admin] syllable-rule lookup failed: ${response.status} ${body}`);
  }
  const rows = (await response.json()) as unknown;
  return Array.isArray(rows) && rows.length > 0;
}

export async function addNameBlockSyllableRule(rawNameHangul: string): Promise<{ inserted: boolean }> {
  const row = buildNameBlockSyllableRuleRow(rawNameHangul);
  const config = resolveSupabaseConfig();
  if (
    await hasNameBlockSyllableRule(config, {
      s1_jung: row.s1_jung,
      s1_jong: row.s1_jong,
      s1_has_jong: row.s1_has_jong,
      s2_jung: row.s2_jung,
      s2_jong: row.s2_jong,
      s2_has_jong: row.s2_has_jong,
    })
  ) {
    return { inserted: false };
  }

  const endpoint = `${config.baseUrl}/rest/v1/ssot_name_block_syllable_rules`;
  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      ...buildHeaders(config),
      Prefer: "return=minimal",
    },
    cache: "no-store",
    body: JSON.stringify(row),
  });
  if (!response.ok) {
    const body = await readTextSafely(response);
    throw new Error(`[ssot-admin] syllable-rule insert failed: ${response.status} ${body}`);
  }

  return { inserted: true };
}
