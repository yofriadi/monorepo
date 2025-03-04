export type Brand = {
  id: string;
  name: string;
  altName?: string | null;
}

export type Model = {
  id: string;
  brandId: string;
  name: string;
  altName?: string | null;
}

export type Product = {
  id: string;
  modelId: string;
  referenceNumber: string;
}

export type Source = {
  id: string;
  productId: string;
  platform: string;
}

export type ExtractedProduct = {
  price: string;
  title: string;
  currency: string;
  location: string;
  subtitle: string;
  badgeText: string;
  shippingFee: string;
  imageCarouselLinks?: string[];
  productDetailLink: string;
}

export type Snapshot = {
  snapshotId: string;
  url: string;
  createdAt: string;
  updatedAt: string;
  extractedData: {
    products?: ExtractedProduct[];
    price?: string;
    currency?: string;
    imageCarouselLinks?: string[];
  };
  sourceId: string;
  platform: string;
  productId: string;
  referenceNumber: string;
  modelId: string;
  modelName: string;
  brandId: string;
  brandName: string;
}

export type DisplayProduct = {
  snapshotId: string;
  sourceId: string;
  productId?: string;
  brandName: string;
  referenceNumber: string;
  modelName: string;
  platform: string;
  turnoverCategory?: string | null;
};
