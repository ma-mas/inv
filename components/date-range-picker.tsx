"use client"

import * as React from "react"
import { format } from "date-fns"
import { CalendarIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { useTranslation } from "./language-provider"

interface DateRangePickerProps {
  from: Date
  to: Date
  onFromChange: (date: Date) => void
  onToChange: (date: Date) => void
}

export function DateRangePicker({ from, to, onFromChange, onToChange }: DateRangePickerProps) {
  const { t } = useTranslation()
  const [fromOpen, setFromOpen] = React.useState(false)
  const [toOpen, setToOpen] = React.useState(false)

  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className="grid gap-2">
        <Popover open={fromOpen} onOpenChange={setFromOpen}>
          <PopoverTrigger asChild>
            <Button
              id="from"
              variant={"outline"}
              className={cn("w-[240px] justify-start text-left font-normal", !from && "text-muted-foreground")}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {from ? format(from, "PPP") : <span>{t("pickStartDate")}</span>}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={from}
              onSelect={(date) => {
                if (date) {
                  onFromChange(date)
                  setFromOpen(false)
                }
              }}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </div>
      <div className="grid gap-2">
        <Popover open={toOpen} onOpenChange={setToOpen}>
          <PopoverTrigger asChild>
            <Button
              id="to"
              variant={"outline"}
              className={cn("w-[240px] justify-start text-left font-normal", !to && "text-muted-foreground")}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {to ? format(to, "PPP") : <span>{t("pickEndDate")}</span>}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={to}
              onSelect={(date) => {
                if (date) {
                  onToChange(date)
                  setToOpen(false)
                }
              }}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </div>
    </div>
  )
}
