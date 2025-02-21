import { LookupPriceType } from "./types"
import { getLookupPricesByType } from "./actions/lookup-price"
import { BrandTable } from "./brand-table"
import { CoefficientTable } from "./coefficient-table"
import { DialTable } from "./dial-table"
import { BraceletTable } from "./bracelet-table"
import { SwuTypeTable } from "./swu-type-table"
import { ConditionTable } from "./condition-table"
import { ReferenceNumberTable } from "./reference-number-table"

export default async function Page() {
  const lookupPrices = await getLookupPricesByType()

  return (
    <div className="p-4 md:p-8">
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-8">
        <div className="flex flex-col space-y-4 md:space-y-8">
          <BrandTable data={lookupPrices[LookupPriceType.Brand] ?? []} />
          <CoefficientTable data={lookupPrices[LookupPriceType.Coefficient] ?? []} />
          <DialTable data={lookupPrices[LookupPriceType.Dial] ?? []} />
        </div>
        <div className="flex flex-col space-y-4 md:space-y-8">
          <BraceletTable data={lookupPrices[LookupPriceType.Bracelet] ?? []} />
          <SwuTypeTable data={lookupPrices[LookupPriceType.SwuType] ?? []} />
          <ConditionTable data={lookupPrices[LookupPriceType.Condition] ?? []} />
        </div>
        <div className="flex flex-col space-y-4 md:space-y-8">
          <ReferenceNumberTable data={lookupPrices[LookupPriceType.ReferenceNumber] ?? []} />
        </div>
      </div>
    </div>
  )
}
