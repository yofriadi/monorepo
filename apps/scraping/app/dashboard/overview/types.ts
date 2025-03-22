export enum TurnoverCategory {
  FAST = 'fast',
  MODERATE = 'moderate',
  SLOW = 'slow'
}

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
  turnoverCategory: TurnoverCategory | null;
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
  turnoverCategory: TurnoverCategory | null;
}

export interface WatchPriceData {
  productId: string;
  brandName: string;
  modelName: string;
  referenceNumber: string;
  turnoverCategory: TurnoverCategory | null;
  avgPrice: string;
  minPrice: string;
  maxPrice: string;
  currency: string;
  dataPoints: string;
  dataSources: string[];
  hasBox: boolean;
  hasPapers: boolean;
  conditionStatus: string;
  yearOfProduction: string;
  location: string;
  lastScrapedDate: string;
}

export interface DisplayProduct {
  snapshotId?: string;
  sourceId?: string;
  productId?: string;
  brandName: string;
  referenceNumber: string;
  modelName: string;
  platform?: string;
  turnoverCategory: TurnoverCategory | null;
  createdAt?: Date;
  updatedAt?: Date;
  extractedData?: any;
  totalProductScraped?: number;
  avgPrice?: string;
  minPrice?: string;
  maxPrice?: string;
  currency?: string;
  dataPoints?: string;
  dataSources?: string[];
  hasBox?: boolean;
  hasPapers?: boolean;
  conditionStatus?: string;
  yearOfProduction?: string;
  location?: string;
  lastScrapedDate?: string;
  dialColor?: string;
  braceletMaterial?: string;
}
