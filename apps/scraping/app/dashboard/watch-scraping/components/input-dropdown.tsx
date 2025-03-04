"use client"

import { useEffect, useState } from "react"
import { Input } from "@workspace/ui/components/input"
import { Button } from "@workspace/ui/components/button"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@workspace/ui/components/command"
import { ChevronDown, ChevronUp } from "lucide-react"
import { FormControl } from "@workspace/ui/components/form"
import { cn } from "@workspace/ui/lib/utils"

interface InputDropdownProps<T extends { id: string }> {
  isOpen: boolean
  onToggle: (isOpen: boolean) => void
  options: T[]
  isLoading?: boolean
  onSelectOption: (option: T) => void
  onInputChange: (value: string) => void
  placeholder?: string
  value: string
  isDisabled?: boolean
  optionKey?: keyof T
  optionLabel?: keyof T
}

export function InputDropdown<T extends { id: string }>({
  isOpen = false,
  onToggle = () => {},
  options,
  isLoading,
  onSelectOption,
  onInputChange,
  placeholder = "Type or select...",
  value,
  isDisabled,
  optionKey = "id",
  optionLabel = "name" as keyof T,
}: InputDropdownProps<T>) {
  const [open, setOpen] = useState(isOpen)

  useEffect(() => {
    onToggle(open)
  }, [open, onToggle])

  return (
    <div className="relative w-full">
      <div className="flex w-full">
        <FormControl>
          <Input
            type="text"
            value={value}
            onChange={(e) => onInputChange(e.target.value)}
            placeholder={placeholder}
            className="rounded-r-none w-full"
            disabled={isDisabled}
          />
        </FormControl>
        <Button
          type="button"
          variant="outline"
          className={cn("rounded-l-none border-l-0", open && "bg-accent")}
          disabled={isDisabled}
          onClick={() => setOpen(!open)}
        >
          {open ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </Button>
      </div>
      
      {open && (
        <div className="absolute w-full z-50 mt-1 rounded-md border bg-popover shadow-md">
          <Command>
            <CommandInput placeholder="Search..." />
            <CommandList>
              <CommandEmpty>No options found.</CommandEmpty>
              <CommandGroup>
                {isLoading ? (
                  <CommandItem disabled>Loading...</CommandItem>
                ) : (
                  options.map((option) => (
                    <CommandItem
                      key={option[optionKey] as string}
                      onSelect={() => {
                        onSelectOption(option)
                        setOpen(false)
                      }}
                    >
                      {(option[optionLabel] as string) || option.id}
                    </CommandItem>
                  ))
                )}
              </CommandGroup>
            </CommandList>
          </Command>
        </div>
      )}
    </div>
  )
}