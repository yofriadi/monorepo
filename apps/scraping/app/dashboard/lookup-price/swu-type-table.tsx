"use client"

import type { LookupPrice } from "./types"
import { LookupPriceTable } from "./components/lookup-price-table"
import { deleteLookupPrice, updateLookupPrice, createLookupPrice } from "./actions/lookup-price"
import { useRouter } from "next/navigation"

export function SwuTypeTable({ data }: { data: LookupPrice[] }) {
  const router = useRouter()

  const handleEdit = async (id: string, payload: { parameter: string; value: number }) => {
    try {
      await updateLookupPrice(id, payload)
      router.refresh()
    } catch (error) {
      console.error('Failed to update SWU type price:', error)
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await deleteLookupPrice(id)
      router.refresh()
    } catch (error) {
      console.error('Failed to delete SWU type price:', error)
    }
  }

  const handleCreate = async (payload: { parameter: string; value: number; type: string }) => {
    try {
      await createLookupPrice(payload)
      router.refresh()
    } catch (error) {
      console.error('Failed to create brand price:', error)
    }
  }

  return (
    <LookupPriceTable 
      title="SWU Type" 
      type="swu type"
      data={data} 
      onEdit={handleEdit}
      onDelete={handleDelete}
      onCreate={handleCreate}
    />
  )
}
