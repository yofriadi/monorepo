import { queryOptions, useMutation } from '@tanstack/react-query'
import { LookupPrice } from '@/types/lookup-price'
import { getQueryClient } from '@/lib/providers/get-query-client'

const LOOKUP_PRICE_TYPE = 'brand'
const QUERY_KEY_LOOKUP_PRICE_BY_BRAND = 'lookup-price-brand'

export const lookupPriceByBrand = queryOptions({
  queryKey: [QUERY_KEY_LOOKUP_PRICE_BY_BRAND],
  queryFn: async () => {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/lookup-prices/${LOOKUP_PRICE_TYPE}`)
    if (!res.ok) {
      throw new Error('Failed to fetch product snapshots')
    }
    const data = await res.json()
    return data as LookupPrice[]
  }
})

interface EditBrandParams {
  id: string
  data: Partial<LookupPrice>
}

export const useEditBrand = () => {
  const queryClient = getQueryClient()

  return useMutation({
    mutationFn: async ({ id, data }: EditBrandParams) => {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/lookup-price/${id}`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data),
        }
      )

      if (!res.ok) {
        throw new Error('Failed to update brand')
      }

      return await res.json() as LookupPrice
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY_LOOKUP_PRICE_BY_BRAND] })
    },
  })
}
