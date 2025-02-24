import { HydrationBoundary, dehydrate } from '@tanstack/react-query'

import { getQueryClient } from "@/lib/providers/get-query-client";
import { Form } from "./components/form";
import { brandOptions } from "./queries/brand";

// TODO: remove dynamic when API is established
export const dynamic = 'force-dynamic'

export default async function Page() {
  const queryClient = getQueryClient()
  await queryClient.prefetchQuery(brandOptions)

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <Form />
    </HydrationBoundary>
  )
}
