import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { requireApiAuth } from "@/lib/auth";
import { getUserById, updateUser } from "@/lib/nocodb-admin";
import { apiErrorResponse, notAuthenticated, forbidden, notFound } from "@/lib/errors";
import { writeAuditLog } from "@/lib/nocodb-admin";
import { getClientIp } from "@/lib/api-helpers";

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  const session = requireApiAuth(request);
  if (!session) return notAuthenticated();
  if (session.role !== "admin") return forbidden();

  try {
    const userId = Number(params.id);
    if (Number.isNaN(userId)) return notFound("Usuário");

    const user = await getUserById(userId);
    if (!user) return notFound("Usuário");

    // Generate a secure random temporary password
    const tempPassword = crypto.randomBytes(12).toString("base64url").slice(0, 16);
    const password_hash = await bcrypt.hash(tempPassword, 12);

    await updateUser(userId, { password_hash, force_password_reset: true });

    await writeAuditLog({
      user_email: session.email,
      action: "reset_password",
      resource: "users",
      resource_id: String(userId),
      ip: getClientIp(request)
    });

    // Return the temporary password ONCE — never logged
    return NextResponse.json({ tempPassword });
  } catch (error) {
    return apiErrorResponse(error);
  }
}
