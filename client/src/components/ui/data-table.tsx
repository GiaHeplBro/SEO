import * as React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface DataTableProps<T> {
  columns: {
    accessorKey: string;
    header: string;
    cell?: (item: T) => React.ReactNode;
  }[];
  data: T[];
  pageSize?: number;
  pageCount?: number;
  page?: number;
  onPageChange?: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
  loading?: boolean;
}

export function DataTable<T>({
  columns,
  data,
  pageSize = 5,
  pageCount = 1,
  page = 1,
  onPageChange,
  onPageSizeChange,
  loading = false,
}: DataTableProps<T>) {
  return (
    <div>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader className="bg-muted">
            <TableRow>
              {columns.map((column) => (
                <TableHead key={column.accessorKey} className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  {column.header}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  Loading...
                </TableCell>
              </TableRow>
            ) : data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  No results found
                </TableCell>
              </TableRow>
            ) : (
              data.map((row, rowIndex) => (
                <TableRow key={rowIndex} className="hover:bg-muted/50">
                  {columns.map((column) => (
                    <TableCell key={`${rowIndex}-${column.accessorKey}`} className="px-6 py-4 whitespace-nowrap">
                      {column.cell
                        ? column.cell(row)
                        : (row as any)[column.accessorKey]}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      <div className="border-t border-border px-4 py-3 flex items-center justify-between">
        <div className="flex items-center">
          <Select
            value={String(pageSize)}
            onValueChange={(value) => onPageSizeChange?.(Number(value))}
          >
            <SelectTrigger className="w-[130px] text-sm h-8">
              <SelectValue placeholder="Rows per page" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="5">5 per page</SelectItem>
              <SelectItem value="10">10 per page</SelectItem>
              <SelectItem value="20">20 per page</SelectItem>
            </SelectContent>
          </Select>
          <span className="text-xs text-muted-foreground ml-2">
            {data.length > 0
              ? `Showing ${(page - 1) * pageSize + 1}-${Math.min(
                  page * pageSize,
                  data.length
                )} of ${data.length} items`
              : "No items"}
          </span>
        </div>
        <div className="flex items-center">
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8 mr-2"
            onClick={() => onPageChange?.(page - 1)}
            disabled={page === 1}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          {Array.from({ length: Math.min(pageCount, 3) }, (_, i) => {
            const pageNumber = page > 2 && pageCount > 3 ? page - 1 + i : i + 1;
            return (
              <Button
                key={i}
                variant={page === pageNumber ? "default" : "ghost"}
                className="h-8 w-8 text-sm"
                onClick={() => onPageChange?.(pageNumber)}
              >
                {pageNumber}
              </Button>
            );
          })}
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8 ml-2"
            onClick={() => onPageChange?.(page + 1)}
            disabled={page === pageCount}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
