import { EmptyState } from "@/components/EmptyState";
import { LoadingState } from "@/components/LoadingState";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

type DataTableProps = {
  columns: string[];
  loading?: boolean;
  empty?: boolean;
  emptyTitle?: string;
  emptyDescription?: string;
  children: React.ReactNode;
};

export function DataTable({
  columns,
  loading = false,
  empty = false,
  emptyTitle = "Nenhum registro encontrado",
  emptyDescription,
  children
}: DataTableProps) {
  if (loading) {
    return <LoadingState />;
  }

  if (empty) {
    return <EmptyState title={emptyTitle} description={emptyDescription} />;
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          {columns.map((column) => (
            <TableHead key={column}>{column}</TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>{children}</TableBody>
    </Table>
  );
}

export function DataTableCellEmpty() {
  return <TableCell className="text-muted-foreground">-</TableCell>;
}
