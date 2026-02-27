import Link from "next/link";
import { notFound } from "next/navigation";
import { ErrorState } from "@/components/ErrorState";
import { PageHeader } from "@/components/PageHeader";
import { StatusBadge } from "@/components/StatusBadge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { fetchTableRowById } from "@/lib/nocodb";
import { getField } from "@/lib/record-utils";

export default async function EmailDetailPage({ params }: { params: { id: string } }) {
  let record: Record<string, unknown> | null;

  try {
    record = await fetchTableRowById("emails_comercial", params.id);
  } catch (error) {
    return (
      <ErrorState
        title="Falha ao carregar e-mail"
        description={error instanceof Error ? error.message : "Não foi possível carregar o registro solicitado."}
      />
    );
  }

  if (!record) {
    notFound();
  }

  const company = getField(record, ["empresa"]);
  const action = getField(record, ["acao"]);

  return (
    <section className="space-y-6">
      <PageHeader
        title={`Email #${params.id}`}
        subtitle={action || "Detalhe do e-mail"}
        actions={
          <Link
            href="/emails"
            className="inline-flex h-8 items-center rounded-md border border-slate-300 bg-white px-3 text-xs font-medium text-slate-700 hover:bg-slate-50"
          >
            Voltar
          </Link>
        }
      />

      <div className="flex flex-wrap gap-2">
        {company ? <StatusBadge label={company} /> : null}
        {action ? <StatusBadge label={action} tone="success" /> : null}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Metadados</CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="grid gap-4 text-sm sm:grid-cols-2">
            <div>
              <dt className="font-medium text-slate-500">Remetente</dt>
              <dd className="mt-1 text-slate-900">{getField(record, ["remetente"]) || "-"}</dd>
            </div>
            <div>
              <dt className="font-medium text-slate-500">Destinatário</dt>
              <dd className="mt-1 text-slate-900">{getField(record, ["destinatario", "destinatário"]) || "-"}</dd>
            </div>
            <div>
              <dt className="font-medium text-slate-500">Ação</dt>
              <dd className="mt-1 text-slate-900">{getField(record, ["acao"]) || "-"}</dd>
            </div>
            <div>
              <dt className="font-medium text-slate-500">Empresa</dt>
              <dd className="mt-1 text-slate-900">{getField(record, ["empresa"]) || "-"}</dd>
            </div>
          </dl>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Mensagem</CardTitle>
        </CardHeader>
        <CardContent>
          <pre className="whitespace-pre-wrap rounded-md border border-slate-200 bg-slate-50 p-4 text-sm leading-relaxed text-slate-800">
            {getField(record, ["mensagem", "body"]) || "-"}
          </pre>
        </CardContent>
      </Card>

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
