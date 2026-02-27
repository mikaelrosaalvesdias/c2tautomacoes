import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight, Circle } from "lucide-react";
import { ErrorState } from "@/components/ErrorState";
import { CompanyBadge, StatusBadge } from "@/components/StatusBadge";
import { fetchTableRowById } from "@/lib/nocodb";
import { formatDateTime, getField, isCancelAction } from "@/lib/record-utils";

export default async function AcoesDetailPage({ params }: { params: { id: string } }) {
  let record: Record<string, unknown> | null;
  try {
    record = await fetchTableRowById("acoes_automacao", params.id);
  } catch (error) {
    return <ErrorState title="Falha ao carregar ação" description={error instanceof Error ? error.message : "Erro."} />;
  }
  if (!record) notFound();

  const company = getField(record, ["empresa"]);
  const action = getField(record, ["acao"]);
  const lang = getField(record, ["lang"]);
  const date = formatDateTime(getField(record, ["created_at"]));

  const timeline = [
    { label: "Ação criada", date, color: "text-neon bg-neon" },
    { label: "Email enviado ao cliente", date, color: "text-amber-400 bg-amber-400" },
    { label: "Resposta recebida", date, color: "text-violet bg-violet" },
    { label: isCancelAction(record) ? "Cancelamento processado" : "Processamento concluído", date, color: "text-red-400 bg-red-400" }
  ].filter(t => t.date);

  return (
    <section className="space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
        <Link href="/acoes" className="hover:text-foreground transition-colors">Ações</Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="text-foreground">Detalhe #{params.id}</span>
      </div>

      {/* Header row */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          {company ? <CompanyBadge label={company} /> : null}
          {action ? <StatusBadge label={action} tone={isCancelAction(record) ? "danger" : "success"} /> : null}
        </div>
        {date ? <span className="text-sm text-muted-foreground">Data de criação: {date}</span> : null}
      </div>

      {/* Meta */}
      <div className="rounded-xl border border-border bg-card p-5 grid gap-3 sm:grid-cols-2 text-sm">
        <div><span className="text-muted-foreground">Email:</span> <span className="text-foreground ml-1">{getField(record, ["email"]) || "-"}</span></div>
        <div><span className="text-muted-foreground">Nome:</span> <span className="text-foreground ml-1">{getField(record, ["nome"]) || "-"}</span></div>
        <div><span className="text-muted-foreground">Motivo do cancelamento:</span> <span className="text-foreground ml-1">{getField(record, ["motivo_cancelamento"]) || "-"}</span></div>
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground">Ação:</span>
          {action ? <StatusBadge label={action} tone={isCancelAction(record) ? "danger" : "success"} /> : <span className="text-foreground ml-1">-</span>}
          {lang ? <StatusBadge label={lang} tone="neutral" /> : null}
        </div>
      </div>

      {/* Message body */}
      {getField(record, ["mensagem_usuario"]) && (
        <div className="rounded-xl border border-border bg-card p-6">
          <pre className="whitespace-pre-wrap text-sm leading-relaxed text-foreground/80 font-sans">
            {getField(record, ["mensagem_usuario"])}
          </pre>
        </div>
      )}

      {/* Timeline */}
      {timeline.length > 0 && (
        <div className="rounded-xl border border-border bg-card p-5">
          <p className="font-600 text-foreground mb-4">Timeline</p>
          <div className="space-y-4">
            {timeline.map((t, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className={`mt-0.5 h-2.5 w-2.5 shrink-0 rounded-full ${t.color.split(" ")[1]}`} />
                <div>
                  <p className={`text-sm font-500 ${t.color.split(" ")[0]}`}>{t.label}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{t.date}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
