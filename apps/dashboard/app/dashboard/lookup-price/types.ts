export enum LookupPriceType {
  Brand = 'brand',
  Coefficient = 'coefficient',
  Dial = 'dial',
  Bracelet = 'bracelet',
  SwuType = 'swuType',
  Condition = 'condition',
  ReferenceNumber = 'referenceNumber'
}

export type LookupPrice = {
  id: string
  type: LookupPriceType
  parameter: string
  value: number
  created_at: string
  updated_at: string | null
}

export type LookupPricesByType = Record<LookupPriceType, LookupPrice[]>
