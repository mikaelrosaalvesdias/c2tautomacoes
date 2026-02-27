"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { DataTable } from "@/components/DataTable";
import { StatusBadge } from "@/components/StatusBadge";
import { Input } from "@/components/ui/input";
import { TableCell, TableRow } from "@/components/ui/table";
import type { GenericRecord } from "@/lib/record-utils";
import { containsText, formatDateTime, getField, getRecordId } from "@/lib/record-utils";

type InboxListProps = {
  records: GenericRecord[];
};

export function InboxList({ records }: InboxListProps) {
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
      const sender = getField(record, ["remetente", "sender"]);
      const subject = getField(record, ["assunto", "subject"]);
      const recordCompany = getField(record, ["empresa"]);
      const matchesQuery = !query.trim() || containsText(sender, query) || containsText(subject, query);
      const matchesCompany = company === "all" || recordCompany === company;
      return matchesQuery && matchesCompany;
    });
  }, [records, query, company]);

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <Input
          placeholder="Buscar por remetente ou assunto"
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
        columns={["Empresa", "Etiqueta", "Remetente", "Destinatário", "Assunto", "Data"]}
        empty={filtered.length === 0}
        emptyTitle="Nenhum e-mail encontrado"
        emptyDescription="Ajuste os filtros ou aguarde novos registros na inbox."
      >
        {filtered.map((record) => {
          const id = getRecordId(record);
          const subject = getField(record, ["assunto", "subject"]);
          const companyLabel = getField(record, ["empresa"]);
          const tagLabel = getField(record, ["etiqueta"]);

          return (
            <TableRow key={id || JSON.stringify(record)}>
              <TableCell>
                {companyLabel ? <StatusBadge label={companyLabel} /> : <span className="text-muted-foreground">-</span>}
              </TableCell>
              <TableCell>{tagLabel ? <StatusBadge label={tagLabel} tone="neutral" /> : <span className="text-muted-foreground">-</span>}</TableCell>
              <TableCell className="max-w-[220px] truncate">{getField(record, ["remetente", "sender"]) || "-"}</TableCell>
              <TableCell className="max-w-[220px] truncate">{getField(record, ["destinatario", "destinatário", "to"]) || "-"}</TableCell>
              <TableCell className="max-w-[260px] truncate">
                {id ? (
                  <Link href={`/inbox/${id}`} className="font-medium text-neon hover:underline">
                    {subject || "Sem assunto"}
                  </Link>
                ) : (
                  <span>{subject || "Sem assunto"}</span>
                )}
              </TableCell>
              <TableCell>{formatDateTime(getField(record, ["data", "created_at"]))}</TableCell>
            </TableRow>
          );
        })}
      </DataTable>
    </div>
  );
}
