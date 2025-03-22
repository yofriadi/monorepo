"use client"

import * as React from "react"
import { addDays, format, subDays, isSameDay } from "date-fns"
import { CalendarIcon } from "lucide-react"
import { DateRange } from "react-day-picker"

import { cn } from "@workspace/ui/lib/utils"
import { Button } from "@workspace/ui/components/button"
import { Calendar } from "@workspace/ui/components/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@workspace/ui/components/popover"

interface PresetDate {
  label: string
  range: DateRange
}

const presets: PresetDate[] = [
  {
    label: "Yesterday",
    range: {
      from: subDays(new Date(), 1),
      to: subDays(new Date(), 1)
    }
  },
  {
    label: "Last 7 days",
    range: {
      from: subDays(new Date(), 7),
      to: new Date()
    }
  },
  {
    label: "Last 30 days",
    range: {
      from: subDays(new Date(), 30),
      to: new Date()
    }
  },
  {
    label: "Last 90 days",
    range: {
      from: subDays(new Date(), 90),
      to: new Date()
    }
  }
]

interface DatePickerWithRangeProps extends React.HTMLAttributes<HTMLDivElement> {
  onDateChange?: (dateRange: DateRange | undefined) => void
  value?: DateRange
}

export function DatePickerWithRange({
  className,
  onDateChange,
  value,
}: DatePickerWithRangeProps) {
  const [date, setDate] = React.useState<DateRange | undefined>(value)

  React.useEffect(() => {
    setDate(value)
  }, [value])

  const handleDateSelect = (newDateRange: DateRange | undefined) => {
    setDate(newDateRange)
    if (onDateChange) {
      onDateChange(newDateRange)
    }
  }

  const isPresetActive = (preset: PresetDate) => {
    if (!date?.from || !date?.to) return false
    return isSameDay(preset.range.from, date.from) && isSameDay(preset.range.to, date.to)
  }

  return (
    <div className={cn("grid gap-2", className)}>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant={"outline"}
            className={cn(
              "w-[300px] justify-start text-left font-normal",
              !date && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {date?.from ? (
              date.to ? (
                <>
                  {format(date.from, "LLL dd, y")} -{" "}
                  {format(date.to, "LLL dd, y")}
                </>
              ) : (
                format(date.from, "LLL dd, y")
              )
            ) : (
              <span>Pick a date</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <div className="flex flex-col gap-2 p-3 border-b">
            <div className="flex flex-wrap gap-2 justify-center">
              {presets.map((preset) => (
                <Button
                  key={preset.label}
                  variant={isPresetActive(preset) ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleDateSelect(preset.range)}
                  className="text-xs"
                >
                  {preset.label}
                </Button>
              ))}
            </div>
          </div>
          <Calendar
            initialFocus
            mode="range"
            defaultMonth={date?.from}
            selected={date}
            onSelect={handleDateSelect}
            numberOfMonths={2}
          />
        </PopoverContent>
      </Popover>
    </div>
  )
}