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
import { Brand, Model, Product, Snapshot, DisplayProduct, Source } from "./types"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@workspace/ui/components/table"
import { Button } from "@workspace/ui/components/button"
import { DataTableFacetedFilter } from "./data-table-faceted-filter"
import { useToast } from "@workspace/ui/hooks/use-toast"
import { Loader2 } from "lucide-react"
import { columns as getColumns } from "./columns"

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
}

export function DataTable<TData, TValue>({ columns }: DataTableProps<TData, TValue>) {
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [pendingColumnFilters, setPendingColumnFilters] = useState<ColumnFiltersState>([])
  const [displayData, setDisplayData] = useState<DisplayProduct[]>([])
  const [isFiltering, setIsFiltering] = useState(false)
  const [isQueryLoading, setIsQueryLoading] = useState(false)
  const [filteredSourceIds, setFilteredSourceIds] = useState<string[] | undefined>(undefined)
  const { toast } = useToast()

  // Modify queries to handle errors and loading states better with dynamic data loading
  const { data: brandsData = [], isLoading: isBrandsLoading, error: brandsError } = useSuspenseQuery(brandOptions)
  const { data: initialSnapshotsData = [], isLoading: isSnapshotsLoading, error: snapshotsError } = useSuspenseQuery(snapshotOptions)

  const brandFilter = columnFilters.find(filter => filter.id === "brandFilter")
  const brandIds = brandFilter ? brandFilter.value : []
  
  const modelFilter = columnFilters.find(filter => filter.id === "modelFilter")
  const modelIds = modelFilter ? modelFilter.value : []
  
  const productFilter = columnFilters.find(filter => filter.id === "productFilter")
  const productIds = productFilter ? productFilter.value : []

  const pendingBrandFilter = pendingColumnFilters.find(filter => filter.id === "brandFilter")
  const pendingBrandIds = pendingBrandFilter ? pendingBrandFilter.value : []
  
  const pendingModelFilter = pendingColumnFilters.find(filter => filter.id === "modelFilter")
  const pendingModelIds = pendingModelFilter ? pendingModelFilter.value : []

  const { data: modelsData = [] } = useSuspenseQuery(createModelsQueryOptions(pendingBrandIds && Array.isArray(pendingBrandIds) && pendingBrandIds.length > 0 ? pendingBrandIds as string[] : undefined))
  const { data: productData = [] } = useSuspenseQuery(createProductsQueryOptions(pendingModelIds && Array.isArray(pendingModelIds) && pendingModelIds.length > 0 ? pendingModelIds as string[] : undefined))
  
  const [{ data: sourcesData = [] }, { data: filteredSnapshotsData = [] }] = useSuspenseQueries({
    queries: [
      createSourcesQueryOptions(isFiltering ? (Array.isArray(productIds) && productIds.length > 0 ? productIds as string[] : productData.filter(p =>
        !Array.isArray(modelIds) || modelIds.length === 0 || (modelIds as string[]).includes(p.modelId)
      ).map(p => p.id)) : undefined),
      createFilteredSnapshotsQueryOptions(filteredSourceIds)
    ]
  })

  useEffect(() => {
    if (!isFiltering) {
      if (initialSnapshotsData && initialSnapshotsData.length > 0) {
        const transformedData = processSnapshotsToDisplayProducts(initialSnapshotsData);
        setDisplayData(transformedData);
      } else if (snapshotsError) {
        console.error('Error loading snapshots:', snapshotsError);
        toast({
          title: "Error loading data",
          description: "There was a problem loading the initial data. Please try again.",
          duration: 5000,
        });
      }
    }
  }, [initialSnapshotsData, isFiltering, snapshotsError, toast])

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
    const displayProducts: DisplayProduct[] = [];
    
    snapshots.forEach(snapshot => {
      if (snapshot.extractedData?.products && Array.isArray(snapshot.extractedData.products)) {
        snapshot.extractedData.products.forEach(product => {
          displayProducts.push({
            ...product,
            snapshotId: snapshot.snapshotId,
            sourceId: snapshot.sourceId,
            productId: snapshot.productId,
            brandName: snapshot.brandName,
            modelName: snapshot.modelName,
            referenceNumber: snapshot.referenceNumber,
            platform: snapshot.platform,
            turnoverCategory: null,
          });
        });
      } else if (snapshot.extractedData) {
        const extractedData = snapshot.extractedData;
        if (extractedData.price && extractedData.currency) {
          displayProducts.push({
            price: extractedData.price,
            currency: extractedData.currency,
            title: snapshot.referenceNumber,
            subtitle: "",
            location: "",
            badgeText: "",
            shippingFee: "",
            productDetailLink: snapshot.url,
            imageCarouselLinks: extractedData.imageCarouselLinks || [],
            snapshotId: snapshot.snapshotId,
            sourceId: snapshot.sourceId,
            productId: snapshot.productId,
            brandName: snapshot.brandName,
            modelName: snapshot.modelName,
            referenceNumber: snapshot.referenceNumber,
            platform: snapshot.platform,
            turnoverCategory: null,
          });
        }
      }
    });
    
    return displayProducts;
  };

  // Fungsi untuk memperbarui turnover category secara lokal
  const updateTurnoverCategory = (productId: string, newTurnover: string | null) => {
    setDisplayData(prevData =>
      prevData.map(item =>
        item.productId === productId ? { ...item, turnoverCategory: newTurnover } : item
      )
    );
    toast({
      title: "Turnover Category Updated",
      description: `Turnover category for product ${productId} set to ${newTurnover || "Not Set"}`,
      duration: 2000,
    });
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
    columns: getColumns(updateTurnoverCategory) as ColumnDef<TData, TValue>[],
    getCoreRowModel: getCoreRowModel(),
  })

  // Show a full-page loading state while initial data is loading
  if ((isSnapshotsLoading || isBrandsLoading) && !isFiltering && displayData.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Loader2 className="h-12 w-12 animate-spin mb-4" />
        <p className="text-lg font-medium">Loading dashboard data...</p>
      </div>
    );
  }

  // Show error state if there's a critical error with initial data loading
  if ((brandsError || snapshotsError) && !isFiltering && displayData.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="mb-4 text-red-500">
          <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="12"></line>
            <line x1="12" y1="16" x2="12.01" y2="16"></line>
          </svg>
        </div>
        <h3 className="text-xl font-bold mb-2">Error Loading Dashboard Data</h3>
        <p className="text-gray-600 mb-4 max-w-md mx-auto">There was a problem loading the data. This could be due to a network issue or the API being unavailable.</p>
        <Button onClick={() => window.location.reload()}>Refresh Page</Button>
      </div>
    );
  }

  // Normal render state with data or filtered results
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