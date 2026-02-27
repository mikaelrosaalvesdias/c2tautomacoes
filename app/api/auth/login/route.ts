import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { AUTH_COOKIE_NAME, createSessionToken, getAuthCookieOptions, verifyBreakGlass, createBreakGlassSession } from "@/lib/auth";
import { getUserByEmail } from "@/lib/nocodb-admin";
import { loginSchema } from "@/lib/validate";
import { checkRateLimit, loginRateLimitKey } from "@/lib/rate-limit";
import { writeAuditLog } from "@/lib/nocodb-admin";
import { getClientIp } from "@/lib/api-helpers";
import { tooManyRequests } from "@/lib/errors";

const RATE_LIMIT = { max: 10, windowMs: 10 * 60 * 1000 };

async function parseLoginBody(request: NextRequest): Promise<{ username?: string; password?: string }> {
  const contentType = request.headers.get("content-type") ?? "";
  if (contentType.includes("application/json")) {
    return request.json() as Promise<{ username?: string; password?: string }>;
  }
  const form = await request.formData();
  return {
    username: String(form.get("username") ?? ""),
    password: String(form.get("password") ?? "")
  };
}

export async function POST(request: NextRequest) {
  const ip = getClientIp(request);
  const userAgent = request.headers.get("user-agent") ?? "unknown";

  const raw = await parseLoginBody(request);
  const rawUsername = (raw.username ?? "").trim();
  const rawPassword = raw.password ?? "";

  if (!rawUsername || !rawPassword) {
    return NextResponse.json({ error: "Credenciais inválidas" }, { status: 401 });
  }

  // ── Break-glass check (before email validation — admin may not use email) ──
  if (verifyBreakGlass(rawUsername, rawPassword)) {
    const rlKey = loginRateLimitKey(ip, rawUsername);
    const rl = checkRateLimit(rlKey, RATE_LIMIT);
    if (!rl.allowed) return tooManyRequests();

    const token = createBreakGlassSession();
    const response = NextResponse.json({ ok: true });
    response.cookies.set(AUTH_COOKIE_NAME, token, getAuthCookieOptions(request));
    await writeAuditLog({ user_email: rawUsername, action: "login_success_breakglass", resource: "auth", ip, user_agent: userAgent });
    return response;
  }

  // ── Normal user login — requires valid email ──────────────────────────────
  const parseResult = loginSchema.safeParse(raw);
  if (!parseResult.success) {
    return NextResponse.json({ error: "Credenciais inválidas" }, { status: 401 });
  }

  const email = parseResult.data.username;
  const password = parseResult.data.password;

  const rlKey = loginRateLimitKey(ip, email);
  const rl = checkRateLimit(rlKey, RATE_LIMIT);
  if (!rl.allowed) return tooManyRequests();

  let user;
  try {
    user = await getUserByEmail(email);
  } catch {
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }

  if (!user || !user.status) {
    await writeAuditLog({ user_email: email, action: "login_fail", resource: "auth", ip, user_agent: userAgent });
    return NextResponse.json({ error: "Credenciais inválidas" }, { status: 401 });
  }

  const passwordValid = await bcrypt.compare(password, user.password_hash);
  if (!passwordValid) {
    await writeAuditLog({ user_email: email, action: "login_fail", resource: "auth", ip, user_agent: userAgent });
    return NextResponse.json({ error: "Credenciais inválidas" }, { status: 401 });
  }

  let empresas: ("inka" | "californiatv")[] = [];
  try {
    const { getUserAccess } = await import("@/lib/nocodb-admin");
    const access = await getUserAccess(user.Id);
    empresas = [...new Set(access.map((a) => a.empresa))];
  } catch {
    empresas = [];
  }

  const token = createSessionToken({
    sub: String(user.Id),
    email: user.email,
    nome: user.nome,
    role: user.role,
    empresas
  });

  const response = NextResponse.json({ ok: true, forcePasswordReset: user.force_password_reset ?? false });
  response.cookies.set(AUTH_COOKIE_NAME, token, getAuthCookieOptions(request));
  await writeAuditLog({ user_email: email, action: "login_success", resource: "auth", ip, user_agent: userAgent });

  return response;
}
