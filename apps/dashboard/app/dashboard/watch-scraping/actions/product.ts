'use server'

export interface Product {
  id: string;
  modelId: string;
  referenceNumber: string;
  createdAt: string;
}

export async function getProducts(modelId: string) {
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}model/${modelId}/products`)
  if (!response.ok) {
    throw new Error('Failed to fetch products')
  }
  return response.json() as Promise<Product[]>
}

export interface CreateProductInput {
  modelId: string;
  referenceNumber: string;
}

export async function createProduct(input: CreateProductInput) {
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
