import { queryOptions } from '@tanstack/react-query'

const QUERY_KEY_PRODUCT_SNAPSHOTS = 'product-snapshots'

export type ProductSnapshot = {
  brandName: string;
  modelName: string;
  productReferenceNumber: string;
  platform: string;
  url: string;
  createdAt: Date;
  currency: string;
  price: string;
  dial: string | null;
  caseDiameter: string | null;
  caseMaterial: string | null;
  yearOfProduction: string | null;
  scopeOfDelivery: string | null;
  location: string | null;
  condition: string | null;
  images: string | string[];
};

export const productSnapshots = (
  id: string, 
  conditionFilter?: string | null, 
  yearFilter?: string | null
) => queryOptions({
  queryKey: [QUERY_KEY_PRODUCT_SNAPSHOTS, id, conditionFilter, yearFilter],
  queryFn: async () => {
    let url = `${process.env.NEXT_PUBLIC_API_URL}/product/${id}/snapshots`;
    const params = new URLSearchParams();

    if (conditionFilter) params.append('condition', conditionFilter);
    if (yearFilter) params.append('year', yearFilter);

    const queryString = params.toString();
    if (queryString) {
      url = `${url}?${queryString}`;
    }

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error('Failed to fetch product snapshots');
    }

    const data = await response.json();

    if (!data || data.length === 0) {
      return [];
    }

    return data.map((d: ProductSnapshot) => {
      return {
        ...d,
        images: d.images ? (typeof d.images === 'string' ? d.images.split(',') : d.images)
          .map((i: string) => i?.trimStart())
          .map((i: string) => i?.trimEnd()) : [],
        createdAt: d.createdAt ? new Date(d.createdAt) : new Date()
      }
    }) as ProductSnapshot[]
  },
  select: (data) => {
    if (!data || data.length === 0) return [];
    return data.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  }
})
