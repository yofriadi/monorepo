import { queryOptions } from '@tanstack/react-query'
import { Product } from '../types'

export const createProductsQueryOptions = (modelIds?: string[]) => {
  return queryOptions({
    queryKey: ['products', { modelIds }],
    queryFn: async () => {
      if (!modelIds || modelIds.length === 0) {
        return []
      }
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/products?modelIds=${modelIds.join(',')}`)
      if (!response.ok) {
        throw new Error('Network response was not ok')
      }
      return response.json() as Promise<Product[]>
    },
    enabled: !!modelIds && modelIds.length > 0
  })
}