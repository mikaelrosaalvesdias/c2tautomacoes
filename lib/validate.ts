import { z } from "zod";

// ── Common primitives ──────────────────────────────────────────────────────────

export const emailSchema = z
  .string()
  .email("Email inválido")
  .max(254, "Email muito longo")
  .toLowerCase()
  .trim();

export const nomeSchema = z
  .string()
  .min(2, "Nome muito curto")
  .max(120, "Nome muito longo")
  .trim();

export const passwordSchema = z
  .string()
  .min(8, "Senha deve ter pelo menos 8 caracteres")
  .max(128, "Senha muito longa");

export const roleSchema = z.enum(["admin", "manager", "viewer"]);

export const empresaSchema = z.enum(["inka", "californiatv"]);

export const limitSchema = z
  .string()
  .optional()
  .transform((v) => {
    const n = Number.parseInt(v ?? "50", 10);
    return Number.isNaN(n) ? 50 : Math.min(Math.max(n, 1), 200);
  });

// ── Auth ──────────────────────────────────────────────────────────────────────

export const loginSchema = z.object({
  username: emailSchema,
  password: z.string().min(1, "Senha obrigatória").max(128)
});

// ── User management ────────────────────────────────────────────────────────────

export const createUserSchema = z.object({
  email: emailSchema,
  nome: nomeSchema,
  role: roleSchema,
  status: z.boolean().default(true),
  password: passwordSchema
});

export const updateUserSchema = z.object({
  nome: nomeSchema.optional(),
  role: roleSchema.optional(),
  status: z.boolean().optional()
});

export const resetPasswordSchema = z.object({
  newPassword: passwordSchema
});

// ── User access permissions ────────────────────────────────────────────────────

export const userAccessSchema = z.object({
  empresa: empresaSchema,
  can_view_dashboard: z.boolean().default(false),
  can_view_inbox: z.boolean().default(false),
  can_view_acoes: z.boolean().default(false),
  can_view_cancelamentos: z.boolean().default(false),
  can_view_emails: z.boolean().default(false),
  can_edit_inbox: z.boolean().default(false),
  can_edit_acoes: z.boolean().default(false),
  can_manage_users: z.boolean().default(false)
});

export const userAccessListSchema = z.array(userAccessSchema);

// ── Query params ───────────────────────────────────────────────────────────────

export const idParamSchema = z.object({
  id: z.string().min(1).max(100).trim()
});

// ── Utility ────────────────────────────────────────────────────────────────────

export function parseBody<T>(schema: z.ZodSchema<T>, data: unknown): { data: T; error: null } | { data: null; error: string } {
  const result = schema.safeParse(data);
  if (!result.success) {
    const msg = result.error.issues.map((e) => e.message).join("; ");
    return { data: null, error: msg };
  }
  return { data: result.data, error: null };
}
