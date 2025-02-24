"use client"

import { useParams } from "next/navigation"
import { useSuspenseQuery } from "@tanstack/react-query"
import { productSnapshots } from "./query/product-by-id"
import { ScrapedDataTable } from "./components/scraped-data-table"
import { Card, CardContent, CardHeader, CardTitle } from "@workspace/ui/components/card"
import { Skeleton } from "@workspace/ui/components/skeleton"

export default function Page() {
  const { id } = useParams()
  const { data: products, isLoading } = useSuspenseQuery(productSnapshots(id as string))

  if (isLoading) {
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

  if (!products || products.length === 0) {
    return (
      <Card className="container mx-auto py-8">
        <CardHeader>
          <CardTitle>Scraped Products</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-lg text-muted-foreground">No products found</p>
        </CardContent>
      </Card>
    )
  }

  const { brandName = '', modelName = '', productReferenceNumber = '' } = products[0] ?? {}

  return (
    <div className="container p-4 md:p-8">
      <div className="space-y-6">
        <h2 className="text-2xl font-semibold">Scraped Products</h2>

        <div className="rounded-md border p-6">
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

        <div className="overflow-x-auto">
          <ScrapedDataTable data={products} />
        </div>
      </div>
    </div>
  )
}
