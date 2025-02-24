import { queryOptions } from '@tanstack/react-query'

const QUERY_KEY_GET_PRODUCTS = 'products'
const MUTATION_KEY_CREATE_PRODUCT = 'createProduct'

export interface Product {
  id: string;
  modelId: string;
  referenceNumber: string;
  createdAt: string;
}

export const productOptions = (modelId: string) => queryOptions({
  queryKey: [QUERY_KEY_GET_PRODUCTS, modelId],
  queryFn: async () => {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}model/${modelId}/products`)
    if (!response.ok) {
      throw new Error('Failed to fetch products')
    }
    return response.json() as Promise<Product[]>
  }
})

export interface CreateProductInput {
  modelId: string;
  referenceNumber: string;
}

export const createProduct = {
  mutationKey: [MUTATION_KEY_CREATE_PRODUCT],
  mutationFn: async (input: CreateProductInput) => {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}product`, {
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
