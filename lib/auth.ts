/**
 * Auth module — multi-user with HMAC-signed session tokens.
 *
 * Session payload includes user info for fast RBAC without DB lookup per request.
 * For sensitive admin operations, use lib/nocodb-admin to re-fetch from DB.
 *
 * Break-glass: APP_ADMIN_USER/APP_ADMIN_PASS still works if ENABLE_BREAK_GLASS=true.
 */

import crypto from "crypto";
import { cookies } from "next/headers";
import type { NextRequest } from "next/server";
import { redirect } from "next/navigation";
import type { UserRole, Empresa } from "@/lib/nocodb-admin";

export const AUTH_COOKIE_NAME = "automacoes_c2tech_session";
const SESSION_MAX_AGE_SECONDS = 60 * 60 * 12; // 12 hours

// ── Session payload ───────────────────────────────────────────────────────────

export type SessionPayload = {
  sub: string;          // user_id (string) or "admin" for break-glass
  email: string;
  nome: string;
  role: UserRole;
  empresas: Empresa[];  // companies the user can access
  iat: number;
  exp: number;
};

// ── HMAC signing ──────────────────────────────────────────────────────────────

function getSessionSecret(): string {
  const secret = process.env.SESSION_SECRET?.trim();
  if (!secret) {
    // Fallback for local dev only — never log this
    return `automacoes_c2tech:${process.env.APP_ADMIN_PASS ?? "change-me"}`;
  }
  return secret;
}

function sign(value: string): string {
  return crypto.createHmac("sha256", getSessionSecret()).update(value).digest("base64url");
}

// ── Token creation / verification ─────────────────────────────────────────────

export function createSessionToken(payload: Omit<SessionPayload, "iat" | "exp">): string {
  const now = Math.floor(Date.now() / 1000);
  const full: SessionPayload = { ...payload, iat: now, exp: now + SESSION_MAX_AGE_SECONDS };
  const encoded = Buffer.from(JSON.stringify(full)).toString("base64url");
  const sig = sign(encoded);
  return `${encoded}.${sig}`;
}

export function verifySessionToken(token?: string | null): SessionPayload | null {
  if (!token) return null;

  const parts = token.split(".");
  if (parts.length !== 2) return null;

  const [encoded, received] = parts;
  const expected = sign(encoded);

  const recvBuf = Buffer.from(received);
  const expBuf = Buffer.from(expected);
  if (recvBuf.length !== expBuf.length) return null;
  if (!crypto.timingSafeEqual(recvBuf, expBuf)) return null;

  try {
    const payload = JSON.parse(Buffer.from(encoded, "base64url").toString("utf8")) as SessionPayload;
    if (payload.exp < Math.floor(Date.now() / 1000)) return null;
    return payload;
  } catch {
    return null;
  }
}

// ── Cookie options ────────────────────────────────────────────────────────────

function shouldUseSecureCookie(request?: NextRequest): boolean {
  const override = process.env.COOKIE_SECURE?.trim().toLowerCase();
  if (override === "true") return true;
  if (override === "false") return false;
  if (!request) return process.env.NODE_ENV === "production";
  const proto = request.headers.get("x-forwarded-proto")?.split(",")[0]?.trim().toLowerCase()
    ?? request.nextUrl.protocol.replace(":", "").toLowerCase();
  return proto === "https";
}

export function getAuthCookieOptions(request?: NextRequest) {
  return {
    httpOnly: true,
    secure: shouldUseSecureCookie(request),
    sameSite: "lax" as const,
    path: "/",
    maxAge: SESSION_MAX_AGE_SECONDS
  };
}

export function getClearCookieOptions(request?: NextRequest) {
  return {
    httpOnly: true,
    secure: shouldUseSecureCookie(request),
    sameSite: "lax" as const,
    path: "/",
    maxAge: 0
  };
}

// ── Session helpers ───────────────────────────────────────────────────────────

export async function getSessionFromCookieStore(): Promise<SessionPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;
  return verifySessionToken(token);
}

export async function requirePageAuth(): Promise<SessionPayload> {
  const session = await getSessionFromCookieStore();
  if (!session) {
    redirect("/login");
  }
  return session;
}

export function requireApiAuth(request: NextRequest): SessionPayload | null {
  const token = request.cookies.get(AUTH_COOKIE_NAME)?.value;
  return verifySessionToken(token);
}

// ── Break-glass admin ─────────────────────────────────────────────────────────

export function isBreakGlassEnabled(): boolean {
  return process.env.ENABLE_BREAK_GLASS?.trim().toLowerCase() === "true";
}

export function verifyBreakGlass(username: string, password: string): boolean {
  if (!isBreakGlassEnabled()) return false;
  const expectedUser = process.env.APP_ADMIN_USER?.trim() ?? "";
  const expectedPass = process.env.APP_ADMIN_PASS?.trim() ?? "";
  if (!expectedUser || !expectedPass) return false;
  return username === expectedUser && password === expectedPass;
}

export function createBreakGlassSession(): string {
  return createSessionToken({
    sub: "break-glass",
    email: process.env.APP_ADMIN_USER ?? "admin",
    nome: "Admin (Break-glass)",
    role: "admin",
    empresas: ["inka", "californiatv"]
  });
}
