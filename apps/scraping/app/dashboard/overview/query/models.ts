import { queryOptions } from '@tanstack/react-query'
import { Model } from '../types'

export const createModelsQueryOptions = (brandIds?: string[]) => {
  return queryOptions({
    queryKey: ['models', { brandIds }],
    queryFn: async () => {
      if (!brandIds || brandIds.length === 0) {
        return []
      }
      
      try {
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 10000) // 10 second timeout
        
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/models?brandIds=${brandIds.join(',')}`, {
          signal: controller.signal,
          // Make sure we're not using cache during build time
          cache: 'no-store',
          next: { revalidate: 0 }
        })
        
        clearTimeout(timeoutId)
        
        if (!response.ok) {
          throw new Error(`Network response was not ok: ${response.status} ${response.statusText}`)
        }
        
        return response.json() as Promise<Model[]>
      } catch (error) {
        console.error('Error fetching models:', error)
        // Return an empty array instead of throwing to prevent build failures
        return []
      }
    },
    enabled: !!brandIds && brandIds.length > 0
  })
}