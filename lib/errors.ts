import { NextResponse } from "next/server";
import { logger } from "@/lib/logger";

export class ApiError extends Error {
  constructor(
    public readonly statusCode: number,
    message: string,
    public readonly internalMessage?: string
  ) {
    super(message);
    this.name = "ApiError";
  }
}

const PUBLIC_ERROR_MESSAGES: Record<number, string> = {
  400: "Requisição inválida",
  401: "Não autenticado",
  403: "Sem permissão",
  404: "Não encontrado",
  409: "Conflito",
  429: "Muitas tentativas. Tente novamente mais tarde.",
  500: "Erro interno"
};

export function apiErrorResponse(error: unknown): NextResponse {
  if (error instanceof ApiError) {
    if (error.internalMessage) {
      logger.error(`[ApiError] ${error.internalMessage}`, { status: error.statusCode });
    }
    const publicMessage = error.statusCode >= 500
      ? PUBLIC_ERROR_MESSAGES[500]
      : error.message;
    return NextResponse.json({ error: publicMessage }, { status: error.statusCode });
  }

  const message = error instanceof Error ? error.message : "Erro desconhecido";
  logger.error(`[UnhandledError] ${message}`);
  return NextResponse.json({ error: PUBLIC_ERROR_MESSAGES[500] }, { status: 500 });
}

export function notAuthenticated(): NextResponse {
  return NextResponse.json({ error: PUBLIC_ERROR_MESSAGES[401] }, { status: 401 });
}

export function forbidden(): NextResponse {
  return NextResponse.json({ error: PUBLIC_ERROR_MESSAGES[403] }, { status: 403 });
}

export function notFound(resource = "Registro"): NextResponse {
  return NextResponse.json({ error: `${resource} não encontrado` }, { status: 404 });
}

export function badRequest(message?: string): NextResponse {
  return NextResponse.json({ error: message ?? PUBLIC_ERROR_MESSAGES[400] }, { status: 400 });
}

export function conflict(message?: string): NextResponse {
  return NextResponse.json({ error: message ?? PUBLIC_ERROR_MESSAGES[409] }, { status: 409 });
}

export function tooManyRequests(): NextResponse {
  return NextResponse.json({ error: PUBLIC_ERROR_MESSAGES[429] }, { status: 429 });
}
