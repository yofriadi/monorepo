import { queryOptions } from '@tanstack/react-query'
import { Source } from '../types'

export const createSourcesQueryOptions = (productIds?: string[]) => {
  return queryOptions({
    queryKey: ['sources', { productIds }],
    queryFn: async () => {
      if (!productIds || productIds.length === 0) {
        return []
      }
      
      try {
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 10000) // 10 second timeout
        
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/sources?productIds=${productIds.join(',')}`, {
          signal: controller.signal,
          // Make sure we're not using cache during build time
          cache: 'no-store',
          next: { revalidate: 0 }
        })
        
        clearTimeout(timeoutId)
        
        if (!response.ok) {
          throw new Error(`Network response was not ok: ${response.status} ${response.statusText}`)
        }
        
        return response.json() as Promise<Source[]>
      } catch (error) {
        console.error('Error fetching sources:', error)
        // Return an empty array instead of throwing to prevent build failures
        return []
      }
    },
    enabled: !!productIds && productIds.length > 0
  })
}