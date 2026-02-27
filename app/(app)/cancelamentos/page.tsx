import { AcoesList } from "@/components/acoes-list";
import { ErrorState } from "@/components/ErrorState";
import { PageHeader } from "@/components/PageHeader";
import { fetchTableRows } from "@/lib/nocodb";
import { isCancelAction } from "@/lib/record-utils";

export default async function CancelamentosPage() {
  try {
    const rows = await fetchTableRows("acoes_automacao", { limit: 200 });
    const cancelRows = rows.filter(isCancelAction);

    return (
      <section className="space-y-6">
        <PageHeader title="Cancelamentos" subtitle="Filtro de ações que contêm cancelamentos." />
        <AcoesList records={cancelRows} onlyCancel />
      </section>
    );
  } catch (error) {
    return (
      <ErrorState
        title="Falha ao carregar cancelamentos"
        description={
          error instanceof Error
            ? error.message
            : "Não foi possível consultar ações para filtro de cancelamento."
        }
      />
    );
  }
}
