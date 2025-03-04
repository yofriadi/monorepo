import { queryOptions } from '@tanstack/react-query'
import { Source } from '../types'

export const createSourcesQueryOptions = (productIds?: string[]) => {
  return queryOptions({
    queryKey: ['sources', { productIds }],
    queryFn: async () => {
      if (!productIds || productIds.length === 0) {
        return []
      }
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/sources?productIds=${productIds.join(',')}`)
      if (!response.ok) {
        throw new Error('Network response was not ok')
      }
      return response.json() as Promise<Source[]>
    },
    enabled: !!productIds && productIds.length > 0
  })
}