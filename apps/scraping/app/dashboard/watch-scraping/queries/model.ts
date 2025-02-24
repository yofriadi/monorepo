import { queryOptions } from '@tanstack/react-query'

export const QUERY_KEY_GET_MODELS = 'models'
const MUTATION_KEY_CREATE_MODEL = 'createModel'

export interface Model {
  id: string;
  name: string;
  altName?: string;
  brandId: string;
}

export const modelOptions = (brandId: string) => queryOptions({
  queryKey: [QUERY_KEY_GET_MODELS, brandId],
  queryFn: async () => {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}brand/${brandId}/models`)
    if (!response.ok) {
      throw new Error('Failed to fetch models')
    }
    return response.json() as Promise<Model[]>
  }
})

export interface CreateModelInput {
  name: string;
  altName?: string;
  brandId: string;
}

export const createModel = {
  mutationKey: [MUTATION_KEY_CREATE_MODEL],
  mutationFn: async (input: CreateModelInput) => {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}model`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    })
    if (!response.ok) {
      throw new Error('Failed to create model')
    }
    return response.json() as Promise<Model>
  }
}
