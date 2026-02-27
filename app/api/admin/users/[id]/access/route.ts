import { NextRequest, NextResponse } from "next/server";
import { requireApiAuth } from "@/lib/auth";
import { getUserById, getUserAccess, upsertUserAccess } from "@/lib/nocodb-admin";
import { userAccessListSchema } from "@/lib/validate";
import { apiErrorResponse, notAuthenticated, forbidden, notFound } from "@/lib/errors";
import { writeAuditLog } from "@/lib/nocodb-admin";
import { getClientIp } from "@/lib/api-helpers";

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const session = requireApiAuth(request);
  if (!session) return notAuthenticated();
  if (session.role !== "admin") return forbidden();

  try {
    const userId = Number(params.id);
    if (Number.isNaN(userId)) return notFound("Usuário");

    const user = await getUserById(userId);
    if (!user) return notFound("Usuário");

    const access = await getUserAccess(userId);
    return NextResponse.json({ access });
  } catch (error) {
    return apiErrorResponse(error);
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  const session = requireApiAuth(request);
  if (!session) return notAuthenticated();
  if (session.role !== "admin") return forbidden();

  try {
    const userId = Number(params.id);
    if (Number.isNaN(userId)) return notFound("Usuário");

    const user = await getUserById(userId);
    if (!user) return notFound("Usuário");

    const body = await request.json();
    const parseResult = userAccessListSchema.safeParse(body);
    if (!parseResult.success) {
      const msg = parseResult.error.issues.map((e) => e.message).join("; ");
      return NextResponse.json({ error: msg }, { status: 400 });
    }

    const accessList = parseResult.data;
    const results = await Promise.all(
      accessList.map(({ empresa, ...perms }) =>
        upsertUserAccess(userId, empresa, perms)
      )
    );

    await writeAuditLog({
      user_email: session.email,
      action: "update_user_access",
      resource: "users",
      resource_id: String(userId),
      ip: getClientIp(request)
    });

    return NextResponse.json({ access: results });
  } catch (error) {
    return apiErrorResponse(error);
  }
}
