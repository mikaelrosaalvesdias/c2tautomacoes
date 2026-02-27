import Link from "next/link";
import { notFound } from "next/navigation";
import { ErrorState } from "@/components/ErrorState";
import { PageHeader } from "@/components/PageHeader";
import { StatusBadge } from "@/components/StatusBadge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { fetchTableRowById } from "@/lib/nocodb";
import { formatDateTime, getField, isCancelAction } from "@/lib/record-utils";

export default async function AcoesDetailPage({ params }: { params: { id: string } }) {
  let record: Record<string, unknown> | null;

  try {
    record = await fetchTableRowById("acoes_automacao", params.id);
  } catch (error) {
    return (
      <ErrorState
        title="Falha ao carregar ação"
        description={error instanceof Error ? error.message : "Não foi possível carregar o registro solicitado."}
      />
    );
  }

  if (!record) {
    notFound();
  }

  const company = getField(record, ["empresa"]);
  const action = getField(record, ["acao"]);
  const lang = getField(record, ["lang"]);

  return (
    <section className="space-y-6">
      <PageHeader
        title={`Ação #${params.id}`}
        subtitle={action || "Detalhe da ação"}
        actions={
          <Link
            href="/acoes"
            className="inline-flex h-8 items-center rounded-md border border-slate-300 bg-white px-3 text-xs font-medium text-slate-700 hover:bg-slate-50"
          >
            Voltar
          </Link>
        }
      />

      <div className="flex flex-wrap gap-2">
        {company ? <StatusBadge label={company} /> : null}
        {action ? <StatusBadge label={action} tone={isCancelAction(record) ? "danger" : "success"} /> : null}
        {lang ? <StatusBadge label={lang} tone="neutral" /> : null}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Metadados</CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="grid gap-4 text-sm sm:grid-cols-2">
            <div>
              <dt className="font-medium text-slate-500">Data</dt>
              <dd className="mt-1 text-slate-900">{formatDateTime(getField(record, ["created_at"]))}</dd>
            </div>
            <div>
              <dt className="font-medium text-slate-500">Email</dt>
              <dd className="mt-1 text-slate-900">{getField(record, ["email"]) || "-"}</dd>
            </div>
            <div>
              <dt className="font-medium text-slate-500">Nome</dt>
              <dd className="mt-1 text-slate-900">{getField(record, ["nome"]) || "-"}</dd>
            </div>
            <div>
              <dt className="font-medium text-slate-500">Motivo cancelamento</dt>
              <dd className="mt-1 text-slate-900">{getField(record, ["motivo_cancelamento"]) || "-"}</dd>
            </div>
          </dl>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Mensagem do usuário</CardTitle>
        </CardHeader>
        <CardContent>
          <pre className="whitespace-pre-wrap rounded-md border border-slate-200 bg-slate-50 p-4 text-sm leading-relaxed text-slate-800">
            {getField(record, ["mensagem_usuario"]) || "-"}
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
