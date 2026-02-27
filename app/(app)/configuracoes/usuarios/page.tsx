import Link from "next/link";
import { redirect } from "next/navigation";
import { requirePageAuth } from "@/lib/auth";
import { listUsers } from "@/lib/nocodb-admin";
import { PageHeader } from "@/components/PageHeader";
import { DataTable } from "@/components/DataTable";
import { StatusBadge } from "@/components/StatusBadge";
import { TableCell, TableRow } from "@/components/ui/table";
import { ErrorState } from "@/components/ErrorState";

export const dynamic = "force-dynamic";

export default async function UsuariosPage() {
  const session = await requirePageAuth();

  if (session.role !== "admin") {
    redirect("/");
  }

  try {
    const users = await listUsers();

    return (
      <section className="space-y-6">
        <PageHeader
          title="Usuários"
          subtitle="Gerencie usuários e permissões do sistema."
          actions={
            <Link
              href="/configuracoes/usuarios/novo"
              className="inline-flex items-center justify-center rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-slate-800"
            >
              + Novo usuário
            </Link>
          }
        />

        <DataTable
          columns={["Email", "Nome", "Perfil", "Status", "Ações"]}
          empty={users.length === 0}
          emptyTitle="Nenhum usuário cadastrado"
          emptyDescription="Clique em 'Novo usuário' para criar o primeiro."
        >
          {users.map((user) => (
            <TableRow key={user.Id}>
              <TableCell className="font-medium">{user.email}</TableCell>
              <TableCell>{user.nome}</TableCell>
              <TableCell>
                <StatusBadge
                  label={user.role}
                  tone={
                    user.role === "admin"
                      ? "warning"
                      : user.role === "manager"
                        ? "success"
                        : "neutral"
                  }
                />
              </TableCell>
              <TableCell>
                <StatusBadge
                  label={user.status ? "Ativo" : "Inativo"}
                  tone={user.status ? "success" : "danger"}
                />
              </TableCell>
              <TableCell>
                <Link
                  href={`/configuracoes/usuarios/${user.Id}`}
                  className="text-sm font-medium text-slate-900 hover:underline"
                >
                  Editar
                </Link>
              </TableCell>
            </TableRow>
          ))}
        </DataTable>
      </section>
    );
  } catch (error) {
    return (
      <ErrorState
        title="Falha ao carregar usuários"
        description={error instanceof Error ? error.message : "Não foi possível consultar a tabela de usuários."}
      />
    );
  }
}
