"use client"

import { useSuspenseQuery } from "@tanstack/react-query"
import { toast } from "@workspace/ui/hooks/use-toast"
import { LookupPriceTable } from "@/components/lookup-price/table"
import { lookupPriceByBrand, useEditBrand } from "./queries/lookup-price-by-brand"

export default function Page() {
  const { data } = useSuspenseQuery(lookupPriceByBrand)
  console.log(data)
  const editBrandMutation = useEditBrand()

  const handleEdit = (id: string, formData: { value: number }) => {
    editBrandMutation.mutate(
      {
        id,
        data: formData
      },
      {
        onSuccess: () => {
          toast({
            title: "Success",
            description: "Brand updated successfully",
          })
        },
        onError: (error) => {
          toast({
            title: "Error",
            description: error.message || "Failed to update brand",
            variant: "destructive",
          })
        }
      }
    )
  }

  return <LookupPriceTable title="Brand" data={data} onEdit={handleEdit} />
}
