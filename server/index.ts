import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, "../.env.local") });

const app = express();
const PORT = parseInt(process.env.SERVER_PORT ?? "3001", 10);

const NOCO_BASE_URL = (process.env.NOCODB_BASE_URL ?? "").replace(/\/$/, "");
const NOCO_TOKEN = process.env.NOCODB_XC_TOKEN ?? "";
const NOCO_BASE_ID = process.env.NOCODB_BASE_ID ?? "";

if (!NOCO_BASE_URL || !NOCO_TOKEN || !NOCO_BASE_ID) {
  console.error("❌ Variáveis NOCODB_BASE_URL, NOCODB_XC_TOKEN e NOCODB_BASE_ID são obrigatórias em .env.local");
  process.exit(1);
}

app.use(cors());
app.use(express.json());

// ── Table ID Resolution ──────────────────────────────────────────────────────
// NocoDB v2 requires internal table IDs (md_xxxxx), not names.
let tableMapPromise: Promise<Map<string, string>> | null = null;

async function fetchTableMap(): Promise<Map<string, string>> {
  const url = `${NOCO_BASE_URL}/api/v2/meta/bases/${NOCO_BASE_ID}/tables`;
  const res = await fetch(url, { headers: { "xc-token": NOCO_TOKEN } });
  if (!res.ok) throw new Error(`NocoDB meta ${res.status}: ${await res.text().catch(() => "")}`);
  const data = (await res.json()) as { list?: { id?: string; title?: string; table_name?: string }[] };
  const map = new Map<string, string>();
  for (const t of data.list ?? []) {
    if (!t.id) continue;
    if (t.title) map.set(t.title.toLowerCase(), t.id);
    if (t.table_name) map.set(t.table_name.toLowerCase(), t.id);
  }
  console.log(`✅ Tabelas resolvidas: ${[...map.entries()].map(([k, v]) => `${k}=${v}`).join(", ")}`);
  return map;
}

async function resolveTable(name: string): Promise<string> {
  if (!tableMapPromise) {
    tableMapPromise = fetchTableMap().catch((err) => {
      tableMapPromise = null;
      throw err;
    });
  }
  const map = await tableMapPromise;
  return map.get(name.toLowerCase()) ?? name;
}

// ── NocoDB HTTP helpers ──────────────────────────────────────────────────────
async function nocoFetch(tableName: string, params?: URLSearchParams): Promise<unknown> {
  const tableId = await resolveTable(tableName);
  const qs = params?.toString() ? `?${params}` : "";
  const url = `${NOCO_BASE_URL}/api/v1/db/data/v1/${NOCO_BASE_ID}/${tableId}${qs}`;
  const res = await fetch(url, { headers: { "xc-token": NOCO_TOKEN } });
  if (!res.ok) throw new Error(`NocoDB ${res.status}: ${(await res.text()).slice(0, 200)}`);
  return res.json();
}

async function nocoFetchById(tableName: string, id: string): Promise<unknown> {
  const tableId = await resolveTable(tableName);
  const url = `${NOCO_BASE_URL}/api/v1/db/data/v1/${NOCO_BASE_ID}/${tableId}/${encodeURIComponent(id)}`;
  const res = await fetch(url, { headers: { "xc-token": NOCO_TOKEN } });
  if (!res.ok) throw new Error(`NocoDB ${res.status}`);
  return res.json();
}

function buildParams(query: Record<string, unknown>, extra?: Record<string, string>): URLSearchParams {
  const p = new URLSearchParams();
  p.set("limit", String(query.limit ?? 100));
  p.set("offset", String(query.offset ?? 0));
  p.set("sort", "-created_at");
  if (extra) {
    for (const [k, v] of Object.entries(extra)) p.set(k, v);
  }
  return p;
}

// ── Routes ───────────────────────────────────────────────────────────────────

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Inbox — chegada_suporte
app.get("/api/inbox", async (req, res) => {
  try {
    res.json(await nocoFetch("chegada_suporte", buildParams(req.query)));
  } catch (e) {
    res.status(500).json({ error: (e as Error).message });
  }
});

app.get("/api/inbox/:id", async (req, res) => {
  try {
    res.json(await nocoFetchById("chegada_suporte", req.params.id));
  } catch (e) {
    res.status(500).json({ error: (e as Error).message });
  }
});

// Ações — acoes_automacao
app.get("/api/acoes", async (req, res) => {
  try {
    res.json(await nocoFetch("acoes_automacao", buildParams(req.query)));
  } catch (e) {
    res.status(500).json({ error: (e as Error).message });
  }
});

app.get("/api/acoes/:id", async (req, res) => {
  try {
    res.json(await nocoFetchById("acoes_automacao", req.params.id));
  } catch (e) {
    res.status(500).json({ error: (e as Error).message });
  }
});

// Emails — emails_comercial
app.get("/api/emails", async (req, res) => {
  try {
    res.json(await nocoFetch("emails_comercial", buildParams(req.query)));
  } catch (e) {
    res.status(500).json({ error: (e as Error).message });
  }
});

app.get("/api/emails/:id", async (req, res) => {
  try {
    res.json(await nocoFetchById("emails_comercial", req.params.id));
  } catch (e) {
    res.status(500).json({ error: (e as Error).message });
  }
});

// Cancelamentos — acoes_automacao filtrado por acao contendo "cancel"
app.get("/api/cancelamentos", async (req, res) => {
  try {
    res.json(
      await nocoFetch(
        "acoes_automacao",
        buildParams(req.query, { where: "(acao,like,%cancel%)" })
      )
    );
  } catch (e) {
    res.status(500).json({ error: (e as Error).message });
  }
});

// ── Static files (produção) ──────────────────────────────────────────────────
const distDir = path.resolve(__dirname, "../dist/public");
app.use(express.static(distDir));
app.get("*", (_req, res) => res.sendFile(path.join(distDir, "index.html")));

// ── Start ────────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`🚀 Server: http://localhost:${PORT}`);
  console.log(`📊 NocoDB: ${NOCO_BASE_URL} | Base: ${NOCO_BASE_ID}`);
  // Pre-warm table ID cache
  resolveTable("chegada_suporte").catch(() => {});
});
