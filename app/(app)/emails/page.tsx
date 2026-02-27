import { EmailsList } from "@/components/emails-list";
import { ErrorState } from "@/components/ErrorState";
import { PageHeader } from "@/components/PageHeader";
import { fetchTableRows } from "@/lib/nocodb";

export default async function EmailsPage() {
  try {
    const rows = await fetchTableRows("emails_comercial", { limit: 200 });

    return (
      <section className="space-y-6">
        <PageHeader title="Emails" subtitle="Mensagens comerciais enviadas e seus metadados." />
        <EmailsList records={rows} />
      </section>
    );
  } catch (error) {
    return (
      <ErrorState
        title="Falha ao carregar emails"
        description={error instanceof Error ? error.message : "Não foi possível ler a tabela emails_comercial."}
      />
    );
  }
}
