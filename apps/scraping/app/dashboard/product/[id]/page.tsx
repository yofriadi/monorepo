"use client"

import { useParams } from "next/navigation"
import { useSuspenseQuery } from "@tanstack/react-query"
import { Suspense, useState } from "react"
import { useQueryState } from "nuqs"
import { productSnapshots } from "./query/product-by-id"
import { ScrapedDataTable } from "./components/scraped-data-table"
import { Card, CardContent, CardHeader, CardTitle } from "@workspace/ui/components/card"
import { Skeleton } from "@workspace/ui/components/skeleton"
import { Alert, AlertDescription, AlertTitle } from "@workspace/ui/components/alert"
import { AlertCircle } from "lucide-react"
import { DateRange } from "react-day-picker"

function ProductDetail() {
  const { id } = useParams()
  const [condition] = useQueryState("condition")
  const [year] = useQueryState("year")
  const [dateRange, setDateRange] = useState<DateRange | undefined>()

  const { data: products } = useSuspenseQuery(
    productSnapshots(id as string, condition, year)
  )

  if (!products || products.length === 0) {
    return (
      <div className="container mx-auto py-8">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>No Data Found</AlertTitle>
          <AlertDescription>
            No data is available for this product.
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  const { brandName = '', modelName = '', productReferenceNumber = '' } = products[0] ?? {}

  const scrapedProducts = products.filter(p => p.images?.length > 0 && p.price)

  return (
    <div className="container p-2 md:p-4">
      <div className="space-y-6">
        <div className="rounded-md border p-4">
          <dl className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1">
              <dt className="text-sm text-muted-foreground">Brand</dt>
              <dd className="text-lg font-medium">{brandName}</dd>
            </div>
            <div className="space-y-1">
              <dt className="text-sm text-muted-foreground">Model</dt>
              <dd className="text-lg font-medium">{modelName}</dd>
            </div>
            <div className="space-y-1">
              <dt className="text-sm text-muted-foreground">Reference Number</dt>
              <dd className="text-lg font-medium">{productReferenceNumber}</dd>
            </div>
          </dl>
        </div>

        <ScrapedDataTable
          data={scrapedProducts}
          dateRange={dateRange}
          onDateRangeChange={setDateRange}
        />
      </div>
    </div>
  )
}

function ProductDetailSkeleton() {
  return (
    <Card className="container mx-auto py-8">
      <CardHeader>
        <CardTitle>
          <Skeleton className="h-8 w-1/4" />
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-[400px] w-full" />
        </div>
      </CardContent>
    </Card>
  )
}

export default function Page() {
  return (
    <Suspense fallback={<ProductDetailSkeleton />}>
      <ProductDetail />
    </Suspense>
  )
}
