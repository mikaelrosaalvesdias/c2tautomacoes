"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";

type UserRole = "admin" | "manager" | "viewer";
type Empresa = "inka" | "californiatv";

type Permission = {
  empresa: Empresa;
  can_view_dashboard: boolean;
  can_view_inbox: boolean;
  can_view_acoes: boolean;
  can_view_cancelamentos: boolean;
  can_view_emails: boolean;
  can_edit_inbox: boolean;
  can_edit_acoes: boolean;
  can_manage_users: boolean;
};

const EMPRESAS: Empresa[] = ["inka", "californiatv"];

const DEFAULT_PERMISSIONS: Permission = {
  empresa: "inka",
  can_view_dashboard: false,
  can_view_inbox: false,
  can_view_acoes: false,
  can_view_cancelamentos: false,
  can_view_emails: false,
  can_edit_inbox: false,
  can_edit_acoes: false,
  can_manage_users: false
};

const PERM_LABELS: Omit<Permission, "empresa"> = {
  can_view_dashboard: false,
  can_view_inbox: false,
  can_view_acoes: false,
  can_view_cancelamentos: false,
  can_view_emails: false,
  can_edit_inbox: false,
  can_edit_acoes: false,
  can_manage_users: false
};

const PERM_DISPLAY: Record<keyof typeof PERM_LABELS, string> = {
  can_view_dashboard: "Ver Dashboard",
  can_view_inbox: "Ver Inbox",
  can_view_acoes: "Ver Ações",
  can_view_cancelamentos: "Ver Cancelamentos",
  can_view_emails: "Ver Emails",
  can_edit_inbox: "Editar Inbox",
  can_edit_acoes: "Editar Ações",
  can_manage_users: "Gerenciar Usuários"
};

type UserFormProps = {
  userId?: number;
  initialData?: {
    email: string;
    nome: string;
    role: UserRole;
    status: boolean;
  };
  initialAccess?: Permission[];
  isNew?: boolean;
};

export function UserForm({ userId, initialData, initialAccess, isNew = false }: UserFormProps) {
  const router = useRouter();

  const [nome, setNome] = useState(initialData?.nome ?? "");
  const [email, setEmail] = useState(initialData?.email ?? "");
  const [role, setRole] = useState<UserRole>(initialData?.role ?? "viewer");
  const [status, setStatus] = useState(initialData?.status ?? true);
  const [password, setPassword] = useState("");

  const [permissions, setPermissions] = useState<Permission[]>(
    initialAccess && initialAccess.length > 0
      ? initialAccess
      : EMPRESAS.map((empresa) => ({ ...DEFAULT_PERMISSIONS, empresa }))
  );

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tempPassword, setTempPassword] = useState<string | null>(null);

  function togglePerm(empresa: Empresa, key: keyof typeof PERM_LABELS, value: boolean) {
    setPermissions((prev) =>
      prev.map((p) => (p.empresa === empresa ? { ...p, [key]: value } : p))
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      // Create or update user
      const userPayload = isNew
        ? { email, nome, role, status, password }
        : { nome, role, status };

      const url = isNew ? "/api/admin/users" : `/api/admin/users/${userId}`;
      const method = isNew ? "POST" : "PATCH";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userPayload)
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error ?? "Erro ao salvar usuário");
        setLoading(false);
        return;
      }

      const data = await res.json();
      const id = userId ?? data.user?.Id;

      // Save access permissions
      const accessRes = await fetch(`/api/admin/users/${id}/access`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(permissions)
      });

      if (!accessRes.ok) {
        const accessData = await accessRes.json();
        setError(accessData.error ?? "Erro ao salvar permissões");
        setLoading(false);
        return;
      }

      router.push("/configuracoes/usuarios");
      router.refresh();
    } catch {
      setError("Erro de conexão. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  async function handleResetPassword() {
    if (!userId) return;
    setError(null);
    setLoading(true);

    try {
      const res = await fetch(`/api/admin/users/${userId}/reset-password`, {
        method: "POST"
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error ?? "Erro ao resetar senha");
        return;
      }

      const data = await res.json();
      setTempPassword(data.tempPassword ?? null);
    } catch {
      setError("Erro de conexão ao resetar senha.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8 max-w-3xl">
      {/* Basic info */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
        <h2 className="text-lg font-semibold text-slate-900">Dados do usuário</h2>

        {isNew && (
          <div className="space-y-1">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="usuario@empresa.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              maxLength={254}
            />
          </div>
        )}

        <div className="space-y-1">
          <Label htmlFor="nome">Nome</Label>
          <Input
            id="nome"
            type="text"
            placeholder="Nome completo"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            required
            maxLength={120}
          />
        </div>

        {isNew && (
          <div className="space-y-1">
            <Label htmlFor="password">Senha inicial</Label>
            <Input
              id="password"
              type="password"
              placeholder="Mínimo 8 caracteres"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
              maxLength={128}
            />
            <p className="text-xs text-slate-500">O usuário deverá trocar a senha no primeiro acesso.</p>
          </div>
        )}

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1">
            <Label htmlFor="role">Perfil</Label>
            <select
              id="role"
              className="h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-700"
              value={role}
              onChange={(e) => setRole(e.target.value as UserRole)}
            >
              <option value="viewer">Viewer (somente leitura)</option>
              <option value="manager">Manager</option>
              <option value="admin">Admin (acesso total)</option>
            </select>
          </div>

          <div className="flex items-center gap-3 pt-6">
            <Checkbox
              id="status"
              checked={status}
              onCheckedChange={(v) => setStatus(Boolean(v))}
            />
            <Label htmlFor="status">Usuário ativo</Label>
          </div>
        </div>
      </div>

      {/* Permissions per empresa */}
      {role !== "admin" && (
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm space-y-6">
          <h2 className="text-lg font-semibold text-slate-900">Permissões por empresa</h2>

          {EMPRESAS.map((empresa) => {
            const perm = permissions.find((p) => p.empresa === empresa) ?? { ...DEFAULT_PERMISSIONS, empresa };
            return (
              <div key={empresa} className="space-y-3">
                <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
                  {empresa}
                </h3>
                <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                  {(Object.keys(PERM_DISPLAY) as Array<keyof typeof PERM_LABELS>).map((key) => (
                    <div key={key} className="flex items-center gap-2">
                      <Checkbox
                        id={`${empresa}-${key}`}
                        checked={Boolean(perm[key])}
                        onCheckedChange={(v) => togglePerm(empresa, key, Boolean(v))}
                      />
                      <Label htmlFor={`${empresa}-${key}`} className="text-sm font-normal">
                        {PERM_DISPLAY[key]}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Error / temp password */}
      {error && (
        <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {tempPassword && (
        <div className="rounded-md border border-emerald-200 bg-emerald-50 p-4 space-y-2">
          <p className="text-sm font-semibold text-emerald-800">Senha temporária gerada:</p>
          <p className="font-mono text-lg font-bold text-emerald-900 select-all">{tempPassword}</p>
          <p className="text-xs text-emerald-700">Copie esta senha agora. Ela não será exibida novamente.</p>
        </div>
      )}

      {/* Actions */}
      <div className="flex flex-wrap items-center gap-3">
        <Button type="submit" disabled={loading}>
          {loading ? "Salvando..." : isNew ? "Criar usuário" : "Salvar alterações"}
        </Button>

        {!isNew && userId && (
          <Button
            type="button"
            variant="outline"
            onClick={handleResetPassword}
            disabled={loading}
          >
            Resetar senha
          </Button>
        )}

        <Button
          type="button"
          variant="ghost"
          onClick={() => router.push("/configuracoes/usuarios")}
          disabled={loading}
        >
          Cancelar
        </Button>
      </div>
    </form>
  );
}
