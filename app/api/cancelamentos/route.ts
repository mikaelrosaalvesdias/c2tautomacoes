import { NextRequest, NextResponse } from "next/server";
import { ensureApiSession, getLimit, serverErrorResponse } from "@/lib/api-helpers";
import { fetchTableRows } from "@/lib/nocodb";
import { isCancelAction, getRecordEmpresa } from "@/lib/record-utils";
import { can } from "@/lib/authorize";

export async function GET(request: NextRequest) {
  const auth = ensureApiSession(request);
  if (auth.response) return auth.response;

  const session = auth.session;
  const allowed = await can(session, "cancelamentos", "view");
  if (!allowed) {
    return NextResponse.json({ error: "Sem permissão" }, { status: 403 });
  }

  try {
    const limit = getLimit(request, 50);
    const rows = await fetchTableRows("acoes_automacao", { limit: 200 });

    const filtered = rows.filter(isCancelAction);

    const items = session.role === "admin"
      ? filtered.slice(0, limit)
      : filtered
          .filter((r) => session.empresas.includes(getRecordEmpresa(r) as "inka" | "californiatv"))
          .slice(0, limit);

    return NextResponse.json({ items });
  } catch (error) {
    return serverErrorResponse(error);
  }
}
