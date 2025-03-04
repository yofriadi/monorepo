import { queryOptions } from '@tanstack/react-query'
import { Snapshot } from '../types'

export const createFilteredSnapshotsQueryOptions = (sourceIds?: string[]) => {
  return queryOptions({
    queryKey: ['filteredSnapshots', { sourceIds }],
    queryFn: async () => {
      if (!sourceIds || sourceIds.length === 0) {
        return []
      }
      
      try {
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 10000) // 10 second timeout
        
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/snapshots?sourceIds=${sourceIds.join(',')}`, {
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
    enabled: !!sourceIds && sourceIds.length > 0
  })
}