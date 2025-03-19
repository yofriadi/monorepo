import { queryOptions } from '@tanstack/react-query'
import { Snapshot } from '../types'

export const createFilteredSnapshotsQueryOptions = (
  sourceIds?: string[],
  brandIds?: string[],
  modelIds?: string[],
  productIds?: string[]
) => {
  return queryOptions({
    queryKey: ['filteredSnapshots', { sourceIds, brandIds, modelIds, productIds }],
    queryFn: async () => {
      // If no filters are provided, return empty array
      if ((!sourceIds || sourceIds.length === 0) && 
          (!brandIds || brandIds.length === 0) && 
          (!modelIds || modelIds.length === 0) && 
          (!productIds || productIds.length === 0)) {
        return []
      }
      
      try {
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 10000) // 10 second timeout
        
        // Build query parameters
        const params = new URLSearchParams()
        
        if (sourceIds && sourceIds.length > 0) {
          params.append('sourceIds', sourceIds.join(','))
        }
        
        if (brandIds && brandIds.length > 0) {
          params.append('brand', brandIds.join(','))
        }
        
        if (modelIds && modelIds.length > 0) {
          params.append('model', modelIds.join(','))
        }
        
        if (productIds && productIds.length > 0) {
          params.append('reference', productIds.join(','))
        }
        
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/snapshots?${params.toString()}`, {
          signal: controller.signal,
          // Make sure we're not using cache during build time
          cache: 'no-store',
          next: { revalidate: 0 }
        })
        
        clearTimeout(timeoutId)
        
        if (!response.ok) {
          throw new Error(`Network response was not ok: ${response.status} ${response.statusText}`)
        }
        
        return response.json() as Promise<Snapshot[]>
      } catch (error) {
        console.error('Error fetching filtered snapshots:', error)
        // Return an empty array instead of throwing to prevent build failures
        return []
      }
    },
    enabled: (!!sourceIds && sourceIds.length > 0) || 
             (!!brandIds && brandIds.length > 0) || 
             (!!modelIds && modelIds.length > 0) || 
             (!!productIds && productIds.length > 0)
  })
}