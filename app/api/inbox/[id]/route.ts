import { NextRequest, NextResponse } from "next/server";
import { ensureApiSession, serverErrorResponse } from "@/lib/api-helpers";
import { fetchTableRowById } from "@/lib/nocodb";

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const auth = ensureApiSession(request);
  if (auth.response) {
    return auth.response;
  }

  try {
    const item = await fetchTableRowById("chegada_suporte", params.id);
    if (!item) {
      return NextResponse.json({ error: "Registro não encontrado" }, { status: 404 });
    }

    return NextResponse.json({ item });
  } catch (error) {
    return serverErrorResponse(error);
  }
}
