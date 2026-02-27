import { redirect } from "next/navigation";
import { requirePageAuth } from "@/lib/auth";
import { PageHeader } from "@/components/PageHeader";
import { UserForm } from "@/components/user-form";

export const dynamic = "force-dynamic";

export default async function NovoUsuarioPage() {
  const session = await requirePageAuth();

  if (session.role !== "admin") {
    redirect("/");
  }

  return (
    <section className="space-y-6">
      <PageHeader
        title="Novo Usuário"
        subtitle="Cadastre um novo usuário e defina suas permissões de acesso."
      />
      <UserForm isNew />
    </section>
  );
}
