import { Suspense } from "react"

import { columns } from "./columns"
import { DataTable } from "./data-table"

export default function Overview() {
  return (
    <div className="text-xl flex flex-col my-5 mx-5">
      <Suspense fallback={<div>Loading...</div>}>
        <DataTable columns={columns as any} />
      </Suspense>
    </div>
  )
}
