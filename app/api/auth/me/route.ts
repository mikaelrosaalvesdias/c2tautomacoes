import { NextRequest, NextResponse } from "next/server";
import { requireApiAuth } from "@/lib/auth";

export async function GET(request: NextRequest) {
  const session = requireApiAuth(request);
  if (!session) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  return NextResponse.json({
    sub: session.sub,
    email: session.email,
    nome: session.nome,
    role: session.role,
    empresas: session.empresas
  });
}
