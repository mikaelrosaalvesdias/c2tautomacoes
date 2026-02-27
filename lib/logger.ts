/**
 * Structured logger with redaction of sensitive fields.
 * Never logs: cookies, tokens, passwords, SESSION_SECRET, xc-token, email content bodies.
 */

const REDACTED = "[REDACTED]";

const SENSITIVE_KEYS = new Set([
  "password",
  "password_hash",
  "senha",
  "token",
  "cookie",
  "session",
  "secret",
  "xc-token",
  "authorization",
  "x-auth-token",
  "SESSION_SECRET",
  "NOCODB_XC_TOKEN",
  "APP_ADMIN_PASS",
  "conteudo",
  "content",
  "body",
  "html",
  "text"
]);

function isSensitiveKey(key: string): boolean {
  const lower = key.toLowerCase();
  return SENSITIVE_KEYS.has(lower) || lower.includes("pass") || lower.includes("token") || lower.includes("secret") || lower.includes("cookie");
}

function redact(obj: unknown, depth = 0): unknown {
  if (depth > 5) return obj;
  if (obj === null || typeof obj !== "object") return obj;
  if (Array.isArray(obj)) return obj.map((v) => redact(v, depth + 1));

  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(obj as Record<string, unknown>)) {
    result[key] = isSensitiveKey(key) ? REDACTED : redact(value, depth + 1);
  }
  return result;
}

function formatMessage(level: string, message: string, meta?: unknown): string {
  const timestamp = new Date().toISOString();
  const redacted = meta !== undefined ? redact(meta) : undefined;
  const metaStr = redacted !== undefined ? ` ${JSON.stringify(redacted)}` : "";
  return `[${timestamp}] [${level}] ${message}${metaStr}`;
}

export const logger = {
  info(message: string, meta?: unknown): void {
    console.log(formatMessage("INFO", message, meta));
  },
  warn(message: string, meta?: unknown): void {
    console.warn(formatMessage("WARN", message, meta));
  },
  error(message: string, meta?: unknown): void {
    const safeMessage = meta instanceof Error
      ? `${meta.name}: ${meta.message}`
      : undefined;
    console.error(formatMessage("ERROR", message, safeMessage ?? meta));
  },
  audit(action: string, meta: { email?: string; resource?: string; resourceId?: string; empresa?: string; ip?: string; userAgent?: string; success?: boolean }): void {
    console.log(formatMessage("AUDIT", action, { ...meta, password: undefined, token: undefined }));
  }
};
