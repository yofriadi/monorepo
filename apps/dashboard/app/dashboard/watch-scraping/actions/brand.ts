'use server'

export interface Brand {
  id: string;
  name: string;
  altName?: string;
}

export async function getBrands() {
  const response = await fetch(process.env.NEXT_PUBLIC_API_URL + '/brands')
  if (!response.ok) {
    throw new Error('Failed to fetch brands')
  }
  return response.json() as Promise<Brand[]>
}

export interface CreateBrandInput {
  name: string;
  altName?: string;
}

export async function createBrand(input: CreateBrandInput) {
  const response = await fetch(process.env.NEXT_PUBLIC_API_URL + '/brand', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  })
  if (!response.ok) {
    throw new Error('Failed to create brand')
  }
  return response.json() as Promise<Brand>
}
