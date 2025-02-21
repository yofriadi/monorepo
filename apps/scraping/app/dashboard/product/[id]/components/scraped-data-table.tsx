  "use client"

  import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@workspace/ui/components/table"
  import { createColumnHelper, flexRender, getCoreRowModel, getPaginationRowModel, useReactTable } from "@tanstack/react-table"
  import ImageCarousel from "./image-carousel"
  import type { ProductSnapshot } from "../query/product-by-id"
  import { Button } from "@workspace/ui/components/button"
  import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@workspace/ui/components/select"

  const columnHelper = createColumnHelper<ProductSnapshot>()
  const columns = [
    columnHelper.accessor("createdAt", {
      cell: (info) => new Date(info.getValue()).toLocaleDateString(),
      header: "Date Scraped",
    }),
    columnHelper.accessor("platform", {
      cell: (info) => info.getValue() || "-",
      header: "Source",
    }),
    columnHelper.accessor("url", {
      cell: (info) => {
        const url = info.getValue();
        const fullUrl = url.startsWith('http') ? url : `https://${url}`;
        return (
          <a href={fullUrl} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
            Link
          </a>
        );
      },
      header: "URL",
    }),
    columnHelper.accessor("currency", {
      cell: (info) => info.getValue() || "-",
      header: "Currency",
    }),
    columnHelper.accessor("price", {
      cell: (info) => info.getValue()?.toLocaleString() || "-",
      header: "Price",
    }),
    columnHelper.accessor("images", {
      cell: (info) => (
        <div className="flex justify-center items-center">
          <ImageCarousel images={info.getValue() as string[] || []} />
        </div>
      ),
      header: "Images",
    }),
  ]

  interface ScrapedDataTableProps {
    data: ProductSnapshot[]
  }

  export function ScrapedDataTable({ data }: ScrapedDataTableProps) {
    const table = useReactTable({
      data,
      columns,
      getCoreRowModel: getCoreRowModel(),
      getPaginationRowModel: getPaginationRowModel(),
      initialState: {
        pagination: {
          pageSize: 5,
        },
      },
    })

    return (
      <div className="space-y-4">
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <TableHead key={header.id} className="text-center">
                      {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="text-center">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
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
                  {[5, 10, 20].map((pageSize) => (
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
