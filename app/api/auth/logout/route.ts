import { NextRequest, NextResponse } from "next/server";
import { AUTH_COOKIE_NAME, getClearCookieOptions, requireApiAuth } from "@/lib/auth";
import { writeAuditLog } from "@/lib/nocodb-admin";
import { getClientIp } from "@/lib/api-helpers";

export async function POST(request: NextRequest) {
  const session = requireApiAuth(request);
  const ip = getClientIp(request);

  if (session) {
    await writeAuditLog({
      user_email: session.email,
      action: "logout",
      resource: "auth",
      ip
    });
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.set(AUTH_COOKIE_NAME, "", getClearCookieOptions(request));
  return response;
}
