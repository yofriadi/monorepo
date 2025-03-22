"use client"

import { useState, useMemo, useTransition } from "react"
import { useRouter } from "next/navigation"
import { useQueryState } from "nuqs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@workspace/ui/components/table"
import { createColumnHelper, flexRender, getCoreRowModel, getPaginationRowModel, useReactTable } from "@tanstack/react-table"
import type { ProductSnapshot } from "../query/product-by-id"
import { Button } from "@workspace/ui/components/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@workspace/ui/components/select"
import { ExternalLink } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@workspace/ui/components/tooltip"
import { DateRange } from "react-day-picker"
import { DatePickerWithRange } from "./date-picker-with-range"
import { DataTableFacetedFilter } from "./data-table-faceted-filter"
import { Skeleton } from "@workspace/ui/components/skeleton"

const cleanSource = (source: string) => {
  return source.replace(/^www\./, '').replace(/\.com$/, '');
};

const columnHelper = createColumnHelper<ProductSnapshot>()
const columns = [
  columnHelper.accessor("createdAt", {
    cell: (info) => new Date(info.getValue()).toLocaleDateString(),
    header: "Date Scraped",
  }),
  columnHelper.accessor("platform", {
    cell: (info) => cleanSource(info.getValue() || "-"),
    header: "Source",
  }),
  columnHelper.accessor("dial", {
    cell: (info) => info.getValue() || "-",
    header: "Dial",
  }),
  columnHelper.accessor("caseDiameter", {
    cell: (info) => {
      const value = info.getValue();
      return value ? value.replace(/Try it on.*$/s, "").trim() : "-";
    },
    header: "Case Diameter",
  }),
  columnHelper.accessor("caseMaterial", {
    cell: (info) => info.getValue() || "-",
    header: "Case Material",
  }),
  columnHelper.accessor("yearOfProduction", {
    cell: (info) => {
      const value = info.getValue();
      if (!value || value === "Unknown") return "-";
      return value.replace(/ ?\(Approximation\)/i, "");
    },
    header: "Year of Production",
  }),
  columnHelper.accessor("condition", {
    cell: (info) => info.getValue() || "-",
    header: "Condition",
  }),
  columnHelper.accessor("scopeOfDelivery", {
    cell: (info) => info.getValue() || "-",
    header: "Scope of Delivery",
  }),
  columnHelper.accessor("location", {
    cell: (info) => info.getValue() || "-",
    header: "Location",
  }),
  columnHelper.accessor(row => ({ currency: row.currency, price: row.price }), {
    id: "priceWithCurrency",
    cell: (info) => {
      const { currency, price } = info.getValue();
      if (!currency || !price) return "-";
      return `${currency}${Number(price).toLocaleString()}`;
    },
    header: "Price",
  }),
  columnHelper.accessor("url", {
    cell: (info) => {
      const url = info.getValue();
      const fullUrl = url.startsWith('http') ? url : `https://${url}`;
      return (
        <div className="flex justify-center">
          <a href={fullUrl} target="_blank" rel="noopener noreferrer" className="text-primary hover:text-primary/80">
            <ExternalLink size={16} />
          </a>
        </div>
      );
    },
    header: "Link",
  }),
]

const CONDITION_OPTIONS = [
  {
    label: "New",
    value: "New"
  },
  {
    label: "Like new & unworn",
    value: "Like new & unworn"
  },
  {
    label: "Used (very good)",
    value: "Used (Very good)"
  },
  {
    label: "Used (good)",
    value: "Used (Good)"
  },
  {
    label: "Used (fair)",
    value: "Used (Fair)"
  },
  {
    label: "Incomplete",
    value: "Incomplete"
  },
];

const YEAR_OPTIONS = [
  ...[...Array(11)].map((_, i) => ({
    label: `${2025 - i}`,
    value: `${2025 - i}`,
  })),
  { label: "Others", value: "Others" },
];

interface ScrapedDataTableProps {
  data: ProductSnapshot[]
  dateRange?: DateRange
  onDateRangeChange?: (dateRange: DateRange | undefined) => void
}

export function ScrapedDataTable({ data, dateRange, onDateRangeChange }: ScrapedDataTableProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  const [conditionFilter, setConditionFilter] = useQueryState("condition")
  const [yearFilter, setYearFilter] = useQueryState("year")

  const [pendingDateFiltered, setPendingDateFiltered] = useState<ProductSnapshot[]>(data)

  useMemo(() => {
    let filtered = [...data];

    if (dateRange?.from || dateRange?.to) {
      filtered = filtered.filter(item => {
        const itemDate = new Date(item.createdAt);
        const fromDate = dateRange?.from ? new Date(dateRange.from) : null;
        const toDate = dateRange?.to ? new Date(dateRange.to) : null;

        if (fromDate && toDate) {
          return itemDate >= fromDate && itemDate <= toDate;
        }
        if (fromDate) {
          return itemDate >= fromDate;
        }
        if (toDate) {
          return itemDate <= toDate;
        }
        return true;
      });
    }

    setPendingDateFiltered(filtered);
  }, [data, dateRange]);

  const handleConditionFilter = (values: string[]) => {
    startTransition(() => {
      setConditionFilter(values.length ? values.join(',') : null);
    });
  };

  const handleYearFilter = (values: string[]) => {
    startTransition(() => {
      setYearFilter(values.length ? values.join(',') : null);
    });
  };

  const handleClearFilters = () => {
    startTransition(() => {
      setConditionFilter(null);
      setYearFilter(null);
      if (onDateRangeChange) {
        onDateRangeChange(undefined);
      }
    });
  };

  const table = useReactTable({
    data: pendingDateFiltered,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: {
        pageSize: 20,
      },
    },
  })

  const getSelectedConditions = (): string[] => {
    return conditionFilter ? conditionFilter.split(',') : [];
  };

  const getSelectedYears = (): string[] => {
    return yearFilter ? yearFilter.split(',') : [];
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          <DatePickerWithRange
            onDateChange={onDateRangeChange}
            value={dateRange}
          />
          <DataTableFacetedFilter
            title="Condition"
            options={CONDITION_OPTIONS}
            selectedValues={getSelectedConditions()}
            onValuesChange={handleConditionFilter}
            filterId="condition"
            disabled={isPending}
          />
          <DataTableFacetedFilter
            title="Year"
            options={YEAR_OPTIONS}
            selectedValues={getSelectedYears()}
            onValuesChange={handleYearFilter}
            filterId="yearOfProduction"
            disabled={isPending}
          />
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleClearFilters}
          disabled={isPending || (!conditionFilter && !yearFilter && !dateRange)}
        >
          Clear Filters
        </Button>
      </div>
      <div className="rounded-md border overflow-x-auto">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id} className="text-left whitespace-nowrap">
                    {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {isPending ? (
              Array.from({ length: 5 }).map((_, index) => (
                <TableRow key={`loading-${index}`}>
                  {Array.from({ length: columns.length }).map((_, cellIndex) => (
                    <TableCell key={`loading-cell-${cellIndex}`}>
                      <Skeleton className="h-5 w-full" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : table.getRowModel().rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="text-center py-4">
                  No data available
                </TableCell>
              </TableRow>
            ) : (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="text-left truncate max-w-[120px]">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span>{flexRender(cell.column.columnDef.cell, cell.getContext())}</span>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>{cell.getValue() as string}</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-end">
        <div className="flex items-center gap-6">
          <div className="flex items-center space-x-2">
            <p className="text-sm font-medium">Rows per page</p>
            <Select
              value={`${table.getState().pagination.pageSize}`}
              onValueChange={(value) => {
                table.setPageSize(Number(value))
              }}
            >
              <SelectTrigger className="h-8 w-[70px]">
                <SelectValue placeholder={table.getState().pagination.pageSize} />
              </SelectTrigger>
              <SelectContent side="top">
                {[20, 30, 50].map((pageSize) => (
                  <SelectItem key={pageSize} value={`${pageSize}`}>
                    {pageSize}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center text-sm font-medium">
            Page {table.getState().pagination.pageIndex + 1} of{" "}
            {table.getPageCount()}
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              className="h-8 w-8 p-0"
              onClick={() => table.setPageIndex(0)}
              disabled={!table.getCanPreviousPage()}
            >
              {"<<"}
            </Button>
            <Button
              variant="outline"
              className="h-8 w-8 p-0"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              {"<"}
            </Button>
            <Button
              variant="outline"
              className="h-8 w-8 p-0"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              {">"}
            </Button>
            <Button
              variant="outline"
              className="h-8 w-8 p-0"
              onClick={() => table.setPageIndex(table.getPageCount() - 1)}
              disabled={!table.getCanNextPage()}
            >
              {">>"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}