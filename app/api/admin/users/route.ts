import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { requireApiAuth } from "@/lib/auth";
import { listUsers, createUser, getUserByEmail } from "@/lib/nocodb-admin";
import { createUserSchema } from "@/lib/validate";
import { apiErrorResponse, notAuthenticated, forbidden, conflict } from "@/lib/errors";
import { writeAuditLog } from "@/lib/nocodb-admin";
import { getClientIp } from "@/lib/api-helpers";

function requireAdmin(request: NextRequest) {
  const session = requireApiAuth(request);
  if (!session) return { session: null, err: notAuthenticated() };
  if (session.role !== "admin") return { session, err: forbidden() };
  return { session, err: null };
}

export async function GET(request: NextRequest) {
  const { err } = requireAdmin(request);
  if (err) return err;

  try {
    const users = await listUsers();
    const safe = users.map(({ password_hash: _ph, ...u }) => u);
    return NextResponse.json({ users: safe });
  } catch (error) {
    return apiErrorResponse(error);
  }
}

export async function POST(request: NextRequest) {
  const { session, err } = requireAdmin(request);
  if (err) return err;

  try {
    const body = await request.json();
    const parseResult = createUserSchema.safeParse(body);
    if (!parseResult.success) {
      const msg = parseResult.error.issues.map((e) => e.message).join("; ");
      return NextResponse.json({ error: msg }, { status: 400 });
    }

    const data = parseResult.data;
    const existing = await getUserByEmail(data.email);
    if (existing) return conflict("Email já cadastrado");

    const password_hash = await bcrypt.hash(data.password, 12);
    const user = await createUser({
      email: data.email,
      nome: data.nome,
      password_hash,
      status: data.status,
      role: data.role,
      force_password_reset: true
    });

    const { password_hash: _ph, ...safe } = user;
    await writeAuditLog({
      user_email: session!.email,
      action: "create_user",
      resource: "users",
      resource_id: String(user.Id),
      ip: getClientIp(request)
    });

    return NextResponse.json({ user: safe }, { status: 201 });
  } catch (error) {
    return apiErrorResponse(error);
  }
}
