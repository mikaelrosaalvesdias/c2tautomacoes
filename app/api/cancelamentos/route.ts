import { NextRequest, NextResponse } from "next/server";
import { ensureApiSession, getLimit, serverErrorResponse } from "@/lib/api-helpers";
import { fetchTableRows } from "@/lib/nocodb";
import { isCancelAction } from "@/lib/record-utils";

export async function GET(request: NextRequest) {
  const auth = ensureApiSession(request);
  if (auth.response) {
    return auth.response;
  }

  try {
    const limit = getLimit(request, 50);
    const rows = await fetchTableRows("acoes_automacao", { limit: 200 });
    const items = rows.filter(isCancelAction).slice(0, limit);
    return NextResponse.json({ items });
  } catch (error) {
    return serverErrorResponse(error);
  }
}
