export interface Snapshot {
  id: string;
  sourceId: string | null;
  parentId: string | null;
  url: string;
  extractedData: unknown;
  createdAt: string;
  updatedAt: string | null;
}

export interface ExtractedListingData {
  productLinks: string[]
  nextPageLink?: string | null | undefined
}

export enum TurnoverCategory {
  FAST = 'fast',
  MODERATE = 'moderate',
  SLOW = 'slow'
}

export enum DataSource {
  CHRONO24 = 'chrono24',
  CAROUSELL = 'carousell'
}

export enum SnapshotTimeRange {
  ONE_MONTH = '1_month',
  THREE_MONTHS = '3_month',
  SIX_MONTHS = '6_month',
  ONE_YEAR = '1_year'
}
