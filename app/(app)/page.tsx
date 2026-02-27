import { Mail, Settings2, XCircle, Send } from "lucide-react";
import { ErrorState } from "@/components/ErrorState";
import { fetchTableRows } from "@/lib/nocodb";
import { getDateValue, isCancelAction } from "@/lib/record-utils";
import { DashboardCharts } from "@/components/DashboardCharts";

function countLastNDays(records: Array<Record<string, unknown>>, days: number) {
  const threshold = Date.now() - days * 24 * 60 * 60 * 1000;
  return records.reduce((t, r) => {
    const d = getDateValue(r);
    return d && d.getTime() >= threshold ? t + 1 : t;
  }, 0);
}

type KpiCardProps = {
  title: string;
  value: number;
  icon: React.ReactNode;
  accent: string; // tailwind color class for border + icon bg
};

function KpiCard({ title, value, icon, accent }: KpiCardProps) {
  return (
    <div className={`relative overflow-hidden rounded-xl border bg-card p-5 ${accent}`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-500 text-muted-foreground">{title}</p>
          <p className="mt-1.5 text-3xl font-700 text-foreground">{value}</p>
        </div>
        <div className="rounded-lg p-2.5 opacity-80">{icon}</div>
      </div>
    </div>
  );
}

export default async function DashboardPage() {
  try {
    const [inboxRows, actionRows, emailRows] = await Promise.all([
      fetchTableRows("chegada_suporte", { limit: 200 }),
      fetchTableRows("acoes_automacao", { limit: 200 }),
      fetchTableRows("emails_comercial", { limit: 200 })
    ]);

    const inboxCount = countLastNDays(inboxRows, 7);
    const actionsCount = countLastNDays(actionRows, 7);
    const cancelCount = countLastNDays(actionRows.filter(isCancelAction), 7);
    const emailsCount = countLastNDays(emailRows, 7);

    return (
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-600 text-foreground">Dashboard</h1>
          <span className="text-xs text-muted-foreground">Últimos 7 dias</span>
        </div>

        {/* KPI cards */}
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <KpiCard
            title="Emails Recebidos"
            value={inboxCount}
            accent="border-neon/25"
            icon={<Mail className="h-5 w-5 text-neon" />}
          />
          <KpiCard
            title="Ações Criadas"
            value={actionsCount}
            accent="border-amber-500/25"
            icon={<Settings2 className="h-5 w-5 text-amber-400" />}
          />
          <KpiCard
            title="Cancelamentos"
            value={cancelCount}
            accent="border-violet/25"
            icon={<XCircle className="h-5 w-5 text-violet" />}
          />
          <KpiCard
            title="Emails Enviados"
            value={emailsCount}
            accent="border-neon/25"
            icon={<Send className="h-5 w-5 text-neon" />}
          />
        </div>

        {/* Charts */}
        <DashboardCharts actionRows={actionRows} emailRows={emailRows} />
      </section>
    );
  } catch (error) {
    return (
      <ErrorState
        title="Falha ao montar dashboard"
        description={error instanceof Error ? error.message : "Não foi possível consultar as tabelas no NocoDB."}
      />
    );
  }
}
