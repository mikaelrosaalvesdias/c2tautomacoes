import { NextRequest, NextResponse } from "next/server";
import { ensureApiSession, getLimit, serverErrorResponse } from "@/lib/api-helpers";
import { fetchTableRows } from "@/lib/nocodb";
import { can } from "@/lib/authorize";
import { getRecordEmpresa } from "@/lib/record-utils";

export async function GET(request: NextRequest) {
  const auth = ensureApiSession(request);
  if (auth.response) return auth.response;

  const session = auth.session;
  const allowed = await can(session, "emails", "view");
  if (!allowed) {
    return NextResponse.json({ error: "Sem permissão" }, { status: 403 });
  }

  try {
    const limit = getLimit(request, 50);
    const rows = await fetchTableRows("emails_comercial", { limit: Math.min(limit * 4, 200) });

    const items = session.role === "admin"
      ? rows.slice(0, limit)
      : rows
          .filter((r) => session.empresas.includes(getRecordEmpresa(r) as "inka" | "californiatv"))
          .slice(0, limit);

    return NextResponse.json({ items });
  } catch (error) {
    return serverErrorResponse(error);
  }
}
