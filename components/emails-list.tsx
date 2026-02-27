"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { DataTable } from "@/components/DataTable";
import { StatusBadge } from "@/components/StatusBadge";
import { Input } from "@/components/ui/input";
import { TableCell, TableRow } from "@/components/ui/table";
import type { GenericRecord } from "@/lib/record-utils";
import { containsText, getField, getRecordId } from "@/lib/record-utils";

type EmailsListProps = {
  records: GenericRecord[];
};

export function EmailsList({ records }: EmailsListProps) {
  const [query, setQuery] = useState("");
  const [company, setCompany] = useState("all");

  const companies = useMemo(() => {
    const set = new Set<string>();
    for (const record of records) {
      const value = getField(record, ["empresa"]);
      if (value) {
        set.add(value);
      }
    }
    return ["all", ...Array.from(set).sort((a, b) => a.localeCompare(b))];
  }, [records]);

  const filtered = useMemo(() => {
    return records.filter((record) => {
      const haystack = [
        getField(record, ["remetente"]),
        getField(record, ["destinatario", "destinatário"]),
        getField(record, ["acao"]),
        getField(record, ["empresa"])
      ]
        .filter(Boolean)
        .join(" ");

      const matchesQuery = !query.trim() || containsText(haystack, query);
      const matchesCompany = company === "all" || getField(record, ["empresa"]) === company;
      return matchesQuery && matchesCompany;
    });
  }, [records, query, company]);

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <Input
          placeholder="Buscar por remetente, destinatário, ação ou empresa"
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
        columns={["Remetente", "Destinatário", "Ação", "Empresa"]}
        empty={filtered.length === 0}
        emptyTitle="Nenhum email encontrado"
      >
        {filtered.map((record) => {
          const id = getRecordId(record);
          const action = getField(record, ["acao"]);
          const companyLabel = getField(record, ["empresa"]);

          return (
            <TableRow key={id || JSON.stringify(record)}>
              <TableCell className="max-w-[260px] truncate">
                {id ? (
                  <Link href={`/emails/${id}`} className="font-medium text-neon hover:underline">
                    {getField(record, ["remetente"]) || "-"}
                  </Link>
                ) : (
                  <span>{getField(record, ["remetente"]) || "-"}</span>
                )}
              </TableCell>
              <TableCell className="max-w-[260px] truncate">{getField(record, ["destinatario", "destinatário"]) || "-"}</TableCell>
              <TableCell>{action ? <StatusBadge label={action} tone="success" /> : <span className="text-muted-foreground">-</span>}</TableCell>
              <TableCell>{companyLabel ? <StatusBadge label={companyLabel} /> : <span className="text-muted-foreground">-</span>}</TableCell>
            </TableRow>
          );
        })}
      </DataTable>
    </div>
  );
}
