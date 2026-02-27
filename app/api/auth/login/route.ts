import { NextRequest, NextResponse } from "next/server";
import { AUTH_COOKIE_NAME, createSessionToken, getAuthCookieOptions } from "@/lib/auth";

type LoginBody = {
  username?: string;
  password?: string;
};

function isValidCredentials(username: string, password: string): boolean {
  const expectedUser = process.env.APP_ADMIN_USER || "";
  const expectedPass = process.env.APP_ADMIN_PASS || "";
  return username === expectedUser && password === expectedPass;
}

async function parseBody(request: NextRequest): Promise<LoginBody> {
  const contentType = request.headers.get("content-type") || "";

  if (contentType.includes("application/json")) {
    return (await request.json()) as LoginBody;
  }

  const formData = await request.formData();
  return {
    username: String(formData.get("username") || ""),
    password: String(formData.get("password") || "")
  };
}

export async function POST(request: NextRequest) {
  const body = await parseBody(request);
  const username = body.username?.trim() || "";
  const password = body.password || "";

  if (!isValidCredentials(username, password)) {
    return NextResponse.json({ error: "Credenciais inválidas" }, { status: 401 });
  }

  const token = createSessionToken(username);
  const response = NextResponse.json({ ok: true });
  response.cookies.set(AUTH_COOKIE_NAME, token, getAuthCookieOptions(request));
  return response;
}
