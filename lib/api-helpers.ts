import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { requireApiAuth } from "@/lib/auth";
import type { SessionPayload } from "@/lib/auth";

export function getLimit(request: NextRequest, defaultValue = 50): number {
  const value = request.nextUrl.searchParams.get("limit");
  const parsed = Number.parseInt(value || String(defaultValue), 10);
  if (Number.isNaN(parsed)) return defaultValue;
  return Math.min(Math.max(parsed, 1), 200);
}

export function ensureApiSession(request: NextRequest): { session: SessionPayload; response: null } | { session: null; response: NextResponse } {
  const session = requireApiAuth(request);
  if (!session) {
    return {
      session: null,
      response: NextResponse.json({ error: "Não autenticado" }, { status: 401 })
    };
  }
  return { session, response: null };
}

export function serverErrorResponse(error: unknown): NextResponse {
  // Never leak internal error details to the client
  const isKnown = error instanceof Error && error.message.length < 200;
  const clientMessage = isKnown && !containsSensitiveInfo(error.message)
    ? error.message
    : "Erro interno";
  return NextResponse.json({ error: clientMessage }, { status: 500 });
}

/** Rough check to avoid leaking env var values, tokens, etc. */
function containsSensitiveInfo(message: string): boolean {
  const lower = message.toLowerCase();
  return (
    lower.includes("token") ||
    lower.includes("password") ||
    lower.includes("secret") ||
    lower.includes("xc-token") ||
    lower.includes("nocodb_xc")
  );
}

/** Extract client IP from request (respects x-forwarded-for) */
export function getClientIp(request: NextRequest): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }
  return request.headers.get("x-real-ip") ?? "unknown";
}
