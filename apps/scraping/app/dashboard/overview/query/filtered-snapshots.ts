import { queryOptions } from '@tanstack/react-query'
import { Snapshot } from '../types'

export const createFilteredSnapshotsQueryOptions = (sourceIds?: string[]) => {
  return queryOptions({
    queryKey: ['filteredSnapshots', { sourceIds }],
    queryFn: async () => {
      if (!sourceIds || sourceIds.length === 0) {
        return []
      }
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/snapshots?sourceIds=${sourceIds.join(',')}`)
      if (!response.ok) {
        throw new Error('Network response was not ok')
      }
      return response.json() as Promise<Snapshot[]>
    },
    enabled: !!sourceIds && sourceIds.length > 0
  })
}