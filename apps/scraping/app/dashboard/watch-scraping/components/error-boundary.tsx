'use client'

import { Button } from "@workspace/ui/components/button"

// TODO: remove when API is established, and force dynamic in page.tsx
export function ErrorBoundary({ 
  error, 
  reset 
}: { 
  error: Error & { digest?: string }
  reset: () => void 
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 p-4">
      <h2 className="text-lg font-semibold">Something went wrong!</h2>
      <Button onClick={reset}>Try again</Button>
    </div>
  )
}