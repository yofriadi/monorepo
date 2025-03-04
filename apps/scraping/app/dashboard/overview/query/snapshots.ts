import { queryOptions } from '@tanstack/react-query'

export const snapshotOptions = queryOptions({
  queryKey: ['snapshots'],
  queryFn: async () => {
    // Add proper error handling and timeout for client-side fetching
    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 10000) // 10 second timeout
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/snapshots`, {
        signal: controller.signal,
        // Make sure we're not using cache during build time
        cache: 'no-store',
        next: { revalidate: 0 }
      })
      
      clearTimeout(timeoutId)
      
      if (!response.ok) {
        throw new Error(`Network response was not ok: ${response.status} ${response.statusText}`)
      }
      
      return response.json()
    } catch (error) {
      console.error('Error fetching snapshots:', error)
      // Return an empty array instead of throwing to prevent build failures
      return []
    }
  },
})