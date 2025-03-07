import { queryOptions, useMutation } from '@tanstack/react-query'
import { LookupPrice } from '@/types/lookup-price'
import { getQueryClient } from '@/lib/providers/get-query-client'

const LOOKUP_PRICE_TYPE = 'product'
const QUERY_KEY_LOOKUP_PRICE_BY_PRODUCT = 'lookup-price-product'

export const lookupPriceByProduct = queryOptions({
  queryKey: [QUERY_KEY_LOOKUP_PRICE_BY_PRODUCT],
  queryFn: async () => {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/lookup-prices/${LOOKUP_PRICE_TYPE}`)
    if (!res.ok) {
      throw new Error('Failed to fetch product snapshots')
    }
    const data = await res.json()
    return data as LookupPrice[]
  }
})

interface EditProductParams {
  id: string
  data: Partial<LookupPrice>
}

export const useEditProduct = () => {
  const queryClient = getQueryClient()

  return useMutation({
    mutationFn: async ({ id, data }: EditProductParams) => {
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
        throw new Error('Failed to update product')
      }

      return await res.json() as LookupPrice
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY_LOOKUP_PRICE_BY_PRODUCT] })
    },
  })
}
