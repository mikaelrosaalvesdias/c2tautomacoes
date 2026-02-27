import { Clock, CheckCircle2, AlertTriangle } from "lucide-react";
import { AcoesList } from "@/components/acoes-list";
import { ErrorState } from "@/components/ErrorState";
import { fetchTableRows } from "@/lib/nocodb";
import { getField, isCancelAction } from "@/lib/record-utils";

function KpiCard({ title, value, sub, icon, accent }: {
  title: string; value: number; sub: string; icon: React.ReactNode; accent: string;
}) {
  return (
    <div className={`rounded-xl border bg-card p-5 ${accent}`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xl font-700 text-foreground">{title}</p>
          <p className="text-4xl font-800 text-foreground mt-1">{value}</p>
          <p className="text-xs text-muted-foreground mt-1">{sub}</p>
        </div>
        <div className="rounded-lg p-2.5 opacity-80">{icon}</div>
      </div>
    </div>
  );
}

export default async function CancelamentosPage() {
  try {
    const rows = await fetchTableRows("acoes_automacao", { limit: 200 });
    const cancelRows = rows.filter(isCancelAction);

    const confirmed = cancelRows.filter(r => {
      const a = getField(r, ["acao"])?.toLowerCase() ?? "";
      return a.includes("confirm") || a.includes("cancel");
    }).length;
    const errors = cancelRows.filter(r => {
      const a = getField(r, ["acao"])?.toLowerCase() ?? "";
      return a.includes("erro") || a.includes("error") || a.includes("falha");
    }).length;

    return (
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-600 text-foreground">Cancelamentos</h1>
        </div>

        {/* KPI cards */}
        <div className="grid gap-4 sm:grid-cols-3">
          <KpiCard
            title="Solicitados"
            value={cancelRows.length}
            sub="cancelamentos recentes"
            accent="border-amber-500/25"
            icon={<Clock className="h-6 w-6 text-amber-400" />}
          />
          <KpiCard
            title="Confirmados"
            value={confirmed}
            sub="processados com sucesso"
            accent="border-neon/25"
            icon={<CheckCircle2 className="h-6 w-6 text-neon" />}
          />
          <KpiCard
            title="Erro"
            value={errors}
            sub="falhas no processamento"
            accent="border-red-500/25"
            icon={<AlertTriangle className="h-6 w-6 text-red-400" />}
          />
        </div>

        {/* Table */}
        <AcoesList records={cancelRows} onlyCancel />
      </section>
    );
  } catch (error) {
    return (
      <ErrorState
        title="Falha ao carregar cancelamentos"
        description={error instanceof Error ? error.message : "Não foi possível consultar ações."}
      />
    );
  }
}
