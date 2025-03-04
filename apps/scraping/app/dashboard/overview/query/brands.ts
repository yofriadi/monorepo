import { queryOptions } from '@tanstack/react-query'

export const brandOptions = queryOptions({
  queryKey: ['brands'],
  queryFn: async () => {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/brands`)
    if (!response.ok) {
      throw new Error('Network response was not ok')
    }
    return response.json()
  },
})