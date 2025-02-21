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
  createdAt: string
  updatedAt: string | null
}

export type LookupPricesByType = Record<LookupPriceType, LookupPrice[]>
