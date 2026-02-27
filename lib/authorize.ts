/**
 * RBAC policy — centralised permission checks.
 *
 * Rules:
 * - admin: full access to everything
 * - manager/viewer: access based on user_access table permissions
 * - All checks happen server-side; never trust the client
 */

import type { SessionPayload } from "@/lib/auth";
import type { NcUserAccess, Empresa } from "@/lib/nocodb-admin";
import { getUserAccess } from "@/lib/nocodb-admin";

export type Resource =
  | "dashboard"
  | "inbox"
  | "acoes"
  | "cancelamentos"
  | "emails"
  | "settings"
  | "users";

export type Action = "view" | "edit" | "admin";

// ── Fast checks from session payload ─────────────────────────────────────────

/** Check if the session user has access to a given empresa (fast, no DB) */
export function hasEmpresaAccess(session: SessionPayload, empresa: Empresa): boolean {
  if (session.role === "admin") return true;
  return session.empresas.includes(empresa);
}

/** Check if user is admin */
export function isAdmin(session: SessionPayload): boolean {
  return session.role === "admin";
}

// ── DB-backed permission checks ───────────────────────────────────────────────

type PermissionKey = keyof Omit<NcUserAccess, "Id" | "user_id" | "empresa">;

const RESOURCE_VIEW_KEY: Record<Resource, PermissionKey | null> = {
  dashboard: "can_view_dashboard",
  inbox: "can_view_inbox",
  acoes: "can_view_acoes",
  cancelamentos: "can_view_cancelamentos",
  emails: "can_view_emails",
  settings: null,  // admin-only
  users: null      // admin-only
};

const RESOURCE_EDIT_KEY: Record<Resource, PermissionKey | null> = {
  dashboard: null,
  inbox: "can_edit_inbox",
  acoes: "can_edit_acoes",
  cancelamentos: null,
  emails: null,
  settings: null,
  users: "can_manage_users"
};

/**
 * Full permission check — fetches user_access from DB.
 * Use this for API endpoints that return sensitive data.
 *
 * @param session Current session payload
 * @param resource Resource being accessed
 * @param action Action being performed
 * @param empresa Company scope (required for data resources)
 */
export async function can(
  session: SessionPayload,
  resource: Resource,
  action: Action,
  empresa?: Empresa
): Promise<boolean> {
  // Admins can do anything
  if (session.role === "admin") return true;

  // Settings/users management requires admin
  if (resource === "settings" || resource === "users") {
    return false;
  }

  // If empresa is required, check session empresa access first
  if (empresa && !session.empresas.includes(empresa)) {
    return false;
  }

  // For view/edit actions, check user_access table
  const userId = Number(session.sub);
  if (Number.isNaN(userId)) return false;

  try {
    const accessList = await getUserAccess(userId);

    // If no empresa specified, check if user has access to any empresa for this resource
    const toCheck = empresa
      ? accessList.filter((a) => a.empresa === empresa)
      : accessList;

    for (const access of toCheck) {
      const key = action === "view"
        ? RESOURCE_VIEW_KEY[resource]
        : RESOURCE_EDIT_KEY[resource];

      if (key && access[key] === true) {
        return true;
      }
    }

    return false;
  } catch {
    // Fail closed on DB error
    return false;
  }
}

/**
 * Asserts permission — throws ApiError with 403 if denied.
 * Use with: await assertCan(session, "inbox", "view", "inka")
 */
export async function assertCan(
  session: SessionPayload,
  resource: Resource,
  action: Action,
  empresa?: Empresa
): Promise<void> {
  const { ApiError } = await import("@/lib/errors");
  const allowed = await can(session, resource, action, empresa);
  if (!allowed) {
    throw new ApiError(403, "Sem permissão");
  }
}

/**
 * Get all empresa IDs that the session user can view for a given resource.
 * Returns all if admin.
 */
export async function getAllowedEmpresas(
  session: SessionPayload,
  resource: Resource,
  action: Action
): Promise<Empresa[]> {
  const ALL_EMPRESAS: Empresa[] = ["inka", "californiatv"];

  if (session.role === "admin") return ALL_EMPRESAS;

  const userId = Number(session.sub);
  if (Number.isNaN(userId)) return [];

  try {
    const accessList = await getUserAccess(userId);
    return accessList
      .filter((a) => {
        const key = action === "view"
          ? RESOURCE_VIEW_KEY[resource]
          : RESOURCE_EDIT_KEY[resource];
        return key && a[key] === true;
      })
      .map((a) => a.empresa)
      .filter((e): e is Empresa => ALL_EMPRESAS.includes(e as Empresa));
  } catch {
    return [];
  }
}
