import { queryOptions } from '@tanstack/react-query'
import { Snapshot } from '../types'

export const snapshotOptions = queryOptions({
  queryKey: ['snapshots'],
  queryFn: async () => {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/snapshots`)
    if (!response.ok) {
      throw new Error('Network response was not ok')
    }
    return response.json()
  },
})