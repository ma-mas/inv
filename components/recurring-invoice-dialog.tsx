"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format } from "date-fns"
import { CalendarIcon, Plus, Trash } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { useTranslation } from "./language-provider"

// Define recurring invoice type
export interface RecurringInvoice {
  id: string
  name: string
  customerId: string
  customerName: string
  frequency: "weekly" | "biweekly" | "monthly" | "quarterly" | "yearly"
  startDate: string
  endDate?: string
  nextDate: string
  invoiceTemplate: any
  active: boolean
  createdAt: string
}

interface RecurringInvoiceDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave: (invoice: RecurringInvoice) => void
  editInvoice?: RecurringInvoice
  customers: Array<{ id: string; name: string }>
  invoiceData: any
}

export function RecurringInvoiceDialog({
  open,
  onOpenChange,
  onSave,
  editInvoice,
  customers,
  invoiceData,
}: RecurringInvoiceDialogProps) {
  const { t } = useTranslation()
  const { toast } = useToast()

  const [recurringInvoice, setRecurringInvoice] = useState<Partial<RecurringInvoice>>({
    name: "",
    customerId: "",
    frequency: "monthly",
    startDate: format(new Date(), "yyyy-MM-dd"),
    nextDate: format(new Date(), "yyyy-MM-dd"),
    active: true,
  })

  const [startDateOpen, setStartDateOpen] = useState(false)
  const [endDateOpen, setEndDateOpen] = useState(false)

  useEffect(() => {
    if (editInvoice) {
      setRecurringInvoice(editInvoice)
    } else if (invoiceData) {
      // Pre-fill with current invoice data
      setRecurringInvoice({
        ...recurringInvoice,
        customerId: invoiceData.customer?.id || "",
        customerName: invoiceData.customer?.name || "",
        invoiceTemplate: invoiceData,
      })
    }
  }, [editInvoice, invoiceData])

  const handleSave = () => {
    if (!recurringInvoice.name) {
      toast({
        title: t("error"),
        description: t("pleaseEnterInvoiceName"),
        variant: "destructive",
      })
      return
    }

    if (!recurringInvoice.customerId) {
      toast({
        title: t("error"),
        description: t("pleaseSelectCustomer"),
        variant: "destructive",
      })
      return
    }

    const newRecurringInvoice: RecurringInvoice = {
      id: editInvoice?.id || `recurring-${Date.now()}`,
      name: recurringInvoice.name || "",
      customerId: recurringInvoice.customerId || "",
      customerName: customers.find((c) => c.id === recurringInvoice.customerId)?.name || "",
      frequency: recurringInvoice.frequency as "monthly",
      startDate: recurringInvoice.startDate || format(new Date(), "yyyy-MM-dd"),
      endDate: recurringInvoice.endDate,
      nextDate: recurringInvoice.nextDate || format(new Date(), "yyyy-MM-dd"),
      invoiceTemplate: invoiceData,
      active: recurringInvoice.active || true,
      createdAt: editInvoice?.createdAt || format(new Date(), "yyyy-MM-dd"),
    }

    onSave(newRecurringInvoice)
    onOpenChange(false)
  }

  const calculateNextDate = (date: Date, frequency: string) => {
    const nextDate = new Date(date)

    switch (frequency) {
      case "weekly":
        nextDate.setDate(nextDate.getDate() + 7)
        break
      case "biweekly":
        nextDate.setDate(nextDate.getDate() + 14)
        break
      case "monthly":
        nextDate.setMonth(nextDate.getMonth() + 1)
        break
      case "quarterly":
        nextDate.setMonth(nextDate.getMonth() + 3)
        break
      case "yearly":
        nextDate.setFullYear(nextDate.getFullYear() + 1)
        break
      default:
        nextDate.setMonth(nextDate.getMonth() + 1)
    }

    return format(nextDate, "yyyy-MM-dd")
  }

  const handleFrequencyChange = (value: string) => {
    const startDate = recurringInvoice.startDate ? new Date(recurringInvoice.startDate) : new Date()
    const nextDate = calculateNextDate(startDate, value)

    setRecurringInvoice({
      ...recurringInvoice,
      frequency: value as "monthly",
      nextDate,
    })
  }

  const handleStartDateChange = (date: Date | undefined) => {
    if (!date) return

    const formattedDate = format(date, "yyyy-MM-dd")
    const nextDate = calculateNextDate(date, recurringInvoice.frequency || "monthly")

    setRecurringInvoice({
      ...recurringInvoice,
      startDate: formattedDate,
      nextDate,
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{editInvoice ? t("editRecurringInvoice") : t("createRecurringInvoice")}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              {t("name")}
            </Label>
            <Input
              id="name"
              value={recurringInvoice.name}
              onChange={(e) => setRecurringInvoice({ ...recurringInvoice, name: e.target.value })}
              className="col-span-3"
            />
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="customer" className="text-right">
              {t("customer")}
            </Label>
            <Select
              value={recurringInvoice.customerId}
              onValueChange={(value) => setRecurringInvoice({ ...recurringInvoice, customerId: value })}
            >
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder={t("selectCustomer")} />
              </SelectTrigger>
              <SelectContent>
                {customers.map((customer) => (
                  <SelectItem key={customer.id} value={customer.id}>
                    {customer.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="frequency" className="text-right">
              {t("frequency")}
            </Label>
            <Select value={recurringInvoice.frequency} onValueChange={handleFrequencyChange}>
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder={t("selectFrequency")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="weekly">{t("weekly")}</SelectItem>
                <SelectItem value="biweekly">{t("biweekly")}</SelectItem>
                <SelectItem value="monthly">{t("monthly")}</SelectItem>
                <SelectItem value="quarterly">{t("quarterly")}</SelectItem>
                <SelectItem value="yearly">{t("yearly")}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="startDate" className="text-right">
              {t("startDate")}
            </Label>
            <Popover open={startDateOpen} onOpenChange={setStartDateOpen}>
              <PopoverTrigger asChild>
                <Button variant="outline" className="col-span-3 justify-start text-left font-normal">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {recurringInvoice.startDate ? format(new Date(recurringInvoice.startDate), "PPP") : t("pickDate")}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={recurringInvoice.startDate ? new Date(recurringInvoice.startDate) : undefined}
                  onSelect={(date) => {
                    handleStartDateChange(date)
                    setStartDateOpen(false)
                  }}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="endDate" className="text-right">
              {t("endDate")}
            </Label>
            <div className="col-span-3 flex items-center gap-2">
              <Popover open={endDateOpen} onOpenChange={setEndDateOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="flex-1 justify-start text-left font-normal"
                    disabled={!recurringInvoice.endDate}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {recurringInvoice.endDate ? format(new Date(recurringInvoice.endDate), "PPP") : t("noEndDate")}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={recurringInvoice.endDate ? new Date(recurringInvoice.endDate) : undefined}
                    onSelect={(date) => {
                      setRecurringInvoice({
                        ...recurringInvoice,
                        endDate: date ? format(date, "yyyy-MM-dd") : undefined,
                      })
                      setEndDateOpen(false)
                    }}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              {recurringInvoice.endDate ? (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setRecurringInvoice({ ...recurringInvoice, endDate: undefined })}
                >
                  <Trash className="h-4 w-4" />
                </Button>
              ) : (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() =>
                    setRecurringInvoice({
                      ...recurringInvoice,
                      endDate: format(new Date(new Date().setFullYear(new Date().getFullYear() + 1)), "yyyy-MM-dd"),
                    })
                  }
                >
                  <Plus className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="nextDate" className="text-right">
              {t("nextDate")}
            </Label>
            <Input
              id="nextDate"
              value={recurringInvoice.nextDate ? format(new Date(recurringInvoice.nextDate), "PPP") : ""}
              readOnly
              className="col-span-3"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {t("cancel")}
          </Button>
          <Button onClick={handleSave}>{t("save")}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
