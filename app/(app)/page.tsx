import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ErrorState } from "@/components/ErrorState";
import { PageHeader } from "@/components/PageHeader";
import { fetchTableRows } from "@/lib/nocodb";
import { getDateValue, isCancelAction } from "@/lib/record-utils";

function countLastSevenDays(records: Array<Record<string, unknown>>) {
  const threshold = Date.now() - 7 * 24 * 60 * 60 * 1000;

  return records.reduce((total, record) => {
    const date = getDateValue(record);
    if (!date) {
      return total;
    }

    return date.getTime() >= threshold ? total + 1 : total;
  }, 0);
}

export default async function DashboardPage() {
  try {
    const [inboxRows, actionRows, emailRows] = await Promise.all([
      fetchTableRows("chegada_suporte", { limit: 200 }),
      fetchTableRows("acoes_automacao", { limit: 200 }),
      fetchTableRows("emails_comercial", { limit: 200 })
    ]);

    const inboxCount = countLastSevenDays(inboxRows);
    const actionsCount = countLastSevenDays(actionRows);
    const cancelCount = countLastSevenDays(actionRows.filter(isCancelAction));
    const emailsCount = countLastSevenDays(emailRows);

    return (
      <section className="space-y-6">
        <PageHeader title="Dashboard" subtitle="Visão resumida dos últimos 7 dias." />

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <Card>
            <CardHeader>
              <CardTitle>Inbox</CardTitle>
              <CardDescription>chegada_suporte</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{inboxCount}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Ações</CardTitle>
              <CardDescription>acoes_automacao</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{actionsCount}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Cancelamentos</CardTitle>
              <CardDescription>Ações que contêm "cancel"</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{cancelCount}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Emails</CardTitle>
              <CardDescription>emails_comercial</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{emailsCount}</p>
            </CardContent>
          </Card>
        </div>
      </section>
    );
  } catch (error) {
    return (
      <ErrorState
        title="Falha ao montar dashboard"
        description={
          error instanceof Error
            ? error.message
            : "Não foi possível consultar as tabelas no NocoDB. Tente novamente."
        }
      />
    );
  }
}
