import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { InboxIcon } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "../../lib/utils";
import { Feedback } from "./feedback";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  loading?: boolean;
  onRowClick?: (row: TData) => void;
  onRowSelect?: (row: TData) => void;
  onRowDeselect?: (row: TData) => void;
  isSpecialRow?: (row: TData) => boolean;
  isClickableRow?: (row: TData) => boolean;
}

export function DataTable<TData, TValue>({
  columns,
  data,
  loading = false,
  onRowClick,
  isSpecialRow,
  isClickableRow,
}: DataTableProps<TData, TValue>) {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader className="font-mono uppercase">
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => {
                const columnDef = header.column.columnDef as ColumnDef<
                  TData,
                  TValue
                > & { width?: string };
                return (
                  <TableHead
                    key={header.id}
                    className="text-muted-foreground"
                    style={{ width: columnDef.width }}
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                  </TableHead>
                );
              })}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {loading ? (
            [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((i) => (
              <TableRow key={i}>
                {columns.map((c) => {
                  const columnDef = c as ColumnDef<TData, TValue> & {
                    width?: string;
                  };
                  return (
                    <TableCell key={c.id} style={{ width: columnDef.width }}>
                      <Skeleton className="h-4 w-full" />
                    </TableCell>
                  );
                })}
              </TableRow>
            ))
          ) : table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map((row) => {
              const isSpecial = isSpecialRow?.(row.original) ?? false;
              const isClickable = isClickableRow?.(row.original) ?? !isSpecial;

              return (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                  onClick={() => isClickable && onRowClick?.(row.original)}
                  className={cn(
                    isClickable && onRowClick ? "cursor-pointer" : "",
                  )}
                >
                  {isSpecial ? (
                    <TableCell colSpan={columns.length} className="p-0">
                      {flexRender(
                        row.getVisibleCells()[0].column.columnDef.cell,
                        row.getVisibleCells()[0].getContext(),
                      )}
                    </TableCell>
                  ) : (
                    row.getVisibleCells().map((cell) => {
                      const columnDef = cell.column.columnDef as ColumnDef<
                        TData,
                        TValue
                      > & { width?: string };
                      return (
                        <TableCell
                          key={cell.id}
                          style={{ width: columnDef.width }}
                        >
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext(),
                          )}
                        </TableCell>
                      );
                    })
                  )}
                </TableRow>
              );
            })
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length}>
                <Feedback content="No data available." icon={InboxIcon} />
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
