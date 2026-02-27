import { AcoesList } from "@/components/acoes-list";
import { ErrorState } from "@/components/ErrorState";
import { PageHeader } from "@/components/PageHeader";
import { fetchTableRows } from "@/lib/nocodb";

export default async function AcoesPage({
  searchParams
}: {
  searchParams: { email?: string };
}) {
  try {
    const rows = await fetchTableRows("acoes_automacao", { limit: 200 });
    const initialEmailFilter = searchParams.email || "";

    return (
      <section className="space-y-6">
        <PageHeader title="Ações" subtitle="Histórico de automações e decisões executadas." />
        <AcoesList records={rows} initialEmailFilter={initialEmailFilter} />
      </section>
    );
  } catch (error) {
    return (
      <ErrorState
        title="Falha ao carregar ações"
        description={error instanceof Error ? error.message : "Não foi possível ler a tabela acoes_automacao."}
      />
    );
  }
}
