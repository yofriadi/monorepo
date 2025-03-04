import { queryOptions } from '@tanstack/react-query'
import { Model } from '../types'

export const createModelsQueryOptions = (brandIds?: string[]) => {
  return queryOptions({
    queryKey: ['models', { brandIds }],
    queryFn: async () => {
      if (!brandIds || brandIds.length === 0) {
        return []
      }
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/models?brandIds=${brandIds.join(',')}`)
      if (!response.ok) {
        throw new Error('Network response was not ok')
      }
      return response.json() as Promise<Model[]>
    },
    enabled: !!brandIds && brandIds.length > 0
  })
}