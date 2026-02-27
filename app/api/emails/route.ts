import { NextRequest, NextResponse } from "next/server";
import { ensureApiSession, getLimit, serverErrorResponse } from "@/lib/api-helpers";
import { fetchTableRows } from "@/lib/nocodb";

export async function GET(request: NextRequest) {
  const auth = ensureApiSession(request);
  if (auth.response) {
    return auth.response;
  }

  try {
    const limit = getLimit(request, 50);
    const items = await fetchTableRows("emails_comercial", { limit });
    return NextResponse.json({ items });
  } catch (error) {
    return serverErrorResponse(error);
  }
}
