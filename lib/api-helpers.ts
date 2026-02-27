import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { requireApiAuth } from "@/lib/auth";

export function getLimit(request: NextRequest, defaultValue = 50): number {
  const value = request.nextUrl.searchParams.get("limit");
  const parsed = Number.parseInt(value || String(defaultValue), 10);
  if (Number.isNaN(parsed)) {
    return defaultValue;
  }
  return Math.min(Math.max(parsed, 1), 200);
}

export function ensureApiSession(request: NextRequest) {
  const session = requireApiAuth(request);
  if (!session) {
    return {
      session: null,
      response: NextResponse.json({ error: "Nao autenticado" }, { status: 401 })
    };
  }

  return { session, response: null };
}

export function serverErrorResponse(error: unknown) {
  const message = error instanceof Error ? error.message : "Erro interno";
  return NextResponse.json({ error: message }, { status: 500 });
}
