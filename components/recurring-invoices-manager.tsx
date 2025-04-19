"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"
import { Plus, Search, Calendar, Edit, Trash, Play, Pause } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { type RecurringInvoice, RecurringInvoiceDialog } from "./recurring-invoice-dialog"
import { useTranslation } from "./language-provider"

interface RecurringInvoicesManagerProps {
  invoiceData: any
  onGenerateInvoice: (template: any) => void
}

export function RecurringInvoicesManager({ invoiceData, onGenerateInvoice }: RecurringInvoicesManagerProps) {
  const { t } = useTranslation()
  const { toast } = useToast()
  const [open, setOpen] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [recurringInvoices, setRecurringInvoices] = useState<RecurringInvoice[]>([])
  const [editInvoice, setEditInvoice] = useState<RecurringInvoice | undefined>(undefined)

  // Load recurring invoices from localStorage
  useEffect(() => {
    const savedInvoices = localStorage.getItem("recurringInvoices")
    if (savedInvoices) {
      try {
        setRecurringInvoices(JSON.parse(savedInvoices))
      } catch (error) {
        console.error("Error loading recurring invoices:", error)
      }
    }
  }, [])

  // Save recurring invoices to localStorage
  useEffect(() => {
    localStorage.setItem("recurringInvoices", JSON.stringify(recurringInvoices))
  }, [recurringInvoices])

  // Check for due recurring invoices
  useEffect(() => {
    const today = format(new Date(), "yyyy-MM-dd")
    const dueInvoices = recurringInvoices.filter((invoice) => invoice.active && invoice.nextDate <= today)

    if (dueInvoices.length > 0) {
      toast({
        title: t("recurringInvoices"),
        description: `${dueInvoices.length} ${t("invoices")} ${t("due")}`,
        action: (
          <Button size="sm" onClick={() => setOpen(true)}>
            {t("view")}
          </Button>
        ),
      })
    }
  }, [recurringInvoices, toast, t])

  const handleSaveRecurringInvoice = (invoice: RecurringInvoice) => {
    if (editInvoice) {
      // Update existing invoice
      setRecurringInvoices((prevInvoices) => prevInvoices.map((inv) => (inv.id === invoice.id ? invoice : inv)))
      toast({
        title: t("success"),
        description: t("recurringInvoiceUpdated"),
      })
    } else {
      // Add new invoice
      setRecurringInvoices((prevInvoices) => [...prevInvoices, invoice])
      toast({
        title: t("success"),
        description: t("recurringInvoiceCreated"),
      })
    }
    setEditInvoice(undefined)
  }

  const handleDeleteInvoice = (id: string) => {
    setRecurringInvoices((prevInvoices) => prevInvoices.filter((inv) => inv.id !== id))
    toast({
      title: t("success"),
      description: t("recurringInvoiceDeleted"),
    })
  }

  const handleToggleActive = (id: string) => {
    setRecurringInvoices((prevInvoices) =>
      prevInvoices.map((inv) => (inv.id === id ? { ...inv, active: !inv.active } : inv)),
    )
  }

  const handleGenerateInvoice = (invoice: RecurringInvoice) => {
    // Generate invoice from template
    onGenerateInvoice(invoice.invoiceTemplate)

    // Update next date
    const nextDate = calculateNextDate(new Date(invoice.nextDate), invoice.frequency)
    setRecurringInvoices((prevInvoices) =>
      prevInvoices.map((inv) => (inv.id === invoice.id ? { ...inv, nextDate } : inv)),
    )

    toast({
      title: t("success"),
      description: t("invoiceGenerated"),
    })

    setOpen(false)
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

  const filteredInvoices = recurringInvoices.filter(
    (invoice) =>
      invoice.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      invoice.customerName.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  // Get list of customers from recurring invoices
  const customers = Array.from(new Set(recurringInvoices.map((inv) => inv.customerId))).map((id) => {
    const invoice = recurringInvoices.find((inv) => inv.customerId === id)
    return {
      id,
      name: invoice?.customerName || "",
    }
  })

  return (
    <>
      <Button onClick={() => setOpen(true)} variant="outline">
        <Calendar className="mr-2 h-4 w-4" />
        {t("recurringInvoices")}
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>{t("recurringInvoices")}</DialogTitle>
          </DialogHeader>

          <div className="flex items-center justify-between mb-4">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={t("search")}
                className="pl-8 w-[300px]"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <Button
              onClick={() => {
                setEditInvoice(undefined)
                setDialogOpen(true)
              }}
            >
              <Plus className="mr-2 h-4 w-4" />
              {t("createRecurringInvoice")}
            </Button>
          </div>

          {filteredInvoices.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {searchQuery ? t("noInvoicesFound") : t("noRecurringInvoices")}
            </div>
          ) : (
            <div className="border rounded-md">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t("name")}</TableHead>
                    <TableHead>{t("customer")}</TableHead>
                    <TableHead>{t("frequency")}</TableHead>
                    <TableHead>{t("nextDate")}</TableHead>
                    <TableHead>{t("status")}</TableHead>
                    <TableHead className="text-right">{t("actions")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredInvoices.map((invoice) => (
                    <TableRow key={invoice.id}>
                      <TableCell className="font-medium">{invoice.name}</TableCell>
                      <TableCell>{invoice.customerName}</TableCell>
                      <TableCell>{t(invoice.frequency)}</TableCell>
                      <TableCell>{format(new Date(invoice.nextDate), "PPP")}</TableCell>
                      <TableCell>
                        <Badge variant={invoice.active ? "default" : "outline"}>
                          {invoice.active ? t("active") : t("inactive")}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleToggleActive(invoice.id)}
                            title={invoice.active ? t("deactivate") : t("activate")}
                          >
                            {invoice.active ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              setEditInvoice(invoice)
                              setDialogOpen(true)
                            }}
                            title={t("edit")}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeleteInvoice(invoice.id)}
                            title={t("delete")}
                          >
                            <Trash className="h-4 w-4" />
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => handleGenerateInvoice(invoice)}>
                            {t("generate")}
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <RecurringInvoiceDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSave={handleSaveRecurringInvoice}
        editInvoice={editInvoice}
        customers={customers}
        invoiceData={invoiceData}
      />
    </>
  )
}
