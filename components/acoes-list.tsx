"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { DataTable } from "@/components/DataTable";
import { StatusBadge } from "@/components/StatusBadge";
import { Input } from "@/components/ui/input";
import { TableCell, TableRow } from "@/components/ui/table";
import type { GenericRecord } from "@/lib/record-utils";
import { containsText, formatDateTime, getField, getRecordId, isCancelAction } from "@/lib/record-utils";

type AcoesListProps = {
  records: GenericRecord[];
  onlyCancel?: boolean;
  initialEmailFilter?: string;
};

export function AcoesList({ records, onlyCancel = false, initialEmailFilter = "" }: AcoesListProps) {
  const [query, setQuery] = useState(initialEmailFilter);
  const [company, setCompany] = useState("all");

  const source = useMemo(() => (onlyCancel ? records.filter(isCancelAction) : records), [records, onlyCancel]);

  const companies = useMemo(() => {
    const set = new Set<string>();
    for (const record of source) {
      const value = getField(record, ["empresa"]);
      if (value) {
        set.add(value);
      }
    }
    return ["all", ...Array.from(set).sort((a, b) => a.localeCompare(b))];
  }, [source]);

  const filtered = useMemo(() => {
    return source.filter((record) => {
      const haystack = [
        getField(record, ["email"]),
        getField(record, ["nome"]),
        getField(record, ["acao"]),
        getField(record, ["empresa"])
      ]
        .filter(Boolean)
        .join(" ");

      const matchesQuery = !query.trim() || containsText(haystack, query);
      const matchesCompany = company === "all" || getField(record, ["empresa"]) === company;
      return matchesQuery && matchesCompany;
    });
  }, [source, query, company]);

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <Input
          placeholder={onlyCancel ? "Buscar cancelamentos" : "Buscar por email, nome, ação ou empresa"}
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
        <select
          className="h-10 rounded-md border border-border bg-secondary px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-neon/50"
          value={company}
          onChange={(event) => setCompany(event.target.value)}
        >
          {companies.map((item) => (
            <option key={item} value={item}>
              {item === "all" ? "Todas as empresas" : item}
            </option>
          ))}
        </select>
      </div>

      <DataTable
        columns={["Data", "Empresa", "Email", "Nome", "Ação", "Lang", "Motivo"]}
        empty={filtered.length === 0}
        emptyTitle={onlyCancel ? "Nenhum cancelamento encontrado" : "Nenhuma ação encontrada"}
      >
        {filtered.map((record) => {
          const id = getRecordId(record);
          const companyLabel = getField(record, ["empresa"]);
          const action = getField(record, ["acao"]);

          const tone = isCancelAction(record) ? "danger" : "success";

          return (
            <TableRow key={id || JSON.stringify(record)}>
              <TableCell>{formatDateTime(getField(record, ["created_at"]))}</TableCell>
              <TableCell>
                {companyLabel ? <StatusBadge label={companyLabel} /> : <span className="text-muted-foreground">-</span>}
              </TableCell>
              <TableCell className="max-w-[220px] truncate">{getField(record, ["email"]) || "-"}</TableCell>
              <TableCell className="max-w-[180px] truncate">{getField(record, ["nome"]) || "-"}</TableCell>
              <TableCell>
                {action ? <StatusBadge label={action} tone={tone} /> : <span className="text-muted-foreground">-</span>}
              </TableCell>
              <TableCell>{getField(record, ["lang"]) || "-"}</TableCell>
              <TableCell className="max-w-[220px] truncate">
                {id ? (
                  <Link href={`/acoes/${id}`} className="font-medium text-neon hover:underline">
                    {getField(record, ["motivo_cancelamento"]) || "Ver detalhe"}
                  </Link>
                ) : (
                  <span>{getField(record, ["motivo_cancelamento"]) || "-"}</span>
                )}
              </TableCell>
            </TableRow>
          );
        })}
      </DataTable>
    </div>
  );
}
