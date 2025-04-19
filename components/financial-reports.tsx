"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DateRangePicker } from "./date-range-picker"
import { useTranslation } from "./language-provider"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts"

interface Invoice {
  id: string
  invoiceNumber: string
  date: string
  dueDate: string
  customer: {
    name: string
  }
  items: Array<{
    name: string
    quantity: number
    price: number
    total: number
  }>
  subtotal: number
  discount: number
  tax: number
  total: number
  status: "paid" | "unpaid" | "overdue" | "draft"
  currency: string
}

interface FinancialReportsProps {
  invoices: Invoice[]
}

export function FinancialReports({ invoices }: FinancialReportsProps) {
  const { t } = useTranslation()
  const [dateRange, setDateRange] = useState<{ from: Date; to: Date }>({
    from: new Date(new Date().getFullYear(), 0, 1), // January 1st of current year
    to: new Date(),
  })
  const [timeFrame, setTimeFrame] = useState<"daily" | "weekly" | "monthly" | "quarterly" | "yearly">("monthly")
  const [filteredInvoices, setFilteredInvoices] = useState<Invoice[]>([])
  const [currency, setCurrency] = useState<string>("IDR")

  // Filter invoices based on date range and currency
  useEffect(() => {
    const filtered = invoices.filter((invoice) => {
      const invoiceDate = new Date(invoice.date)
      return invoiceDate >= dateRange.from && invoiceDate <= dateRange.to && invoice.currency === currency
    })
    setFilteredInvoices(filtered)
  }, [invoices, dateRange, currency])

  // Calculate summary metrics
  const totalRevenue = filteredInvoices.reduce((sum, invoice) => sum + invoice.total, 0)
  const paidInvoices = filteredInvoices.filter((invoice) => invoice.status === "paid")
  const paidAmount = paidInvoices.reduce((sum, invoice) => sum + invoice.total, 0)
  const unpaidInvoices = filteredInvoices.filter(
    (invoice) => invoice.status === "unpaid" || invoice.status === "overdue",
  )
  const unpaidAmount = unpaidInvoices.reduce((sum, invoice) => sum + invoice.total, 0)
  const overdueInvoices = filteredInvoices.filter((invoice) => invoice.status === "overdue")
  const overdueAmount = overdueInvoices.reduce((sum, invoice) => sum + invoice.total, 0)

  // Prepare data for charts
  const prepareTimeSeriesData = () => {
    const data: any[] = []
    const startDate = new Date(dateRange.from)
    const endDate = new Date(dateRange.to)

    if (timeFrame === "daily") {
      for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
        const day = new Date(d).toISOString().split("T")[0]
        const dayInvoices = filteredInvoices.filter((inv) => inv.date.startsWith(day))
        const total = dayInvoices.reduce((sum, inv) => sum + inv.total, 0)
        data.push({
          date: day,
          total: total,
        })
      }
    } else if (timeFrame === "weekly") {
      // Group by week
      const weeks: Record<string, number> = {}
      filteredInvoices.forEach((invoice) => {
        const date = new Date(invoice.date)
        const weekStart = new Date(date)
        weekStart.setDate(date.getDate() - date.getDay())
        const weekKey = weekStart.toISOString().split("T")[0]
        weeks[weekKey] = (weeks[weekKey] || 0) + invoice.total
      })

      Object.entries(weeks).forEach(([week, total]) => {
        data.push({
          date: week,
          total: total,
        })
      })

      // Sort by date
      data.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    } else if (timeFrame === "monthly") {
      // Group by month
      const months: Record<string, number> = {}
      filteredInvoices.forEach((invoice) => {
        const date = new Date(invoice.date)
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`
        months[monthKey] = (months[monthKey] || 0) + invoice.total
      })

      Object.entries(months).forEach(([month, total]) => {
        const [year, monthNum] = month.split("-")
        const monthName = new Date(Number.parseInt(year), Number.parseInt(monthNum) - 1, 1).toLocaleString("default", {
          month: "short",
        })
        data.push({
          date: `${monthName} ${year}`,
          total: total,
        })
      })

      // Sort by date
      data.sort((a, b) => {
        const [aMonth, aYear] = a.date.split(" ")
        const [bMonth, bYear] = b.date.split(" ")
        const aDate = new Date(`${aMonth} 1, ${aYear}`)
        const bDate = new Date(`${bMonth} 1, ${bYear}`)
        return aDate.getTime() - bDate.getTime()
      })
    } else if (timeFrame === "quarterly") {
      // Group by quarter
      const quarters: Record<string, number> = {}
      filteredInvoices.forEach((invoice) => {
        const date = new Date(invoice.date)
        const quarter = Math.floor(date.getMonth() / 3) + 1
        const quarterKey = `${date.getFullYear()}-Q${quarter}`
        quarters[quarterKey] = (quarters[quarterKey] || 0) + invoice.total
      })

      Object.entries(quarters).forEach(([quarter, total]) => {
        data.push({
          date: quarter,
          total: total,
        })
      })

      // Sort by date
      data.sort((a, b) => {
        const [aYear, aQ] = a.date.split("-")
        const [bYear, bQ] = b.date.split("-")
        if (aYear !== bYear) return Number.parseInt(aYear) - Number.parseInt(bYear)
        return aQ.localeCompare(bQ)
      })
    } else if (timeFrame === "yearly") {
      // Group by year
      const years: Record<string, number> = {}
      filteredInvoices.forEach((invoice) => {
        const date = new Date(invoice.date)
        const yearKey = `${date.getFullYear()}`
        years[yearKey] = (years[yearKey] || 0) + invoice.total
      })

      Object.entries(years).forEach(([year, total]) => {
        data.push({
          date: year,
          total: total,
        })
      })

      // Sort by date
      data.sort((a, b) => Number.parseInt(a.date) - Number.parseInt(b.date))
    }

    return data
  }

  const timeSeriesData = prepareTimeSeriesData()

  const statusData = [
    { name: t("paid"), value: paidAmount },
    { name: t("unpaid"), value: unpaidAmount - overdueAmount },
    { name: t("overdue"), value: overdueAmount },
  ]

  const COLORS = ["#4ade80", "#facc15", "#f87171"]

  // Top customers data
  const customerData = filteredInvoices.reduce((acc: Record<string, number>, invoice) => {
    const customerName = invoice.customer.name
    acc[customerName] = (acc[customerName] || 0) + invoice.total
    return acc
  }, {})

  const topCustomers = Object.entries(customerData)
    .map(([name, total]) => ({ name, total }))
    .sort((a, b) => b.total - a.total)
    .slice(0, 5)

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row justify-between gap-4">
        <DateRangePicker
          from={dateRange.from}
          to={dateRange.to}
          onFromChange={(date) => setDateRange({ ...dateRange, from: date })}
          onToChange={(date) => setDateRange({ ...dateRange, to: date })}
        />

        <div className="flex gap-2">
          <Select value={timeFrame} onValueChange={(value: any) => setTimeFrame(value)}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder={t("timeFrame")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="daily">{t("daily")}</SelectItem>
              <SelectItem value="weekly">{t("weekly")}</SelectItem>
              <SelectItem value="monthly">{t("monthly")}</SelectItem>
              <SelectItem value="quarterly">{t("quarterly")}</SelectItem>
              <SelectItem value="yearly">{t("yearly")}</SelectItem>
            </SelectContent>
          </Select>

          <Select value={currency} onValueChange={setCurrency}>
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder={t("currency")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="IDR">IDR</SelectItem>
              <SelectItem value="USD">USD</SelectItem>
              <SelectItem value="SAR">SAR</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">{t("totalRevenue")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Intl.NumberFormat("id-ID", { style: "currency", currency }).format(totalRevenue)}
            </div>
            <p className="text-xs text-muted-foreground">
              {filteredInvoices.length} {t("invoices")}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">{t("paidInvoices")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Intl.NumberFormat("id-ID", { style: "currency", currency }).format(paidAmount)}
            </div>
            <p className="text-xs text-muted-foreground">
              {paidInvoices.length} {t("invoices")}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">{t("unpaidInvoices")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Intl.NumberFormat("id-ID", { style: "currency", currency }).format(unpaidAmount)}
            </div>
            <p className="text-xs text-muted-foreground">
              {unpaidInvoices.length} {t("invoices")}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">{t("overdueInvoices")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-500">
              {new Intl.NumberFormat("id-ID", { style: "currency", currency }).format(overdueAmount)}
            </div>
            <p className="text-xs text-muted-foreground">
              {overdueInvoices.length} {t("invoices")}
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="revenue">
        <TabsList>
          <TabsTrigger value="revenue">{t("revenue")}</TabsTrigger>
          <TabsTrigger value="status">{t("invoiceStatus")}</TabsTrigger>
          <TabsTrigger value="customers">{t("topCustomers")}</TabsTrigger>
        </TabsList>

        <TabsContent value="revenue" className="pt-4">
          <Card>
            <CardHeader>
              <CardTitle>{t("revenueOverTime")}</CardTitle>
              <CardDescription>{t("revenueOverTimeDescription")}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={timeSeriesData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis
                      tickFormatter={(value) =>
                        new Intl.NumberFormat("id-ID", {
                          notation: "compact",
                          compactDisplay: "short",
                          currency,
                        }).format(value)
                      }
                    />
                    <Tooltip
                      formatter={(value: number) =>
                        new Intl.NumberFormat("id-ID", {
                          style: "currency",
                          currency,
                        }).format(value)
                      }
                    />
                    <Legend />
                    <Bar dataKey="total" fill="#3b82f6" name={t("revenue")} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="status" className="pt-4">
          <Card>
            <CardHeader>
              <CardTitle>{t("invoiceStatusDistribution")}</CardTitle>
              <CardDescription>{t("invoiceStatusDistributionDescription")}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={statusData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    >
                      {statusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value: number) =>
                        new Intl.NumberFormat("id-ID", {
                          style: "currency",
                          currency,
                        }).format(value)
                      }
                    />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="customers" className="pt-4">
          <Card>
            <CardHeader>
              <CardTitle>{t("topCustomers")}</CardTitle>
              <CardDescription>{t("topCustomersDescription")}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={topCustomers} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      type="number"
                      tickFormatter={(value) =>
                        new Intl.NumberFormat("id-ID", {
                          notation: "compact",
                          compactDisplay: "short",
                          currency,
                        }).format(value)
                      }
                    />
                    <YAxis type="category" dataKey="name" width={150} />
                    <Tooltip
                      formatter={(value: number) =>
                        new Intl.NumberFormat("id-ID", {
                          style: "currency",
                          currency,
                        }).format(value)
                      }
                    />
                    <Legend />
                    <Bar dataKey="total" fill="#8884d8" name={t("revenue")} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
