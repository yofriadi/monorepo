"use client"

import type { LookupPrice } from "./types"
import { LookupPriceTable } from "./components/lookup-price-table"
import { deleteLookupPrice, updateLookupPrice } from "./actions/lookup-price"
import { useRouter } from "next/navigation"

export function BrandTable({ data }: { data: LookupPrice[] }) {
  const router = useRouter()

  const handleEdit = async (id: string, payload: { parameter: string; value: number }) => {
    try {
      await updateLookupPrice(id, payload)
      router.refresh()
    } catch (error) {
      console.error('Failed to update brand price:', error)
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await deleteLookupPrice(id)
      router.refresh()
    } catch (error) {
      console.error('Failed to delete brand price:', error)
    }
  }

  return (
    <LookupPriceTable 
      title="Brand" 
      data={data} 
      onEdit={handleEdit}
      onDelete={handleDelete}
    />
  )
}
