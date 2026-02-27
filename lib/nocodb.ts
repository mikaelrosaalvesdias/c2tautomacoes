import { getRecordId, type GenericRecord } from "@/lib/record-utils";

type FetchOptions = {
  limit?: number;
  offset?: number;
  sort?: string;
};

type ParsedNocoResponse = {
  records: GenericRecord[];
  raw: unknown;
};

type NocoTableMeta = {
  id?: string;
  title?: string;
  table_name?: string;
  slug?: string;
};

type NocoMetaResponse = {
  list?: NocoTableMeta[];
};

let tableRefMapPromise: Promise<Map<string, string>> | null = null;

function getEnv(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new Error(`Variavel obrigatoria ausente: ${name}`);
  }
  return value;
}

function normalizePath(path: string): string {
  return path.startsWith("/") ? path : `/${path}`;
}

function extractRecords(payload: unknown): GenericRecord[] {
  if (Array.isArray(payload)) {
    return payload as GenericRecord[];
  }

  if (!payload || typeof payload !== "object") {
    return [];
  }

  const maybeList = (payload as { list?: unknown }).list;
  if (Array.isArray(maybeList)) {
    return maybeList as GenericRecord[];
  }

  const maybeItems = (payload as { items?: unknown }).items;
  if (Array.isArray(maybeItems)) {
    return maybeItems as GenericRecord[];
  }

  const maybeData = (payload as { data?: unknown }).data;
  if (Array.isArray(maybeData)) {
    return maybeData as GenericRecord[];
  }

  return [];
}

function buildCandidateUrls(tableRef: string, query: URLSearchParams, id?: string): string[] {
  const baseUrl = getEnv("NOCODB_BASE_URL").replace(/\/$/, "");
  const baseId = getEnv("NOCODB_BASE_ID");
  const dataPathPrefix = process.env.NOCODB_DATA_PATH_PREFIX?.trim();

  const primaryPath = `/api/v1/db/data/v1/${baseId}/${tableRef}`;
  const fallbackPath = dataPathPrefix
    ? `${normalizePath(dataPathPrefix).replace(/\/$/, "")}/${baseId}/${tableRef}`
    : null;

  const paths = [primaryPath];
  if (fallbackPath && fallbackPath !== primaryPath) {
    paths.push(fallbackPath);
  }

  return paths.map((path) => {
    const fullPath = id ? `${path}/${encodeURIComponent(id)}` : path;
    const queryString = query.toString();
    return queryString ? `${baseUrl}${fullPath}?${queryString}` : `${baseUrl}${fullPath}`;
  });
}

function normalizeName(value: string): string {
  return value.trim().toLowerCase();
}

function getStaticTableOverride(tableName: string): string | null {
  const normalized = normalizeName(tableName);
  const lookup: Record<string, string | undefined> = {
    chegada_suporte: process.env.NOCODB_TABLE_CHEGADA_SUPORTE,
    acoes_automacao: process.env.NOCODB_TABLE_ACOES_AUTOMACAO,
    emails_comercial: process.env.NOCODB_TABLE_EMAILS_COMERCIAL
  };

  const value = lookup[normalized]?.trim();
  return value || null;
}

function getAliasCandidates(tableName: string): string[] {
  const normalized = normalizeName(tableName);
  const aliases: Record<string, string[]> = {
    chegada_suporte: ["chegada_suporte"],
    acoes_automacao: ["acoes_automacao", "acoes_cancelamento"],
    emails_comercial: ["emails_comercial", "acoes_comercial"]
  };

  const base = aliases[normalized] ?? [normalized];
  return Array.from(new Set(base.map(normalizeName)));
}

function registerTableRef(map: Map<string, string>, key: string | undefined, id: string | undefined) {
  if (!key || !id) {
    return;
  }
  map.set(normalizeName(key), id);
}

async function fetchTableRefMap(): Promise<Map<string, string>> {
  const baseUrl = getEnv("NOCODB_BASE_URL").replace(/\/$/, "");
  const baseId = getEnv("NOCODB_BASE_ID");
  const token = getEnv("NOCODB_XC_TOKEN");
  const url = `${baseUrl}/api/v2/meta/bases/${baseId}/tables`;

  const response = await fetch(url, {
    method: "GET",
    cache: "no-store",
    headers: {
      "xc-token": token
    }
  });

  if (!response.ok) {
    const bodyText = await response.text();
    throw new Error(`HTTP ${response.status} - ${bodyText.slice(0, 200)}`);
  }

  const payload = (await response.json()) as NocoMetaResponse;
  const map = new Map<string, string>();

  for (const table of payload.list ?? []) {
    const id = table.id?.trim();
    if (!id) {
      continue;
    }
    registerTableRef(map, table.id, id);
    registerTableRef(map, table.title, id);
    registerTableRef(map, table.table_name, id);
    registerTableRef(map, table.slug, id);
  }

  return map;
}

async function getTableRefMap(): Promise<Map<string, string>> {
  if (!tableRefMapPromise) {
    tableRefMapPromise = fetchTableRefMap().catch((error) => {
      tableRefMapPromise = null;
      throw error;
    });
  }
  return tableRefMapPromise;
}

async function resolveTableRef(tableName: string): Promise<string> {
  const override = getStaticTableOverride(tableName);
  if (override) {
    return override;
  }

  try {
    const tableMap = await getTableRefMap();
    for (const candidate of getAliasCandidates(tableName)) {
      const resolved = tableMap.get(candidate);
      if (resolved) {
        return resolved;
      }
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`[nocodb] Falha ao resolver metadados de tabela: ${message}`);
  }

  return tableName;
}

async function requestNoco(url: string): Promise<ParsedNocoResponse> {
  const token = getEnv("NOCODB_XC_TOKEN");

  const response = await fetch(url, {
    method: "GET",
    cache: "no-store",
    headers: {
      "xc-token": token
    }
  });

  if (!response.ok) {
    const bodyText = await response.text();
    throw new Error(`HTTP ${response.status} - ${bodyText.slice(0, 200)}`);
  }

  const json = (await response.json()) as unknown;
  return {
    records: extractRecords(json),
    raw: json
  };
}

async function fetchWithFallback(tableName: string, query: URLSearchParams, id?: string) {
  const tableRef = await resolveTableRef(tableName);
  const urls = buildCandidateUrls(tableRef, query, id);
  const errors: string[] = [];

  for (const url of urls) {
    try {
      return await requestNoco(url);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      const logMessage = `[nocodb] Falha em ${url}: ${message}`;
      errors.push(logMessage);
      console.error(logMessage);
    }
  }

  throw new Error(errors.join(" | "));
}

export async function fetchTableRows(tableName: string, options: FetchOptions = {}): Promise<GenericRecord[]> {
  const query = new URLSearchParams();
  query.set("limit", String(Math.min(options.limit ?? 50, 200)));
  query.set("offset", String(options.offset ?? 0));
  query.set("sort", options.sort ?? "-created_at");

  const result = await fetchWithFallback(tableName, query);
  return result.records;
}

export async function fetchTableRowById(tableName: string, id: string): Promise<GenericRecord | null> {
  const query = new URLSearchParams();

  try {
    const result = await fetchWithFallback(tableName, query, id);

    if (result.records.length > 0) {
      return result.records[0];
    }

    if (result.raw && typeof result.raw === "object" && !Array.isArray(result.raw)) {
      return result.raw as GenericRecord;
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`[nocodb] Fallback para busca local do ID ${id} em ${tableName}: ${message}`);
  }

  const rows = await fetchTableRows(tableName, { limit: 200 });
  return rows.find((row) => getRecordId(row) === id) ?? null;
}
