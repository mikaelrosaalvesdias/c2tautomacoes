import Link from "next/link";
import { notFound } from "next/navigation";
import { ErrorState } from "@/components/ErrorState";
import { PageHeader } from "@/components/PageHeader";
import { StatusBadge } from "@/components/StatusBadge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { fetchTableRowById } from "@/lib/nocodb";
import { formatDateTime, getField } from "@/lib/record-utils";

export default async function InboxDetailPage({ params }: { params: { id: string } }) {
  let record: Record<string, unknown> | null;

  try {
    record = await fetchTableRowById("chegada_suporte", params.id);
  } catch (error) {
    return (
      <ErrorState
        title="Falha ao carregar inbox"
        description={error instanceof Error ? error.message : "Não foi possível carregar o registro solicitado."}
      />
    );
  }

  if (!record) {
    notFound();
  }

  const emailRef =
    getField(record, ["remetente", "sender"]) || getField(record, ["destinatario", "destinatário", "to"]);

  const company = getField(record, ["empresa"]);
  const etiqueta = getField(record, ["etiqueta"]);

  return (
    <section className="space-y-6">
      <PageHeader
        title={`Inbox #${params.id}`}
        subtitle={getField(record, ["assunto", "subject"]) || "Sem assunto"}
        actions={
          <Link
            href="/inbox"
            className="inline-flex h-8 items-center rounded-md border border-slate-300 bg-white px-3 text-xs font-medium text-slate-700 hover:bg-slate-50"
          >
            Voltar
          </Link>
        }
      />

      <div className="flex flex-wrap gap-2">
        {company ? <StatusBadge label={company} /> : null}
        {etiqueta ? <StatusBadge label={etiqueta} tone="neutral" /> : null}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Metadados</CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="grid gap-4 text-sm sm:grid-cols-2">
            <div>
              <dt className="font-medium text-slate-500">Remetente</dt>
              <dd className="mt-1 text-slate-900">{getField(record, ["remetente", "sender"]) || "-"}</dd>
            </div>
            <div>
              <dt className="font-medium text-slate-500">Destinatário</dt>
              <dd className="mt-1 text-slate-900">{getField(record, ["destinatario", "destinatário", "to"]) || "-"}</dd>
            </div>
            <div>
              <dt className="font-medium text-slate-500">Data</dt>
              <dd className="mt-1 text-slate-900">{formatDateTime(getField(record, ["data", "created_at"]))}</dd>
            </div>
            <div>
              <dt className="font-medium text-slate-500">Assunto</dt>
              <dd className="mt-1 text-slate-900">{getField(record, ["assunto", "subject"]) || "-"}</dd>
            </div>
          </dl>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Conteúdo completo</CardTitle>
        </CardHeader>
        <CardContent>
          <pre className="whitespace-pre-wrap rounded-md border border-slate-200 bg-slate-50 p-4 text-sm leading-relaxed text-slate-800">
            {getField(record, ["conteudo", "conteúdo", "body"]) || "-"}
          </pre>
        </CardContent>
      </Card>

      {emailRef ? (
        <div>
          <Link href={`/acoes?email=${encodeURIComponent(emailRef)}`} className="text-sm font-medium text-slate-700 underline">
            Ver ações do mesmo e-mail
          </Link>
        </div>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Payload completo</CardTitle>
        </CardHeader>
        <CardContent>
          <pre className="overflow-x-auto rounded-md bg-slate-900 p-4 text-xs text-slate-100">{JSON.stringify(record, null, 2)}</pre>
        </CardContent>
      </Card>
    </section>
  );
}
