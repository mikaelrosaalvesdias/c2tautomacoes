/**
 * NocoDB CRUD for admin tables:
 * - usuarios
 * - user_access
 * - sessions
 * - audit_logs
 *
 * All calls are server-side only. NOCODB_XC_TOKEN is never sent to the client.
 */

import { logger } from "@/lib/logger";

// ── Types ─────────────────────────────────────────────────────────────────────

export type UserRole = "admin" | "manager" | "viewer";
export type Empresa = "inka" | "californiatv";

export type NcUser = {
  Id: number;
  email: string;
  nome: string;
  password_hash: string;
  status: boolean;
  role: UserRole;
  force_password_reset?: boolean;
  created_at?: string;
  updated_at?: string;
};

export type NcUserAccess = {
  Id: number;
  user_id: number;
  empresa: Empresa;
  can_view_dashboard: boolean;
  can_view_inbox: boolean;
  can_view_acoes: boolean;
  can_view_cancelamentos: boolean;
  can_view_emails: boolean;
  can_edit_inbox: boolean;
  can_edit_acoes: boolean;
  can_manage_users: boolean;
};

export type NcSession = {
  Id: number;
  session_id: string;
  user_id: number;
  expires_at: string;
  created_at: string;
  last_seen_at: string;
  ip?: string;
  user_agent?: string;
};

export type AuditLogEntry = {
  user_email: string;
  action: string;
  resource: string;
  resource_id?: string;
  empresa?: string;
  ip?: string;
  user_agent?: string;
};

// ── NocoDB table names ─────────────────────────────────────────────────────────

const TABLES = {
  usuarios: "usuarios",
  user_access: "user_access",
  sessions: "sessions",
  audit_logs: "audit_logs"
} as const;

// ── HTTP helper ───────────────────────────────────────────────────────────────

function getBaseUrl(): string {
  const url = process.env.NOCODB_BASE_URL?.trim();
  if (!url) throw new Error("NOCODB_BASE_URL não configurado");
  return url.replace(/\/$/, "");
}

function getToken(): string {
  const token = process.env.NOCODB_XC_TOKEN?.trim();
  if (!token) throw new Error("NOCODB_XC_TOKEN não configurado");
  return token;
}

function getBaseId(): string {
  const id = process.env.NOCODB_BASE_ID?.trim();
  if (!id) throw new Error("NOCODB_BASE_ID não configurado");
  return id;
}

function tableUrl(tableName: string, rowId?: number | string): string {
  const base = `${getBaseUrl()}/api/v1/db/data/v1/${getBaseId()}/${tableName}`;
  return rowId !== undefined ? `${base}/${rowId}` : base;
}

async function nocoRequest<T>(
  url: string,
  options: RequestInit = {}
): Promise<T> {
  const response = await fetch(url, {
    ...options,
    cache: "no-store",
    headers: {
      "xc-token": getToken(),
      "Content-Type": "application/json",
      ...(options.headers as Record<string, string> ?? {})
    }
  });

  if (!response.ok) {
    const text = await response.text().catch(() => "");
    throw new Error(`NocoDB ${response.status}: ${text.slice(0, 200)}`);
  }

  if (response.status === 204) return undefined as T;
  return response.json() as Promise<T>;
}

type NocoListResponse<T> = { list?: T[]; pageInfo?: unknown };

async function listRows<T>(tableName: string, where?: string, limit = 200): Promise<T[]> {
  const params = new URLSearchParams({ limit: String(limit) });
  if (where) params.set("where", where);
  const url = `${tableUrl(tableName)}?${params.toString()}`;

  try {
    const result = await nocoRequest<NocoListResponse<T>>(url);
    return result.list ?? [];
  } catch (error) {
    logger.error(`[nocodb-admin] listRows ${tableName}: ${(error as Error).message}`);
    throw error;
  }
}

async function createRow<T>(tableName: string, data: Partial<T>): Promise<T> {
  return nocoRequest<T>(tableUrl(tableName), {
    method: "POST",
    body: JSON.stringify(data)
  });
}

async function updateRow<T>(tableName: string, rowId: number | string, data: Partial<T>): Promise<T> {
  return nocoRequest<T>(tableUrl(tableName, rowId), {
    method: "PATCH",
    body: JSON.stringify(data)
  });
}

async function deleteRow(tableName: string, rowId: number | string): Promise<void> {
  await nocoRequest<void>(tableUrl(tableName, rowId), { method: "DELETE" });
}

// ── Usuarios ──────────────────────────────────────────────────────────────────

export async function getUserByEmail(email: string): Promise<NcUser | null> {
  const lower = email.toLowerCase().trim();
  const rows = await listRows<NcUser>(TABLES.usuarios, `(email,eq,${lower})`, 1);
  return rows[0] ?? null;
}

export async function getUserById(id: number): Promise<NcUser | null> {
  try {
    return await nocoRequest<NcUser>(tableUrl(TABLES.usuarios, id));
  } catch {
    return null;
  }
}

export async function listUsers(): Promise<NcUser[]> {
  return listRows<NcUser>(TABLES.usuarios);
}

export async function createUser(data: Omit<NcUser, "Id">): Promise<NcUser> {
  return createRow<NcUser>(TABLES.usuarios, data);
}

export async function updateUser(id: number, data: Partial<Omit<NcUser, "Id" | "email">>): Promise<NcUser> {
  return updateRow<NcUser>(TABLES.usuarios, id, data);
}

// ── User Access ───────────────────────────────────────────────────────────────

export async function getUserAccess(userId: number): Promise<NcUserAccess[]> {
  return listRows<NcUserAccess>(TABLES.user_access, `(user_id,eq,${userId})`);
}

export async function getUserAccessByEmpresa(userId: number, empresa: Empresa): Promise<NcUserAccess | null> {
  const rows = await listRows<NcUserAccess>(
    TABLES.user_access,
    `(user_id,eq,${userId})~and(empresa,eq,${empresa})`,
    1
  );
  return rows[0] ?? null;
}

export async function upsertUserAccess(userId: number, empresa: Empresa, permissions: Omit<NcUserAccess, "Id" | "user_id" | "empresa">): Promise<NcUserAccess> {
  const existing = await getUserAccessByEmpresa(userId, empresa);
  if (existing) {
    return updateRow<NcUserAccess>(TABLES.user_access, existing.Id, permissions);
  }
  return createRow<NcUserAccess>(TABLES.user_access, { user_id: userId, empresa, ...permissions });
}

// ── Sessions ──────────────────────────────────────────────────────────────────

export async function createSession(data: Omit<NcSession, "Id">): Promise<NcSession> {
  return createRow<NcSession>(TABLES.sessions, data);
}

export async function getSessionById(sessionId: string): Promise<NcSession | null> {
  const rows = await listRows<NcSession>(TABLES.sessions, `(session_id,eq,${sessionId})`, 1);
  return rows[0] ?? null;
}

export async function deleteSession(sessionId: string): Promise<void> {
  const session = await getSessionById(sessionId);
  if (session) {
    await deleteRow(TABLES.sessions, session.Id);
  }
}

export async function touchSession(sessionId: string): Promise<void> {
  const session = await getSessionById(sessionId);
  if (session) {
    await updateRow<NcSession>(TABLES.sessions, session.Id, {
      last_seen_at: new Date().toISOString()
    });
  }
}

export async function deleteExpiredSessions(): Promise<void> {
  try {
    const now = new Date().toISOString();
    const expired = await listRows<NcSession>(TABLES.sessions, `(expires_at,lt,${now})`);
    await Promise.all(expired.map((s) => deleteRow(TABLES.sessions, s.Id)));
  } catch (error) {
    logger.error(`[sessions] Falha ao limpar sessões expiradas: ${(error as Error).message}`);
  }
}

// ── Audit Logs ────────────────────────────────────────────────────────────────

export async function writeAuditLog(entry: AuditLogEntry): Promise<void> {
  try {
    await createRow(TABLES.audit_logs, {
      ...entry,
      created_at: new Date().toISOString()
    });
    logger.audit(entry.action, entry);
  } catch (error) {
    // Audit log failure should not crash the request
    logger.error(`[audit] Falha ao gravar audit log: ${(error as Error).message}`);
  }
}
