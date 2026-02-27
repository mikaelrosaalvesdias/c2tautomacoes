import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight, CheckCircle, Zap, ArrowRight } from "lucide-react";
import { ErrorState } from "@/components/ErrorState";
import { CompanyBadge, StatusBadge } from "@/components/StatusBadge";
import { fetchTableRowById } from "@/lib/nocodb";
import { formatDateTime, getField } from "@/lib/record-utils";

export default async function InboxDetailPage({ params }: { params: { id: string } }) {
  let record: Record<string, unknown> | null;
  try {
    record = await fetchTableRowById("chegada_suporte", params.id);
  } catch (error) {
    return <ErrorState title="Falha ao carregar inbox" description={error instanceof Error ? error.message : "Erro."} />;
  }
  if (!record) notFound();

  const emailRef = getField(record, ["remetente", "sender"]) || getField(record, ["destinatario", "destinatário", "to"]);
  const company = getField(record, ["empresa"]);
  const etiqueta = getField(record, ["etiqueta"]);
  const subject = getField(record, ["assunto", "subject"]);
  const body = getField(record, ["conteudo", "conteúdo", "body"]);
  const date = formatDateTime(getField(record, ["data", "created_at"]));

  return (
    <section className="space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
        <Link href="/inbox" className="hover:text-foreground transition-colors">Inbox</Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="text-foreground">Detalhes #{params.id}</span>
      </div>

      {/* Header row */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          {company ? <CompanyBadge label={company} /> : null}
          {etiqueta ? <StatusBadge label={etiqueta} /> : null}
        </div>
        {date ? <span className="text-sm text-muted-foreground">Data: {date}</span> : null}
      </div>

      {/* Meta */}
      <div className="text-sm space-y-1 text-muted-foreground">
        <p><span className="text-foreground font-500">Remetente:</span> {getField(record, ["remetente", "sender"]) || "-"}</p>
        <p><span className="text-foreground font-500">Destinatário:</span> {getField(record, ["destinatario", "destinatário", "to"]) || "-"}</p>
      </div>

      {/* Message body */}
      <div className="rounded-xl border border-border bg-card p-6">
        {subject && <p className="font-600 text-foreground mb-3">Assunto: {subject}</p>}
        <pre className="whitespace-pre-wrap text-sm leading-relaxed text-foreground/80 font-sans">
          {body || "Sem conteúdo."}
        </pre>
      </div>

      {/* Action buttons */}
      <div className="flex flex-wrap gap-3">
        <button className="inline-flex items-center gap-2 rounded-lg border border-neon/40 bg-neon/10 px-4 py-2 text-sm font-500 text-neon transition-all hover:bg-neon/20">
          <CheckCircle className="h-4 w-4" /> Marcar como resolvido
        </button>
        {emailRef && (
          <Link
            href={`/acoes?email=${encodeURIComponent(emailRef)}`}
            className="inline-flex items-center gap-2 rounded-lg border border-amber-500/40 bg-amber-500/10 px-4 py-2 text-sm font-500 text-amber-400 transition-all hover:bg-amber-500/20"
          >
            <Zap className="h-4 w-4" /> Criar ação
          </Link>
        )}
        <Link
          href="/acoes"
          className="inline-flex items-center gap-2 rounded-lg border border-violet/40 bg-violet/10 px-4 py-2 text-sm font-500 text-violet transition-all hover:bg-violet/20"
        >
          <ArrowRight className="h-4 w-4" /> Ver ações relacionadas
        </Link>
      </div>
    </section>
  );
}
