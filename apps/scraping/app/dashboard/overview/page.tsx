import { HydrationBoundary, dehydrate } from "@tanstack/react-query"
import { getQueryClient } from "@/lib/providers/get-query-client"
import { brandOptions } from "./query/brands"
import { snapshotOptions } from "./query/snapshots"

import { columns } from "./columns"
import { DataTable } from "./data-table"

export default async function Overview() {
  const queryClient = getQueryClient()
  void queryClient.prefetchQuery(brandOptions)
  void queryClient.prefetchQuery(snapshotOptions)

  return (
    <div className="text-xl flex flex-col my-5 mx-5">
      <HydrationBoundary state={dehydrate(queryClient)}>
        <DataTable columns={columns} />
      </HydrationBoundary>
    </div>
  )
}
