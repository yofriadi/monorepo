'use server'

export interface Model {
  id: string;
  name: string;
  altName?: string;
  brandId: string;
}

export async function getModels(brandId: string) {
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/brand/${brandId}/models`)
  if (!response.ok) {
    throw new Error('Failed to fetch models')
  }
  return response.json() as Promise<Model[]>
}

export interface CreateModelInput {
  name: string;
  altName?: string;
  brandId: string;
}

export async function createModel(input: CreateModelInput) {
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/model`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  })
  if (!response.ok) {
    throw new Error('Failed to create model')
  }
  return response.json() as Promise<Model>
}
