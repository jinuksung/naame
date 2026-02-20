import {
  normalizeRawTableRows,
  resolveSupabaseConfig,
  selectColumnsForSpec,
  SSOT_DATASET_SPECS,
  SsotDatasetSpec,
  SupabaseConfig,
  SsotTableRow,
  writeRowsByTableToLocal,
} from "./common";

const SSOT_PULL_INCLUDE_NOT_INMYONG = "SSOT_PULL_INCLUDE_NOT_INMYONG";

function parseBoolean(value: string | undefined): boolean {
  if (!value) {
    return false;
  }
  const normalized = value.trim().toLowerCase();
  return normalized === "1" || normalized === "true" || normalized === "yes";
}

function shouldFilterToInmyong(spec: SsotDatasetSpec): boolean {
  if (spec.dataset !== "hanname_master") {
    return false;
  }
  return !parseBoolean(process.env[SSOT_PULL_INCLUDE_NOT_INMYONG]);
}

export function buildPullEndpoint(
  config: SupabaseConfig,
  spec: SsotDatasetSpec,
  select: string,
  offset: number,
  pageSize: number,
): string {
  const params = new URLSearchParams({
    select,
    order: "row_index.asc",
    offset: String(offset),
    limit: String(pageSize),
  });
  if (shouldFilterToInmyong(spec)) {
    params.set("is_inmyong", "is.true");
  }
  return `${config.baseUrl}/rest/v1/${spec.table}?${params.toString()}`;
}

export async function pullRows(): Promise<void> {
  const config = resolveSupabaseConfig();
  const rowsByTable = new Map<string, SsotTableRow[]>();
  let totalRows = 0;
  if (!parseBoolean(process.env[SSOT_PULL_INCLUDE_NOT_INMYONG])) {
    console.log(
      `[ssot:pull] hanname_master filter enabled (is_inmyong=true). Set ${SSOT_PULL_INCLUDE_NOT_INMYONG}=1 to include false rows.`,
    );
  }

  for (const spec of SSOT_DATASET_SPECS) {
    const select = selectColumnsForSpec(spec);
    const pageSize = 1000;
    const rows: SsotTableRow[] = [];
    let offset = 0;

    while (true) {
      const endpoint = buildPullEndpoint(config, spec, select, offset, pageSize);
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

if (require.main === module) {
  pullRows().catch((error) => {
    console.error(error);
    process.exit(1);
  });
}
