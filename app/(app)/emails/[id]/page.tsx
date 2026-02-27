import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { ErrorState } from "@/components/ErrorState";
import { CompanyBadge, StatusBadge } from "@/components/StatusBadge";
import { fetchTableRowById } from "@/lib/nocodb";
import { getField } from "@/lib/record-utils";

export default async function EmailDetailPage({ params }: { params: { id: string } }) {
  let record: Record<string, unknown> | null;
  try {
    record = await fetchTableRowById("emails_comercial", params.id);
  } catch (error) {
    return <ErrorState title="Falha ao carregar e-mail" description={error instanceof Error ? error.message : "Erro."} />;
  }
  if (!record) notFound();

  const company = getField(record, ["empresa"]);
  const action = getField(record, ["acao"]);
  const body = getField(record, ["mensagem", "body"]);

  return (
    <section className="space-y-6">
      <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
        <Link href="/emails" className="hover:text-foreground transition-colors">Emails</Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="text-foreground">Detalhe #{params.id}</span>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {company ? <CompanyBadge label={company} /> : null}
        {action ? <StatusBadge label={action} /> : null}
      </div>

      <div className="text-sm space-y-1 text-muted-foreground">
        <p><span className="text-foreground font-500">Remetente:</span> {getField(record, ["remetente"]) || "-"}</p>
        <p><span className="text-foreground font-500">Destinatário:</span> {getField(record, ["destinatario", "destinatário"]) || "-"}</p>
      </div>

      <div className="rounded-xl border border-border bg-card p-6">
        <pre className="whitespace-pre-wrap text-sm leading-relaxed text-foreground/80 font-sans">
          {body || "Sem conteúdo."}
        </pre>
      </div>
    </section>
  );
}
