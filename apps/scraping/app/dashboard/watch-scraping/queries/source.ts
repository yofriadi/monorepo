const MUTATION_KEY_CREATE_SOURCE = 'createSource'

export interface Source {
  id: string;
  platform: string;
}

export interface CreateSourceInput {
  productId: string;
  url: string;
}

export const createSourceMutation = {
  mutationKey: [MUTATION_KEY_CREATE_SOURCE],
  mutationFn: async (input: CreateSourceInput) => {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/source`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    })
    if (!response.ok) {
      throw new Error('Failed to create source')
    }
    return response.json() as Promise<Source>
  }
}
