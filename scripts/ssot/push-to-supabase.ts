import {
  readManifestRowsByTable,
  resolveSupabaseConfig,
  SSOT_DATASET_SPECS,
  totalPayloadCharsByTable,
} from "./common";

function toChunkSize(): number {
  const raw = process.env.SUPABASE_SSOT_PUSH_CHUNK_SIZE?.trim();
  if (!raw) {
    return 500;
  }
  const parsed = Number(raw);
  if (!Number.isFinite(parsed)) {
    return 500;
  }
  return Math.max(50, Math.floor(parsed));
}

function chunkArray<T>(values: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < values.length; i += size) {
    out.push(values.slice(i, i + size));
  }
  return out;
}

async function pushRows(): Promise<void> {
  const config = resolveSupabaseConfig();
  const rowsByTable = await readManifestRowsByTable();
  const chunkSize = toChunkSize();
  let totalChunks = 0;
  let totalRows = 0;

  for (const spec of SSOT_DATASET_SPECS) {
    const table = spec.table;
    const rows = rowsByTable.get(table) ?? [];
    totalRows += rows.length;

    const deleteResponse = await fetch(`${config.baseUrl}/rest/v1/${table}?row_index=gte.0`, {
      method: "DELETE",
      headers: {
        apikey: config.serviceRoleKey,
        Authorization: `Bearer ${config.serviceRoleKey}`,
        Prefer: "return=minimal",
      },
    });

    if (!deleteResponse.ok) {
      const body = await deleteResponse.text();
      throw new Error(`[ssot:push] delete failed table=${table}: ${deleteResponse.status} ${body}`);
    }

    const chunks = chunkArray(rows, chunkSize);
    totalChunks += chunks.length;
    const endpoint = `${config.baseUrl}/rest/v1/${table}?on_conflict=row_index`;
    for (const [index, chunk] of chunks.entries()) {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          apikey: config.serviceRoleKey,
          Authorization: `Bearer ${config.serviceRoleKey}`,
          Prefer: "resolution=merge-duplicates,return=minimal",
        },
        body: JSON.stringify(chunk),
      });

      if (!response.ok) {
        const body = await response.text();
        throw new Error(
          `[ssot:push] upsert failed table=${table} chunk=${index + 1}: ${response.status} ${body}`,
        );
      }
    }
  }

  console.log(`[ssot:push] tables=${SSOT_DATASET_SPECS.length} rows=${totalRows}`);
  console.log(`[ssot:push] chunkSize=${chunkSize} chunks=${totalChunks}`);
  console.log(`[ssot:push] totalPayloadChars=${totalPayloadCharsByTable(rowsByTable)}`);
  for (const spec of SSOT_DATASET_SPECS) {
    const count = (rowsByTable.get(spec.table) ?? []).length;
    console.log(`[ssot:push] ${spec.table}: ${count} rows`);
  }
}

pushRows().catch((error) => {
  console.error(error);
  process.exit(1);
});
