import { queryOptions } from '@tanstack/react-query'

const QUERY_KEY_PRODUCT_SNAPSHOTS = 'product-snapshots'

export interface ProductSnapshot {
  brandName: string
  modelName: string
  productReferenceNumber: string
  platform: string
  url: string
  createdAt: Date
  currency: string
  price: number
  images: string | string[]
}

export const productSnapshots = (id: string) => queryOptions({
  queryKey: [QUERY_KEY_PRODUCT_SNAPSHOTS, id],
  queryFn: async () => {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}product/${id}`)
    if (!response.ok) {
      throw new Error('Failed to fetch product snapshots')
    }
    const data = await response.json()
    return data.map((d: ProductSnapshot) => {
      d.images = typeof d.images === 'string' ? d.images.split(',') : d.images
      d.images = d.images
        .map((i: string) => i.trimStart())
        .map((i: string) => i.trimEnd())
      // TODO: fix 10/02/2025 on the client and 2/10/2025 on the server
      d.createdAt = new Date(d.createdAt)
      return d
    }) as ProductSnapshot[]
  },
  select: (data) => {
    return data.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  }
})
