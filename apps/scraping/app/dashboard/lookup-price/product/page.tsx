"use client"

import { useSuspenseQuery } from "@tanstack/react-query"
import { toast } from "@workspace/ui/hooks/use-toast"
import { LookupPriceTable } from "@/components/lookup-price/table"
import { lookupPriceByProduct, useEditProduct } from "./queries/lookup-price-by-product"

export default function Page() {
  const { data } = useSuspenseQuery(lookupPriceByProduct)
  const editProductMutation = useEditProduct()

  const handleEdit = (id: string, formData: { value: number }) => {
    editProductMutation.mutate(
      {
        id,
        data: formData
      },
      {
        onSuccess: () => {
          toast({
            title: "Success",
            description: "Product updated successfully",
          })
        },
        onError: (error) => {
          toast({
            title: "Error",
            description: error.message || "Failed to update product",
            variant: "destructive",
          })
        }
      }
    )
  }

  return <LookupPriceTable title="Reference Number" data={data} onEdit={handleEdit} />
}
