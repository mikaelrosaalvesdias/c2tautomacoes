import crypto from "crypto";
import { cookies } from "next/headers";
import type { NextRequest } from "next/server";
import { redirect } from "next/navigation";

export const AUTH_COOKIE_NAME = "automacoes_c2tech_session";
const SESSION_MAX_AGE_SECONDS = 60 * 60 * 12;

type SessionPayload = {
  user: string;
  iat: number;
  exp: number;
};

function getSessionSecret(): string {
  const explicitSecret = process.env.SESSION_SECRET?.trim();
  if (explicitSecret) {
    return explicitSecret;
  }

  const baseSecret = process.env.APP_ADMIN_PASS || "change-me";
  return `automacoes_c2tech:${baseSecret}`;
}

function sign(value: string): string {
  return crypto.createHmac("sha256", getSessionSecret()).update(value).digest("base64url");
}

export function createSessionToken(user: string): string {
  const now = Math.floor(Date.now() / 1000);
  const payload: SessionPayload = {
    user,
    iat: now,
    exp: now + SESSION_MAX_AGE_SECONDS
  };

  const encodedPayload = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const signature = sign(encodedPayload);
  return `${encodedPayload}.${signature}`;
}

export function verifySessionToken(token?: string | null): SessionPayload | null {
  if (!token) {
    return null;
  }

  const parts = token.split(".");
  if (parts.length !== 2) {
    return null;
  }

  const [encodedPayload, receivedSignature] = parts;
  const expectedSignature = sign(encodedPayload);

  const receivedBuffer = Buffer.from(receivedSignature);
  const expectedBuffer = Buffer.from(expectedSignature);

  if (receivedBuffer.length !== expectedBuffer.length) {
    return null;
  }

  const isValid = crypto.timingSafeEqual(receivedBuffer, expectedBuffer);
  if (!isValid) {
    return null;
  }

  try {
    const parsed = JSON.parse(Buffer.from(encodedPayload, "base64url").toString("utf8")) as SessionPayload;
    const now = Math.floor(Date.now() / 1000);
    if (parsed.exp < now) {
      return null;
    }

    return parsed;
  } catch {
    return null;
  }
}

function shouldUseSecureCookie(request?: NextRequest): boolean {
  const override = process.env.COOKIE_SECURE?.trim().toLowerCase();
  if (override === "true") {
    return true;
  }
  if (override === "false") {
    return false;
  }

  if (!request) {
    return process.env.NODE_ENV === "production";
  }

  const forwardedProto = request.headers.get("x-forwarded-proto")?.split(",")[0]?.trim().toLowerCase();
  const protocol = forwardedProto || request.nextUrl.protocol.replace(":", "").toLowerCase();

  return protocol === "https";
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

export async function getSessionFromCookieStore() {
  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;
  return verifySessionToken(token);
}

export async function requirePageAuth() {
  const session = await getSessionFromCookieStore();
  if (!session) {
    redirect("/login");
  }
  return session;
}

export function requireApiAuth(request: NextRequest) {
  const token = request.cookies.get(AUTH_COOKIE_NAME)?.value;
  return verifySessionToken(token);
}
