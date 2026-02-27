import { ErrorState } from "@/components/ErrorState";
import { InboxList } from "@/components/inbox-list";
import { PageHeader } from "@/components/PageHeader";
import { fetchTableRows } from "@/lib/nocodb";

export default async function InboxPage() {
  try {
    const rows = await fetchTableRows("chegada_suporte", { limit: 200 });

    return (
      <section className="space-y-6">
        <PageHeader title="Inbox" subtitle="Registros de chegada de suporte com busca e filtros rápidos." />
        <InboxList records={rows} />
      </section>
    );
  } catch (error) {
    return (
      <ErrorState
        title="Falha ao carregar Inbox"
        description={error instanceof Error ? error.message : "Não foi possível ler a tabela chegada_suporte."}
      />
    );
  }
}
