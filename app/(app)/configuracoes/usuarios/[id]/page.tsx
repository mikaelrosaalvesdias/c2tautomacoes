import { notFound, redirect } from "next/navigation";
import { requirePageAuth } from "@/lib/auth";
import { getUserById, getUserAccess } from "@/lib/nocodb-admin";
import { PageHeader } from "@/components/PageHeader";
import { UserForm } from "@/components/user-form";
import { ErrorState } from "@/components/ErrorState";

export const dynamic = "force-dynamic";

export default async function EditarUsuarioPage({ params }: { params: { id: string } }) {
  const session = await requirePageAuth();

  if (session.role !== "admin") {
    redirect("/");
  }

  const userId = Number(params.id);
  if (Number.isNaN(userId)) {
    notFound();
  }

  try {
    const [user, access] = await Promise.all([
      getUserById(userId),
      getUserAccess(userId)
    ]);

    if (!user) {
      notFound();
    }

    return (
      <section className="space-y-6">
        <PageHeader
          title={`Editar: ${user.nome}`}
          subtitle={user.email}
        />
        <UserForm
          userId={userId}
          initialData={{
            email: user.email,
            nome: user.nome,
            role: user.role,
            status: user.status
          }}
          initialAccess={access.map((a) => ({
            empresa: a.empresa,
            can_view_dashboard: a.can_view_dashboard,
            can_view_inbox: a.can_view_inbox,
            can_view_acoes: a.can_view_acoes,
            can_view_cancelamentos: a.can_view_cancelamentos,
            can_view_emails: a.can_view_emails,
            can_edit_inbox: a.can_edit_inbox,
            can_edit_acoes: a.can_edit_acoes,
            can_manage_users: a.can_manage_users
          }))}
        />
      </section>
    );
  } catch (error) {
    return (
      <ErrorState
        title="Falha ao carregar usuário"
        description={error instanceof Error ? error.message : "Não foi possível consultar o usuário."}
      />
    );
  }
}
