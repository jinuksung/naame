import {
  normalizeRawTableRows,
  resolveSupabaseConfig,
  selectColumnsForSpec,
  SSOT_DATASET_SPECS,
  SsotTableRow,
  writeRowsByTableToLocal,
} from "./common";

async function pullRows(): Promise<void> {
  const config = resolveSupabaseConfig();
  const rowsByTable = new Map<string, SsotTableRow[]>();
  let totalRows = 0;

  for (const spec of SSOT_DATASET_SPECS) {
    const select = encodeURIComponent(selectColumnsForSpec(spec));
    const pageSize = 1000;
    const rows: SsotTableRow[] = [];
    let offset = 0;

    while (true) {
      const endpoint = `${config.baseUrl}/rest/v1/${spec.table}?select=${select}&order=row_index.asc&offset=${offset}&limit=${pageSize}`;
      const response = await fetch(endpoint, {
        method: "GET",
        headers: {
          apikey: config.serviceRoleKey,
          Authorization: `Bearer ${config.serviceRoleKey}`,
        },
      });

      if (!response.ok) {
        const body = await response.text();
        throw new Error(`[ssot:pull] failed table=${spec.table}: ${response.status} ${body}`);
      }

      const payload = (await response.json()) as unknown;
      const pageRows = normalizeRawTableRows(payload);
      rows.push(...pageRows);
      if (pageRows.length < pageSize) {
        break;
      }
      offset += pageSize;
    }

    if (rows.length === 0) {
      throw new Error(`[ssot:pull] missing rows in table=${spec.table}`);
    }
    rowsByTable.set(spec.table, rows);
    totalRows += rows.length;
  }

  const written = await writeRowsByTableToLocal(rowsByTable);
  console.log(`[ssot:pull] tables=${SSOT_DATASET_SPECS.length} rows=${totalRows}`);
  for (const filePath of written) {
    console.log(`[ssot:pull] wrote ${filePath}`);
  }
}

pullRows().catch((error) => {
  console.error(error);
  process.exit(1);
});
