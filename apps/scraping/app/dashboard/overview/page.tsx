"use client"

import { Suspense } from "react"
import { columns } from "./columns"
import { DataTable } from "./data-table"
import { Button } from "@workspace/ui/components/button"
import { PlusCircle } from "lucide-react"
import { useRouter } from "next/navigation"

// Prevent static prerendering
export const dynamic = 'force-dynamic'

export default function Overview() {
  const router = useRouter();

  return (
    <div className="flex flex-col my-5 mx-5">
      <div className="flex justify-end items-center mb-2">
        <Button
          onClick={() => router.push('/dashboard/watch-scraping')}
          className="h-9 px-4"
        >
          <PlusCircle className="mr-2 h-4 w-4" />
          Add New Scraping
        </Button>
      </div>
      <Suspense fallback={<div>Loading...</div>}>
        <DataTable columns={columns as any} />
      </Suspense>
    </div>
  )
}