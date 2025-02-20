'use server'

import { LookupPrice, LookupPricesByType } from '../types'

export async function getLookupPricesByType(): Promise<LookupPricesByType> {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}lookup-prices/by-type`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
    cache: 'no-store'
  })

  if (!res.ok) {
    throw new Error('Failed to fetch lookup prices')
  }

  return res.json()
}

export async function updateLookupPrice(id: string, payload: { parameter: string; value: number }): Promise<LookupPrice> {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}lookup-price/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload)
  })

  if (!res.ok) {
    throw new Error('Failed to update lookup price')
  }

  return res.json()
}

export async function deleteLookupPrice(id: string): Promise<LookupPrice> {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}lookup-price/${id}`, {
    method: 'DELETE',
  })

  if (!res.ok) {
    throw new Error('Failed to delete lookup price')
  }

  return res.json()
}

export async function createLookupPrice(payload: { parameter: string; value: number; type: string }): Promise<LookupPrice> {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}lookup-price`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload)
  })

  if (!res.ok) {
    throw new Error('Failed to create lookup price')
  }

  return res.json()
}
