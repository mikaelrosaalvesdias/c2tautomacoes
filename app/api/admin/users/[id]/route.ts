import { NextRequest, NextResponse } from "next/server";
import { requireApiAuth } from "@/lib/auth";
import { getUserById, updateUser } from "@/lib/nocodb-admin";
import { updateUserSchema } from "@/lib/validate";
import { apiErrorResponse, notAuthenticated, forbidden, notFound } from "@/lib/errors";
import { writeAuditLog } from "@/lib/nocodb-admin";
import { getClientIp } from "@/lib/api-helpers";

function requireAdmin(request: NextRequest) {
  const session = requireApiAuth(request);
  if (!session) return { session: null, err: notAuthenticated() };
  if (session.role !== "admin") return { session, err: forbidden() };
  return { session, err: null };
}

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const { err } = requireAdmin(request);
  if (err) return err;

  try {
    const userId = Number(params.id);
    if (Number.isNaN(userId)) return notFound("Usuário");

    const user = await getUserById(userId);
    if (!user) return notFound("Usuário");

    const { password_hash: _ph, ...safe } = user;
    return NextResponse.json({ user: safe });
  } catch (error) {
    return apiErrorResponse(error);
  }
}

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  const { session, err } = requireAdmin(request);
  if (err) return err;

  try {
    const userId = Number(params.id);
    if (Number.isNaN(userId)) return notFound("Usuário");

    const user = await getUserById(userId);
    if (!user) return notFound("Usuário");

    const body = await request.json();
    const parseResult = updateUserSchema.safeParse(body);
    if (!parseResult.success) {
      const msg = parseResult.error.issues.map((e) => e.message).join("; ");
      return NextResponse.json({ error: msg }, { status: 400 });
    }

    const updated = await updateUser(userId, parseResult.data);
    const { password_hash: _ph, ...safe } = updated;

    await writeAuditLog({
      user_email: session!.email,
      action: "update_user",
      resource: "users",
      resource_id: String(userId),
      ip: getClientIp(request)
    });

    return NextResponse.json({ user: safe });
  } catch (error) {
    return apiErrorResponse(error);
  }
}
