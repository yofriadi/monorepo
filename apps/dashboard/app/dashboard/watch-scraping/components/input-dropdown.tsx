"use client"

import { JSX, useRef, useEffect } from "react"
import { Input } from "@workspace/ui/components/input"
import { Button } from "@workspace/ui/components/button"
import { ChevronDown, ChevronUp } from "lucide-react"
import { FormControl } from "@workspace/ui/components/form"

interface InputDropdownProps<T extends { id: string }> {
  isOpen: boolean
  onToggle: (isOpen: boolean) => void
  options: T[]
  filteredOptions: T[]
  isLoading?: boolean
  error: string
  onSelectOption: (option: T) => void
  onInputChange: (value: string) => void
  placeholder?: string
  value: string
  isDisabled: boolean
  optionKey?: keyof T
}

// Function overloads for type-safe usage
interface InputDropdownComponent {
  // Overload 1: When using default 'name' label
  <T extends { id: string; name: string }>(
    props: InputDropdownProps<T> & { optionLabel?: keyof T }
  ): JSX.Element
  
  // Overload 2: When using custom label
  <T extends { id: string }>(
    props: InputDropdownProps<T> & { optionLabel: keyof T }
  ): JSX.Element
}

const InputDropdown: InputDropdownComponent = <T extends { id: string }>({
  isOpen,
  onToggle,
  filteredOptions,
  isLoading,
  error,
  onSelectOption,
  onInputChange,
  placeholder = "Type or select...",
  value,
  isDisabled,
  optionKey = "id",
  optionLabel = "name" as keyof T,
}: InputDropdownProps<T> & { optionLabel?: keyof T }) => {
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        onToggle(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [onToggle])

  return (
    <div className="relative" ref={dropdownRef}>
      <div className="flex">
        <FormControl>
          <Input
            type="text"
            value={value}
            onChange={(e) => onInputChange(e.target.value)}
            placeholder={placeholder}
            className="rounded-r-none"
            disabled={isDisabled}
          />
        </FormControl>
        <Button
          type="button"
          onClick={() => onToggle(!isOpen)}
          variant="outline"
          className="rounded-l-none border-l-0"
          disabled={isDisabled}
        >
          {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </Button>
      </div>

      {isOpen && (
        <ul className="absolute z-10 w-full mt-1 max-h-60 overflow-auto bg-white border border-gray-300 rounded-md shadow-lg">
          {isLoading ? (
            <li className="px-4 py-2 text-muted-foreground">Loading...</li>
          ) : error ? (
            <li className="px-4 py-2 text-destructive">{error}</li>
          ) : filteredOptions.length === 0 ? (
            <li className="px-4 py-2 text-muted-foreground">No options found</li>
          ) : (
            filteredOptions.map((option) => (
              <li
                key={option[optionKey] as string}
                onClick={() => onSelectOption(option)}
                className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
              >
                {(option[optionLabel] as string) || option.id}
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  )
}

export { InputDropdown }

