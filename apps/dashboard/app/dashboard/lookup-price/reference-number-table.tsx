"use client"

import type { LookupPrice } from "./types"
import { LookupPriceTable } from "./components/lookup-price-table"
import { deleteLookupPrice, updateLookupPrice } from "./actions/lookup-price"
import { useRouter } from "next/navigation"

export function ReferenceNumberTable({ data }: { data: LookupPrice[] }) {
  const router = useRouter()

  const handleEdit = async (id: string, payload: { parameter: string; value: number }) => {
    try {
      await updateLookupPrice(id, payload)
      router.refresh()
    } catch (error) {
      console.error('Failed to update reference number price:', error)
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await deleteLookupPrice(id)
      router.refresh()
    } catch (error) {
      console.error('Failed to delete reference number price:', error)
    }
  }

  return (
    <LookupPriceTable 
      title="Reference Number" 
      data={data} 
      onEdit={handleEdit}
      onDelete={handleDelete}
    />
  )
}
