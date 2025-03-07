import { Suspense } from "react"

import { columns } from "./columns"
import { DataTable } from "./data-table"

// Prevent static prerendering
export const dynamic = 'force-dynamic'

export default function Overview() {
  return (
    <div className="text-xl flex flex-col m-8">
      <Suspense fallback={<div>Loading...</div>}>
        <DataTable columns={columns as any} />
      </Suspense>
    </div>
  )
}
