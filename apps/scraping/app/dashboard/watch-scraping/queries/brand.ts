import { queryOptions } from '@tanstack/react-query'

export const QUERY_KEY_GET_BRANDS = 'brands'
const MUTATION_KEY_CREATE_BRAND = 'createBrand'

export interface Brand {
  id: string;
  name: string;
  altName?: string;
  createdAt: Date;
  updatedAt?: Date;
}

export const brandOptions = queryOptions({
  queryKey: [QUERY_KEY_GET_BRANDS],
  queryFn: async () => {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}brands`)
    if (!response.ok) {
      throw new Error('Failed to fetch brands')
    }
    return response.json() as Promise<Brand[]>
  }
})

export interface CreateBrandInput {
  name: string;
  altName?: string;
}

export const createBrand = {
  mutationKey: [MUTATION_KEY_CREATE_BRAND],
  mutationFn: async (input: CreateBrandInput) => {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}brand`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    })
    if (!response.ok) {
      throw new Error('Failed to create brand')
    }
    return response.json() as Promise<Brand>
  }
}
