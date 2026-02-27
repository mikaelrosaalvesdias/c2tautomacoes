import { NextRequest, NextResponse } from "next/server";
import { ensureApiSession, serverErrorResponse } from "@/lib/api-helpers";
import { fetchTableRowById } from "@/lib/nocodb";
import { can } from "@/lib/authorize";
import { getRecordEmpresa } from "@/lib/record-utils";
import type { Empresa } from "@/lib/nocodb-admin";

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const auth = ensureApiSession(request);
  if (auth.response) return auth.response;

  const session = auth.session;

  try {
    const item = await fetchTableRowById("emails_comercial", params.id);
    if (!item) {
      return NextResponse.json({ error: "Registro não encontrado" }, { status: 404 });
    }

    const empresa = getRecordEmpresa(item) as Empresa | "";
    const allowed = await can(session, "emails", "view", empresa || undefined);
    if (!allowed) {
      return NextResponse.json({ error: "Sem permissão" }, { status: 403 });
    }

    return NextResponse.json({ item });
  } catch (error) {
    return serverErrorResponse(error);
  }
}
