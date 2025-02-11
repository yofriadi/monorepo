import { queryOptions } from '@tanstack/react-query'

export interface Product {
  id: string;
  modelId: string;
  referenceNumber: string;
  createdAt: string;
}

export interface CreateProductInput {
  modelId: string;
  referenceNumber: string;
}

export const productOptions = (modelId: string) => queryOptions({
  queryKey: ['products', modelId],
  queryFn: async () => {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/model/${modelId}/products`)
    if (!response.ok) {
      throw new Error('Failed to fetch products')
    }
    return response.json() as Promise<Product[]>
  }
})

export const createProductMutationConfig = {
  mutationKey: ['createProduct'],
  mutationFn: async (input: CreateProductInput) => {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/product`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    })
    if (!response.ok) {
      throw new Error('Failed to create product')
    }
    return response.json() as Promise<Product>
  }
}
