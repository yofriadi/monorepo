'use client'

import { useTheme } from 'next-themes'
import { Button } from "@workspace/ui/components/button"

export default function Page() {
  const { theme, setTheme } = useTheme()
  return (
    <div className="flex items-center justify-center min-h-svh">
      <div className="flex flex-col items-center justify-center gap-4">
        <h1 className="text-2xl font-bold">Hello World</h1>
        <Button
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800"
        >
          {theme === 'dark' ? '🌞' : '🌙'}
        </Button>
      </div>
    </div>
  )
}
