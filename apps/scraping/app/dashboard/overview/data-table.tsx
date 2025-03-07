"use client"

import { useState, useEffect } from "react"
import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  type ColumnFiltersState,
} from "@tanstack/react-table"
import { useSuspenseQuery, useSuspenseQueries } from '@tanstack/react-query'
import { brandOptions } from "./query/brands"
import { snapshotOptions } from "./query/snapshots"
import { createModelsQueryOptions } from "./query/models"
import { createProductsQueryOptions } from "./query/products"
import { createSourcesQueryOptions } from "./query/sources"
import { createFilteredSnapshotsQueryOptions } from "./query/filtered-snapshots"
import { useUpdateTurnoverCategory } from "./query/update-turnover" // Impor mutasi
import { Brand, Model, Product, Snapshot, DisplayProduct, Source, TurnoverCategory } from "./types"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@workspace/ui/components/table"
import { Button } from "@workspace/ui/components/button"
import { DataTableFacetedFilter } from "./data-table-faceted-filter"
import { useToast } from "@workspace/ui/hooks/use-toast"
import { Loader2 } from "lucide-react"

interface DataTableProps<TData> {
  columns: (updateTurnoverCategory: (productId: string, newTurnover: TurnoverCategory | null) => void) => ColumnDef<TData, any>[]
}

export function DataTable<TData, TValue>({ columns }: DataTableProps<TData>) {
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [pendingColumnFilters, setPendingColumnFilters] = useState<ColumnFiltersState>([])
  const [displayData, setDisplayData] = useState<DisplayProduct[]>([])
  const [isFiltering, setIsFiltering] = useState(false)
  const [isQueryLoading, setIsQueryLoading] = useState(false)
  const [filteredSourceIds, setFilteredSourceIds] = useState<string[] | undefined>(undefined)
  const { toast } = useToast()

  const { data: brandsData = [] } = useSuspenseQuery(brandOptions)
  const { data: initialSnapshotsData = [] } = useSuspenseQuery(snapshotOptions)

  const { mutate: updateTurnoverCategory } = useUpdateTurnoverCategory();

  const brandFilter = columnFilters.find(filter => filter.id === "brandFilter")
  const brandIds = brandFilter ? (brandFilter.value as string[]) : [];

  const modelFilter = columnFilters.find(filter => filter.id === "modelFilter")
  const modelIds = modelFilter ? (modelFilter.value as string[]) : [];

  const productFilter = columnFilters.find(filter => filter.id === "productFilter")
  const productIds = productFilter ? (productFilter.value as string[]) : [];

  const pendingBrandFilter = pendingColumnFilters.find(filter => filter.id === "brandFilter")
  const pendingBrandIds = pendingBrandFilter ? (pendingBrandFilter.value as string[]) : [];

  const pendingModelFilter = pendingColumnFilters.find(filter => filter.id === "modelFilter")
  const pendingModelIds = pendingModelFilter ? (pendingModelFilter.value as string[]) : [];

  const { data: modelsData = [] } = useSuspenseQuery(createModelsQueryOptions(pendingBrandIds.length > 0 ? pendingBrandIds : undefined))
  const { data: productData = [] } = useSuspenseQuery(createProductsQueryOptions(pendingModelIds.length > 0 ? pendingModelIds : undefined))

  const [{ data: sourcesData = [] }, { data: filteredSnapshotsData = [] }] = useSuspenseQueries({
    queries: [
      createSourcesQueryOptions(isFiltering ? (productIds.length > 0 ? productIds : productData.filter(p =>
        !modelIds.length || modelIds.includes(p.modelId)
      ).map(p => p.id)) : undefined),
      createFilteredSnapshotsQueryOptions(filteredSourceIds)
    ]
  })

  useEffect(() => {
    if (!isFiltering && initialSnapshotsData && initialSnapshotsData.length > 0) {
      const transformedData = processSnapshotsToDisplayProducts(initialSnapshotsData);
      setDisplayData(transformedData);
    }
  }, [initialSnapshotsData, isFiltering])

  useEffect(() => {
    if (isFiltering) {
      setFilteredSourceIds(sourcesData.map((source: Source) => source.id));
      setIsQueryLoading(false);
    }
  }, [sourcesData, isFiltering]);

  useEffect(() => {
    if (isFiltering && filteredSnapshotsData !== undefined) {
      const transformedData = processSnapshotsToDisplayProducts(filteredSnapshotsData);
      setDisplayData(transformedData);
      setIsQueryLoading(false);
    }
  }, [filteredSnapshotsData, isFiltering]);

  const processSnapshotsToDisplayProducts = (snapshots: Snapshot[]): DisplayProduct[] => {
    return snapshots.map(snapshot => ({
      snapshotId: snapshot.snapshotId,
      sourceId: snapshot.sourceId,
      productId: snapshot.productId,
      brandName: snapshot.brandName,
      referenceNumber: snapshot.referenceNumber,
      modelName: snapshot.modelName,
      platform: snapshot.platform,
      turnoverCategory: snapshot.turnoverCategory,
    }));
  };

  const applyFilters = () => {
    if (pendingColumnFilters.length === 0) {
      resetFilters();
      return;
    }

    setColumnFilters(pendingColumnFilters);
    setIsFiltering(true);
    setIsQueryLoading(true);
    setFilteredSourceIds(undefined);

    toast({
      title: "Applying filters",
      description: "Get filtered data",
      duration: 2000,
    });
  }

  const resetFilters = () => {
    setColumnFilters([]);
    setPendingColumnFilters([]);
    setIsFiltering(false);
    setIsQueryLoading(false);
    setFilteredSourceIds(undefined);

    toast({
      title: "Filters reset",
      description: "Showing all data",
      duration: 2000,
    });
  }

  const brandFilterOptions = brandsData.map((brand: Brand) => ({
    label: brand.name,
    value: brand.id,
    icon: undefined
  }))

  const modelFilterOptions = modelsData.map((model: Model) => ({
    label: model.name,
    value: model.id,
    icon: undefined
  }))

  const productFilterOptions = productData.map((product: Product) => ({
    label: product.referenceNumber,
    value: product.id,
    icon: undefined
  }))

  const table = useReactTable({
    data: displayData as TData[],
    columns: columns((productId, newTurnover) => updateTurnoverCategory({ productId, newTurnover })),
    getCoreRowModel: getCoreRowModel(),
  })

  return (
    <>
      <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0 py-4">
        <div className="flex flex-wrap gap-2">
          <DataTableFacetedFilter
            title="Brand"
            options={brandFilterOptions}
            pendingColumnFilters={pendingColumnFilters}
            setPendingColumnFilters={setPendingColumnFilters}
            filterId="brandFilter"
          />
          <DataTableFacetedFilter
            title="Model"
            options={modelFilterOptions}
            pendingColumnFilters={pendingColumnFilters}
            setPendingColumnFilters={setPendingColumnFilters}
            filterId="modelFilter"
          />
          <DataTableFacetedFilter
            title="Product"
            options={productFilterOptions}
            pendingColumnFilters={pendingColumnFilters}
            setPendingColumnFilters={setPendingColumnFilters}
            filterId="productFilter"
          />
        </div>
        <div className="flex space-x-2">
          <Button
            variant="outline"
            onClick={resetFilters}
            className="h-8 px-2 lg:px-3"
            disabled={isQueryLoading}
          >
            Reset Filters
          </Button>
          <Button
            onClick={applyFilters}
            className="h-8 px-2 lg:px-3"
            disabled={isQueryLoading}
          >
            {isQueryLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Loading...
              </>
            ) : (
              'Apply Filters'
            )}
          </Button>
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id} data-state={row.getIsSelected() && "selected"}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  {isQueryLoading ? (
                    <div className="flex justify-center items-center">
                      <Loader2 className="mr-2 h-6 w-6 animate-spin" />
                      Loading data...
                    </div>
                  ) : (
                    "No results found."
                  )}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </>
  )
}