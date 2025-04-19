"use client"

import { useState, useEffect } from "react"
import { InvoiceGenerator } from "./invoice-generator"
import { LanguageProvider } from "./language-provider"
import { LanguageSwitcher } from "./language-switcher"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { FinancialReports } from "./financial-reports"
import { RecurringInvoicesManager } from "./recurring-invoices-manager"

export function InvoiceGeneratorWrapper() {
  const [invoices, setInvoices] = useState([])
  const [currentInvoiceData, setCurrentInvoiceData] = useState({})

  // Load invoices from localStorage
  useEffect(() => {
    const savedInvoices = localStorage.getItem("invoices")
    if (savedInvoices) {
      try {
        setInvoices(JSON.parse(savedInvoices))
      } catch (error) {
        console.error("Error loading invoices:", error)
      }
    }
  }, [])

  const handleInvoiceSave = (invoiceData) => {
    setCurrentInvoiceData(invoiceData)

    // Update invoices list if this is a new or updated invoice
    const updatedInvoices = [...invoices]
    const existingIndex = updatedInvoices.findIndex((inv) => inv.id === invoiceData.id)

    if (existingIndex >= 0) {
      updatedInvoices[existingIndex] = invoiceData
    } else {
      updatedInvoices.push(invoiceData)
    }

    setInvoices(updatedInvoices)
    localStorage.setItem("invoices", JSON.stringify(updatedInvoices))
  }

  const handleInvoiceLoad = (invoiceData) => {
    setCurrentInvoiceData(invoiceData)
  }

  return (
    <LanguageProvider>
      <div className="container mx-auto p-4">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold">Invoice Generator</h1>
          <LanguageSwitcher />
        </div>

        <Tabs defaultValue="invoice">
          <div className="flex justify-between items-center mb-4">
            <TabsList>
              <TabsTrigger value="invoice">Invoice</TabsTrigger>
              <TabsTrigger value="recurring">Recurring</TabsTrigger>
              <TabsTrigger value="reports">Reports</TabsTrigger>
            </TabsList>

            <RecurringInvoicesManager invoiceData={currentInvoiceData} onGenerateInvoice={handleInvoiceLoad} />
          </div>

          <TabsContent value="invoice">
            <InvoiceGenerator
              onInvoiceSave={handleInvoiceSave}
              onInvoiceLoad={handleInvoiceLoad}
              initialData={currentInvoiceData}
            />
          </TabsContent>

          <TabsContent value="recurring">
            <div className="p-8 text-center">
              <p>Use the "Recurring Invoices" button in the top right to manage your recurring invoices.</p>
            </div>
          </TabsContent>

          <TabsContent value="reports">
            <FinancialReports invoices={invoices} />
          </TabsContent>
        </Tabs>
      </div>
    </LanguageProvider>
  )
}
