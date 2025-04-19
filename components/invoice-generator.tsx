"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import {
  AlertCircle,
  ArrowDownToLine,
  ArrowUpFromLine,
  BarChart3,
  CalendarIcon,
  Download,
  FileSpreadsheet,
  FileText,
  Globe,
  HardDrive,
  ImageIcon,
  List,
  Mail,
  Plus,
  Printer,
  RepeatIcon,
  Save,
  Search,
  Trash2,
  Copy,
  X,
  Pencil,
  StampIcon,
  MessageSquare,
  ChevronDown,
} from "lucide-react"
import { Calendar as CalendarComponent } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { format, addDays, addWeeks, addMonths, addYears, isAfter, isBefore } from "date-fns"
import { id, enUS } from "date-fns/locale"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { useToast } from "@/components/ui/use-toast"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"

// Define invoice type
interface InvoiceItem {
  deskripsi: string
  kuantitas: number
  harga: number
}

interface Invoice {
  id: string
  invoiceNumber: string
  date: Date | undefined
  dueDate: Date | undefined
  paymentMethod: string
  fromName: string
  fromEmail: string
  fromPhone: string
  fromAddress: string
  toName: string
  toEmail: string
  toPhone: string
  toWhatsapp: string
  toAddress: string
  items: InvoiceItem[]
  taxEnabled: boolean
  discountEnabled: boolean
  discountType: "percentage" | "fixed"
  discountValue: number
  notes: string
  terms: string
  logo: string | null
  signature: string | null
  stamp: string | null
  currency: string
  template: string
  qrCodeEnabled: boolean
  status: "draft" | "sent" | "paid" | "overdue"
  paidDate?: Date
  paidAmount?: number
  createdAt: Date
}

// Recurring invoice type
interface RecurringInvoice {
  id: string
  name: string
  frequency: "weekly" | "monthly" | "quarterly" | "yearly"
  startDate: Date
  endDate?: Date
  lastGenerated?: Date
  nextDue?: Date
  daysBetweenInvoices: number
  active: boolean
  template: Invoice
}

// Currency configuration
interface CurrencyConfig {
  code: string
  symbol: string
  name: string
  decimalPlaces: number
}

const currencies: Record<string, CurrencyConfig> = {
  IDR: {
    code: "IDR",
    symbol: "Rp",
    name: "Rupiah Indonesia",
    decimalPlaces: 0,
  },
  USD: {
    code: "USD",
    symbol: "$",
    name: "Dollar Amerika",
    decimalPlaces: 2,
  },
  SAR: {
    code: "SAR",
    symbol: "﷼",
    name: "Riyal Saudi",
    decimalPlaces: 2,
  },
}

// Invoice templates
interface InvoiceTemplate {
  id: string
  name: string
  primaryColor: string
  secondaryColor: string
  fontFamily: string
  headerStyle: string
}

const invoiceTemplates: InvoiceTemplate[] = [
  {
    id: "default",
    name: "Default",
    primaryColor: "text-gray-800",
    secondaryColor: "text-gray-500",
    fontFamily: "font-sans",
    headerStyle: "",
  },
  {
    id: "modern",
    name: "Modern",
    primaryColor: "text-blue-600",
    secondaryColor: "text-blue-400",
    fontFamily: "font-sans",
    headerStyle: "border-l-4 border-blue-500 pl-4",
  },
  {
    id: "classic",
    name: "Classic",
    primaryColor: "text-amber-800",
    secondaryColor: "text-amber-600",
    fontFamily: "font-serif",
    headerStyle: "border-b-2 border-amber-500",
  },
  {
    id: "minimal",
    name: "Minimal",
    primaryColor: "text-gray-900",
    secondaryColor: "text-gray-400",
    fontFamily: "font-mono",
    headerStyle: "uppercase tracking-wider",
  },
]

// Language support
type Language = "id" | "en"

interface Translations {
  [key: string]: {
    [key: string]: string
  }
}

const translations: Translations = {
  appTitle: {
    id: "Generator Faktur",
    en: "Invoice Generator",
  },
  newInvoice: {
    id: "Faktur Baru",
    en: "New Invoice",
  },
  invoiceList: {
    id: "Daftar Faktur",
    en: "Invoice List",
  },
  storage: {
    id: "Penyimpanan",
    en: "Storage",
  },
  reports: {
    id: "Laporan",
    en: "Reports",
  },
  recurring: {
    id: "Faktur Berulang",
    en: "Recurring Invoices",
  },
  edit: {
    id: "Edit",
    en: "Edit",
  },
  preview: {
    id: "Pratinjau",
    en: "Preview",
  },
  basicInfo: {
    id: "Informasi Dasar",
    en: "Basic Information",
  },
  invoiceNumber: {
    id: "Nomor Faktur",
    en: "Invoice Number",
  },
  invoiceDate: {
    id: "Tanggal Faktur",
    en: "Invoice Date",
  },
  dueDate: {
    id: "Tanggal Jatuh Tempo",
    en: "Due Date",
  },
  selectDate: {
    id: "Pilih tanggal",
    en: "Select date",
  },
  paymentMethod: {
    id: "Metode Pembayaran",
    en: "Payment Method",
  },
  bankTransfer: {
    id: "Transfer Bank",
    en: "Bank Transfer",
  },
  cash: {
    id: "Tunai",
    en: "Cash",
  },
  eWallet: {
    id: "E-Wallet",
    en: "E-Wallet",
  },
  invoiceSettings: {
    id: "Pengaturan Faktur",
    en: "Invoice Settings",
  },
  currency: {
    id: "Mata Uang",
    en: "Currency",
  },
  showQrCode: {
    id: "Tampilkan QR Code",
    en: "Show QR Code",
  },
  template: {
    id: "Template Faktur",
    en: "Invoice Template",
  },
  companyLogo: {
    id: "Logo Perusahaan",
    en: "Company Logo",
  },
  uploadLogo: {
    id: "Unggah Logo",
    en: "Upload Logo",
  },
  signatureStamp: {
    id: "Tanda Tangan & Stempel",
    en: "Signature & Stamp",
  },
  createSignature: {
    id: "Buat Tanda Tangan",
    en: "Create Signature",
  },
  editSignature: {
    id: "Edit Tanda Tangan",
    en: "Edit Signature",
  },
  digitalSignature: {
    id: "Tanda Tangan Digital",
    en: "Digital Signature",
  },
  uploadStamp: {
    id: "Unggah Stempel",
    en: "Upload Stamp",
  },
  from: {
    id: "Dari",
    en: "From",
  },
  to: {
    id: "Untuk",
    en: "To",
  },
  nameCompany: {
    id: "Nama/Perusahaan",
    en: "Name/Company",
  },
  email: {
    id: "Email",
    en: "Email",
  },
  phone: {
    id: "Telepon",
    en: "Phone",
  },
  whatsapp: {
    id: "WhatsApp",
    en: "WhatsApp",
  },
  address: {
    id: "Alamat",
    en: "Address",
  },
  items: {
    id: "Item",
    en: "Items",
  },
  addItem: {
    id: "Tambah Item",
    en: "Add Item",
  },
  description: {
    id: "Deskripsi",
    en: "Description",
  },
  quantity: {
    id: "Kuantitas",
    en: "Quantity",
  },
  price: {
    id: "Harga",
    en: "Price",
  },
  amount: {
    id: "Jumlah",
    en: "Amount",
  },
  discount: {
    id: "Diskon",
    en: "Discount",
  },
  percentage: {
    id: "Persentase",
    en: "Percentage",
  },
  fixed: {
    id: "Nominal",
    en: "Fixed",
  },
  tax: {
    id: "PPN (11%)",
    en: "VAT (11%)",
  },
  subtotal: {
    id: "Subtotal",
    en: "Subtotal",
  },
  total: {
    id: "Total",
    en: "Total",
  },
  notesTerms: {
    id: "Catatan & Syarat",
    en: "Notes & Terms",
  },
  notes: {
    id: "Catatan",
    en: "Notes",
  },
  terms: {
    id: "Syarat & Ketentuan",
    en: "Terms & Conditions",
  },
  duplicate: {
    id: "Duplikat",
    en: "Duplicate",
  },
  emailInvoice: {
    id: "Email Faktur",
    en: "Email Invoice",
  },
  sendInvoiceEmail: {
    id: "Kirim Faktur via Email",
    en: "Send Invoice via Email",
  },
  recipient: {
    id: "Penerima",
    en: "Recipient",
  },
  subject: {
    id: "Subjek",
    en: "Subject",
  },
  message: {
    id: "Pesan",
    en: "Message",
  },
  cancel: {
    id: "Batal",
    en: "Cancel",
  },
  send: {
    id: "Kirim",
    en: "Send",
  },
  save: {
    id: "Simpan Faktur",
    en: "Save Invoice",
  },
  print: {
    id: "Cetak Faktur",
    en: "Print Invoice",
  },
  invoiceTo: {
    id: "FAKTUR UNTUK",
    en: "INVOICE TO",
  },
  invoiceNum: {
    id: "NOMOR FAKTUR",
    en: "INVOICE NUMBER",
  },
  date: {
    id: "TANGGAL",
    en: "DATE",
  },
  scanToVerify: {
    id: "Scan untuk verifikasi",
    en: "Scan to verify",
  },
  savedInvoices: {
    id: "Faktur Tersimpan",
    en: "Saved Invoices",
  },
  searchInvoices: {
    id: "Cari faktur...",
    en: "Search invoices...",
  },
  customer: {
    id: "Pelanggan",
    en: "Customer",
  },
  actions: {
    id: "Aksi",
    en: "Actions",
  },
  load: {
    id: "Muat",
    en: "Load",
  },
  delete: {
    id: "Hapus",
    en: "Delete",
  },
  noInvoicesFound: {
    id: "Tidak ada faktur yang sesuai dengan pencarian",
    en: "No invoices match your search",
  },
  noInvoicesSaved: {
    id: "Belum ada faktur tersimpan",
    en: "No invoices saved yet",
  },
  storageManagement: {
    id: "Manajemen Penyimpanan Lokal",
    en: "Local Storage Management",
  },
  usage: {
    id: "Penggunaan",
    en: "Usage",
  },
  of: {
    id: "dari",
    en: "of",
  },
  exportData: {
    id: "Ekspor Data",
    en: "Export Data",
  },
  exportAllInvoices: {
    id: "Ekspor Semua Faktur",
    en: "Export All Invoices",
  },
  importData: {
    id: "Impor Data",
    en: "Import Data",
  },
  importInvoices: {
    id: "Impor Faktur",
    en: "Import Invoices",
  },
  dangerZone: {
    id: "Zona Berbahaya",
    en: "Danger Zone",
  },
  deleteAllInvoices: {
    id: "Hapus Semua Faktur",
    en: "Delete All Invoices",
  },
  deleteWarning: {
    id: "Peringatan: Tindakan ini akan menghapus semua faktur tersimpan dan tidak dapat dibatalkan.",
    en: "Warning: This action will delete all saved invoices and cannot be undone.",
  },
  status: {
    id: "Status",
    en: "Status",
  },
  draft: {
    id: "Draft",
    en: "Draft",
  },
  sent: {
    id: "Terkirim",
    en: "Sent",
  },
  paid: {
    id: "Dibayar",
    en: "Paid",
  },
  overdue: {
    id: "Jatuh Tempo",
    en: "Overdue",
  },
  markAsPaid: {
    id: "Tandai Dibayar",
    en: "Mark as Paid",
  },
  markAsSent: {
    id: "Tandai Terkirim",
    en: "Mark as Sent",
  },
  paidDate: {
    id: "Tanggal Pembayaran",
    en: "Payment Date",
  },
  paidAmount: {
    id: "Jumlah Dibayar",
    en: "Amount Paid",
  },
  financialReports: {
    id: "Laporan Keuangan",
    en: "Financial Reports",
  },
  summary: {
    id: "Ringkasan",
    en: "Summary",
  },
  totalRevenue: {
    id: "Total Pendapatan",
    en: "Total Revenue",
  },
  outstandingAmount: {
    id: "Jumlah Belum Dibayar",
    en: "Outstanding Amount",
  },
  paidInvoices: {
    id: "Faktur Dibayar",
    en: "Paid Invoices",
  },
  unpaidInvoices: {
    id: "Faktur Belum Dibayar",
    en: "Unpaid Invoices",
  },
  overdueInvoices: {
    id: "Faktur Jatuh Tempo",
    en: "Overdue Invoices",
  },
  revenueByMonth: {
    id: "Pendapatan per Bulan",
    en: "Revenue by Month",
  },
  topCustomers: {
    id: "Pelanggan Teratas",
    en: "Top Customers",
  },
  filterByDate: {
    id: "Filter berdasarkan Tanggal",
    en: "Filter by Date",
  },
  startDate: {
    id: "Tanggal Mulai",
    en: "Start Date",
  },
  endDate: {
    id: "Tanggal Akhir",
    en: "End Date",
  },
  apply: {
    id: "Terapkan",
    en: "Apply",
  },
  reset: {
    id: "Reset",
    en: "Reset",
  },
  thisMonth: {
    id: "Bulan Ini",
    en: "This Month",
  },
  lastMonth: {
    id: "Bulan Lalu",
    en: "Last Month",
  },
  thisQuarter: {
    id: "Kuartal Ini",
    en: "This Quarter",
  },
  thisYear: {
    id: "Tahun Ini",
    en: "This Year",
  },
  allTime: {
    id: "Semua Waktu",
    en: "All Time",
  },
  recurringInvoices: {
    id: "Faktur Berulang",
    en: "Recurring Invoices",
  },
  createRecurring: {
    id: "Buat Faktur Berulang",
    en: "Create Recurring Invoice",
  },
  recurringName: {
    id: "Nama Template",
    en: "Template Name",
  },
  frequency: {
    id: "Frekuensi",
    en: "Frequency",
  },
  weekly: {
    id: "Mingguan",
    en: "Weekly",
  },
  monthly: {
    id: "Bulanan",
    en: "Monthly",
  },
  quarterly: {
    id: "Kuartalan",
    en: "Quarterly",
  },
  yearly: {
    id: "Tahunan",
    en: "Yearly",
  },
  nextDue: {
    id: "Jatuh Tempo Berikutnya",
    en: "Next Due",
  },
  active: {
    id: "Aktif",
    en: "Active",
  },
  inactive: {
    id: "Tidak Aktif",
    en: "Inactive",
  },
  activate: {
    id: "Aktifkan",
    en: "Activate",
  },
  deactivate: {
    id: "Nonaktifkan",
    en: "Deactivate",
  },
  edit: {
    id: "Edit",
    en: "Edit",
  },
  noRecurringInvoices: {
    id: "Belum ada faktur berulang",
    en: "No recurring invoices yet",
  },
  createFromCurrent: {
    id: "Buat dari Faktur Saat Ini",
    en: "Create from Current Invoice",
  },
  recurringSettings: {
    id: "Pengaturan Faktur Berulang",
    en: "Recurring Invoice Settings",
  },
  lastGenerated: {
    id: "Terakhir Dibuat",
    en: "Last Generated",
  },
  never: {
    id: "Belum Pernah",
    en: "Never",
  },
  generateNow: {
    id: "Buat Sekarang",
    en: "Generate Now",
  },
  invoiceStatus: {
    id: "Status Faktur",
    en: "Invoice Status",
  },
  updateStatus: {
    id: "Perbarui Status",
    en: "Update Status",
  },
  statusUpdated: {
    id: "Status Diperbarui",
    en: "Status Updated",
  },
  invoiceSaved: {
    id: "Faktur Disimpan",
    en: "Invoice Saved",
  },
  invoiceDeleted: {
    id: "Faktur Dihapus",
    en: "Invoice Deleted",
  },
  invoiceDuplicated: {
    id: "Faktur Diduplikasi",
    en: "Invoice Duplicated",
  },
  invoiceLoaded: {
    id: "Faktur Dimuat",
    en: "Invoice Loaded",
  },
  invoiceSent: {
    id: "Faktur Terkirim",
    en: "Invoice Sent",
  },
  newInvoiceCreated: {
    id: "Faktur Baru",
    en: "New Invoice",
  },
  formReset: {
    id: "Form faktur telah direset.",
    en: "Invoice form has been reset.",
  },
  signatureSaved: {
    id: "Tanda Tangan Disimpan",
    en: "Signature Saved",
  },
  signatureAdded: {
    id: "Tanda tangan digital berhasil ditambahkan ke faktur.",
    en: "Digital signature successfully added to invoice.",
  },
  emptySignature: {
    id: "Tanda Tangan Kosong",
    en: "Empty Signature",
  },
  createSignatureFirst: {
    id: "Silakan buat tanda tangan terlebih dahulu.",
    en: "Please create a signature first.",
  },
  emailRequired: {
    id: "Email Penerima Diperlukan",
    en: "Recipient Email Required",
  },
  enterRecipientEmail: {
    id: "Silakan masukkan alamat email penerima.",
    en: "Please enter recipient email address.",
  },
  whatsappRequired: {
    id: "Nomor WhatsApp Diperlukan",
    en: "WhatsApp Number Required",
  },
  enterWhatsappNumber: {
    id: "Silakan masukkan nomor WhatsApp penerima.",
    en: "Please enter recipient WhatsApp number.",
  },
  noInvoicesToExport: {
    id: "Tidak Ada Faktur",
    en: "No Invoices",
  },
  noInvoicesToExportDesc: {
    id: "Tidak ada faktur tersimpan untuk diekspor.",
    en: "There are no saved invoices to export.",
  },
  exportSuccess: {
    id: "Ekspor Berhasil",
    en: "Export Successful",
  },
  invoicesExported: {
    id: "faktur berhasil diekspor.",
    en: "invoices successfully exported.",
  },
  importFailed: {
    id: "Gagal Mengimpor",
    en: "Import Failed",
  },
  invalidFileFormat: {
    id: "Format file tidak valid atau terjadi kesalahan.",
    en: "Invalid file format or an error occurred.",
  },
  importSuccess: {
    id: "Impor Berhasil",
    en: "Import Successful",
  },
  newInvoicesImported: {
    id: "faktur baru berhasil diimpor.",
    en: "new invoices successfully imported.",
  },
  storageCleared: {
    id: "Penyimpanan Dibersihkan",
    en: "Storage Cleared",
  },
  allInvoicesDeleted: {
    id: "Semua faktur tersimpan telah dihapus.",
    en: "All saved invoices have been deleted.",
  },
  storageAlmostFull: {
    id: "Penyimpanan Hampir Penuh",
    en: "Storage Almost Full",
  },
  storageWarning: {
    id: "Penyimpanan lokal Anda hampir penuh. Ekspor faktur Anda dan hapus beberapa untuk mengosongkan ruang.",
    en: "Your local storage is almost full. Export your invoices and delete some to free up space.",
  },
  recurringCreated: {
    id: "Faktur Berulang Dibuat",
    en: "Recurring Invoice Created",
  },
  recurringCreatedDesc: {
    id: "Template faktur berulang berhasil dibuat.",
    en: "Recurring invoice template successfully created.",
  },
  recurringUpdated: {
    id: "Faktur Berulang Diperbarui",
    en: "Recurring Invoice Updated",
  },
  recurringUpdatedDesc: {
    id: "Template faktur berulang berhasil diperbarui.",
    en: "Recurring invoice template successfully updated.",
  },
  recurringDeleted: {
    id: "Faktur Berulang Dihapus",
    en: "Recurring Invoice Deleted",
  },
  recurringDeletedDesc: {
    id: "Template faktur berulang berhasil dihapus.",
    en: "Recurring invoice template successfully deleted.",
  },
  invoiceGenerated: {
    id: "Faktur Dibuat",
    en: "Invoice Generated",
  },
  invoiceGeneratedDesc: {
    id: "Faktur baru berhasil dibuat dari template berulang.",
    en: "New invoice successfully generated from recurring template.",
  },
  nameRequired: {
    id: "Nama Diperlukan",
    en: "Name Required",
  },
  enterTemplateName: {
    id: "Silakan masukkan nama template.",
    en: "Please enter a template name.",
  },
  startDateRequired: {
    id: "Tanggal Mulai Diperlukan",
    en: "Start Date Required",
  },
  selectStartDate: {
    id: "Silakan pilih tanggal mulai.",
    en: "Please select a start date.",
  },
  invalidEndDate: {
    id: "Tanggal Akhir Tidak Valid",
    en: "Invalid End Date",
  },
  endDateAfterStart: {
    id: "Tanggal akhir harus setelah tanggal mulai.",
    en: "End date must be after start date.",
  },
}

// Generate unique ID
const generateId = () => {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
}

// Simple QR Code generator component
function QRCode({ text, size = 128 }: { text: string; size?: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (!canvasRef.current) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Generate QR code data
    const qrData = generateQRCodeData(text)
    const moduleCount = qrData.length
    const moduleSize = size / moduleCount

    // Draw QR code
    ctx.fillStyle = "#000000"
    for (let row = 0; row < moduleCount; row++) {
      for (let col = 0; col < moduleCount; col++) {
        if (qrData[row][col]) {
          ctx.fillRect(col * moduleSize, row * moduleSize, moduleSize, moduleSize)
        }
      }
    }
  }, [text, size])

  // Simple QR code generation algorithm (this is a very basic implementation)
  // In a real app, you would use a proper QR code library
  const generateQRCodeData = (text: string): boolean[][] => {
    // This is a placeholder implementation that creates a simple pattern
    // based on the text. It's not a real QR code, just a visual representation.
    const hash = hashString(text)
    const size = 21 // Standard QR code size for version 1
    const data: boolean[][] = Array(size)
      .fill(false)
      .map(() => Array(size).fill(false))

    // Add finder patterns (the three squares in the corners)
    // Top-left
    for (let i = 0; i < 7; i++) {
      for (let j = 0; j < 7; j++) {
        data[i][j] = i === 0 || i === 6 || j === 0 || j === 6 || (i >= 2 && i <= 4 && j >= 2 && j <= 4)
      }
    }
    // Top-right
    for (let i = 0; i < 7; i++) {
      for (let j = size - 7; j < size; j++) {
        data[i][j] =
          i === 0 || i === 6 || j === size - 7 || j === size - 1 || (i >= 2 && i <= 4 && j >= size - 5 && j <= size - 3)
      }
    }
    // Bottom-left
    for (let i = size - 7; i < size; i++) {
      for (let j = 0; j < 7; j++) {
        data[i][j] =
          i === size - 7 || i === size - 1 || j === 0 || j === 6 || (i >= size - 5 && i <= size - 3 && j >= 2 && j <= 4)
      }
    }

    // Fill the rest with a pattern based on the hash
    for (let i = 0; i < size; i++) {
      for (let j = 0; j < size; j++) {
        // Skip finder patterns
        if ((i < 7 && j < 7) || (i < 7 && j >= size - 7) || (i >= size - 7 && j < 7)) {
          continue
        }
        // Use the hash to determine if a module should be filled
        const index = (i * size + j) % hash.length
        data[i][j] = hash.charCodeAt(index) % 2 === 0
      }
    }

    return data
  }

  // Simple string hashing function
  const hashString = (str: string): string => {
    let hash = 0
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i)
      hash = (hash << 5) - hash + char
      hash = hash & hash // Convert to 32bit integer
    }
    return Math.abs(hash).toString(16)
  }

  return <canvas ref={canvasRef} width={size} height={size} className="border border-gray-200" />
}

// Calculate local storage usage
const calculateStorageUsage = (): { used: number; total: number; percentage: number } => {
  let used = 0
  for (const key in localStorage) {
    if (localStorage.hasOwnProperty(key)) {
      used += (localStorage[key].length + key.length) * 2 // Approximate size in bytes
    }
  }

  // Convert to KB
  used = used / 1024
  // Estimate total available (5MB is typical limit)
  const total = 5 * 1024 // 5MB in KB
  const percentage = Math.min(100, (used / total) * 100)

  return { used, total, percentage }
}

// Simple bar chart component
function BarChart({
  data,
  height = 200,
  barColor = "#3b82f6",
  textColor = "#374151",
}: {
  data: { label: string; value: number }[]
  height?: number
  barColor?: string
  textColor?: string
}) {
  const maxValue = Math.max(...data.map((item) => item.value), 1)

  return (
    <div className="w-full">
      <div className="flex items-end h-[200px] gap-2">
        {data.map((item, index) => {
          const barHeight = (item.value / maxValue) * height
          return (
            <div key={index} className="flex flex-col items-center flex-1">
              <div
                className="w-full rounded-t-sm transition-all duration-300"
                style={{ height: `${barHeight}px`, backgroundColor: barColor }}
              ></div>
              <div className="text-xs mt-1 text-center truncate w-full" style={{ color: textColor }}>
                {item.label}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export const InvoiceGenerator = () => {
  const { toast } = useToast()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const signatureCanvasRef = useRef<HTMLCanvasElement>(null)
  const stampInputRef = useRef<HTMLInputElement>(null)
  const fileImportRef = useRef<HTMLInputElement>(null)

  // Language state
  const [language, setLanguage] = useState<Language>("id")

  // Translate function
  const t = (key: string): string => {
    return translations[key]?.[language] || key
  }

  // State for saved invoices
  const [savedInvoices, setSavedInvoices] = useState<Invoice[]>([])
  const [showSavedInvoices, setShowSavedInvoices] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [storageUsage, setStorageUsage] = useState({ used: 0, total: 0, percentage: 0 })
  const [showStorageDialog, setShowStorageDialog] = useState(false)

  // State for recurring invoices
  const [recurringInvoices, setRecurringInvoices] = useState<RecurringInvoice[]>([])
  const [showRecurringDialog, setShowRecurringDialog] = useState(false)
  const [showCreateRecurringDialog, setShowCreateRecurringDialog] = useState(false)
  const [recurringName, setRecurringName] = useState("")
  const [recurringFrequency, setRecurringFrequency] = useState<"weekly" | "monthly" | "quarterly" | "yearly">("monthly")
  const [recurringStartDate, setRecurringStartDate] = useState<Date>()
  const [recurringEndDate, setRecurringEndDate] = useState<Date>()
  const [editingRecurringId, setEditingRecurringId] = useState<string | null>(null)

  // State for reports
  const [showReportsDialog, setShowReportsDialog] = useState(false)
  const [reportDateRange, setReportDateRange] = useState<{
    startDate: Date | undefined
    endDate: Date | undefined
  }>({
    startDate: undefined,
    endDate: undefined,
  })
  const [reportPeriod, setReportPeriod] = useState<"thisMonth" | "lastMonth" | "thisQuarter" | "thisYear" | "allTime">(
    "thisMonth",
  )

  // Form state
  const [currentInvoiceId, setCurrentInvoiceId] = useState<string>(generateId())
  const [invoiceNumber, setInvoiceNumber] = useState("INV-001")
  const [date, setDate] = useState<Date>()
  const [dueDate, setDueDate] = useState<Date>()
  const [paymentMethod, setPaymentMethod] = useState<string>("")
  const [invoiceStatus, setInvoiceStatus] = useState<"draft" | "sent" | "paid" | "overdue">("draft")
  const [paidDate, setPaidDate] = useState<Date>()
  const [paidAmount, setPaidAmount] = useState<number>(0)
  const [showStatusDialog, setShowStatusDialog] = useState(false)

  // Sender info
  const [fromName, setFromName] = useState("PT Maju Bersama")
  const [fromEmail, setFromEmail] = useState("info@majubersama.com")
  const [fromPhone, setFromPhone] = useState("021-5551234")
  const [fromAddress, setFromAddress] = useState("Jl. Sudirman No. 123, Jakarta Pusat")

  // Recipient info
  const [toName, setToName] = useState("PT Pelanggan Setia")
  const [toEmail, setToEmail] = useState("finance@pelanggansetia.com")
  const [toPhone, setToPhone] = useState("021-5557890")
  const [toWhatsapp, setToWhatsapp] = useState("6281234567890")
  const [toAddress, setToAddress] = useState("Jl. Gatot Subroto No. 456, Jakarta Selatan")

  // Notes and terms
  const [notes, setNotes] = useState("Terima kasih atas kerjasamanya.")
  const [terms, setTerms] = useState("Pembayaran harus dilakukan dalam 14 hari.")

  // Items, tax and discount
  const [items, setItems] = useState([{ deskripsi: "Jasa Konsultasi", kuantitas: 1, harga: 1000000 }])
  const [taxEnabled, setTaxEnabled] = useState(true)
  const [discountEnabled, setDiscountEnabled] = useState(false)
  const [discountType, setDiscountType] = useState<"percentage" | "fixed">("percentage")
  const [discountValue, setDiscountValue] = useState<number>(0)

  // Logo, signature and stamp
  const [logo, setLogo] = useState<string | null>(null)
  const [signature, setSignature] = useState<string | null>(null)
  const [stamp, setStamp] = useState<string | null>(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [showSignatureDialog, setShowSignatureDialog] = useState(false)

  // Currency and template
  const [currency, setCurrency] = useState<string>("IDR")
  const [template, setTemplate] = useState<string>("default")

  // QR Code
  const [qrCodeEnabled, setQrCodeEnabled] = useState(true)
  const [qrCodeData, setQrCodeData] = useState("")

  // Email dialog
  const [showEmailDialog, setShowEmailDialog] = useState(false)
  const [emailRecipient, setEmailRecipient] = useState("")
  const [emailSubject, setEmailSubject] = useState("")
  const [emailMessage, setEmailMessage] = useState("")

  // Active tab
  const [activeTab, setActiveTab] = useState("edit")

  // Load saved data from localStorage on component mount
  useEffect(() => {
    // Load language preference
    const savedLanguage = localStorage.getItem("invoiceGeneratorLanguage")
    if (savedLanguage && (savedLanguage === "id" || savedLanguage === "en")) {
      setLanguage(savedLanguage as Language)
    }

    // Load saved invoices
    const savedInvoicesData = localStorage.getItem("savedInvoices")
    if (savedInvoicesData) {
      try {
        const parsedData = JSON.parse(savedInvoicesData)
        // Convert date strings back to Date objects
        const processedData = parsedData.map((invoice: any) => ({
          ...invoice,
          date: invoice.date ? new Date(invoice.date) : undefined,
          dueDate: invoice.dueDate ? new Date(invoice.dueDate) : undefined,
          paidDate: invoice.paidDate ? new Date(invoice.paidDate) : undefined,
          createdAt: new Date(invoice.createdAt),
          status: invoice.status || "draft",
        }))
        setSavedInvoices(processedData)
      } catch (error) {
        console.error("Error loading saved invoices:", error)
      }
    }

    // Load recurring invoices
    const recurringInvoicesData = localStorage.getItem("recurringInvoices")
    if (recurringInvoicesData) {
      try {
        const parsedData = JSON.parse(recurringInvoicesData)
        // Convert date strings back to Date objects
        const processedData = parsedData.map((recurring: any) => ({
          ...recurring,
          startDate: recurring.startDate ? new Date(recurring.startDate) : undefined,
          endDate: recurring.endDate ? new Date(recurring.endDate) : undefined,
          lastGenerated: recurring.lastGenerated ? new Date(recurring.lastGenerated) : undefined,
          nextDue: recurring.nextDue ? new Date(recurring.nextDue) : undefined,
          template: {
            ...recurring.template,
            date: recurring.template.date ? new Date(recurring.template.date) : undefined,
            dueDate: recurring.template.dueDate ? new Date(recurring.template.dueDate) : undefined,
            createdAt: new Date(recurring.template.createdAt || new Date()),
          },
        }))
        setRecurringInvoices(processedData)
      } catch (error) {
        console.error("Error loading recurring invoices:", error)
      }
    }

    // Calculate storage usage
    setStorageUsage(calculateStorageUsage())

    // Set default dates
    const today = new Date()
    setDate(today)
    setDueDate(addDays(today, 14))
  }, [])

  // Save language preference when it changes
  useEffect(() => {
    localStorage.setItem("invoiceGeneratorLanguage", language)
  }, [language])

  // Update QR code data when invoice details change
  useEffect(() => {
    const qrData = {
      invoiceNumber,
      date: date ? format(date, "yyyy-MM-dd") : "",
      amount: calculateTotal(),
      currency,
      customer: toName,
    }
    setQrCodeData(JSON.stringify(qrData))
  }, [invoiceNumber, date, currency, toName, items, taxEnabled, discountEnabled, discountType, discountValue])

  // Check for recurring invoices that need to be generated
  useEffect(() => {
    const checkRecurringInvoices = () => {
      const today = new Date()
      const updatedRecurring: RecurringInvoice[] = []
      let invoicesGenerated = false

      recurringInvoices.forEach((recurring) => {
        if (!recurring.active) {
          updatedRecurring.push(recurring)
          return
        }

        // Skip if end date is set and has passed
        if (recurring.endDate && isAfter(today, recurring.endDate)) {
          updatedRecurring.push({ ...recurring, active: false })
          return
        }

        // Calculate next due date if not set
        let nextDue = recurring.nextDue
        if (!nextDue) {
          nextDue = recurring.startDate
        }

        // Check if next due date has passed
        if (nextDue && isBefore(nextDue, today)) {
          // Generate new invoice
          const newInvoice: Invoice = {
            ...recurring.template,
            id: generateId(),
            invoiceNumber: generateNextInvoiceNumber(savedInvoices),
            date: new Date(),
            dueDate: addDays(new Date(), 14),
            status: "draft",
            createdAt: new Date(),
          }

          // Add to saved invoices
          setSavedInvoices((prev) => {
            const updated = [...prev, newInvoice]
            localStorage.setItem("savedInvoices", JSON.stringify(updated))
            return updated
          })

          // Calculate next due date based on frequency
          let newNextDue: Date
          switch (recurring.frequency) {
            case "weekly":
              newNextDue = addWeeks(nextDue, 1)
              break
            case "monthly":
              newNextDue = addMonths(nextDue, 1)
              break
            case "quarterly":
              newNextDue = addMonths(nextDue, 3)
              break
            case "yearly":
              newNextDue = addYears(nextDue, 1)
              break
            default:
              newNextDue = addMonths(nextDue, 1)
          }

          // Update recurring invoice
          updatedRecurring.push({
            ...recurring,
            lastGenerated: new Date(),
            nextDue: newNextDue,
          })

          invoicesGenerated = true
        } else {
          updatedRecurring.push(recurring)
        }
      })

      if (updatedRecurring.length !== recurringInvoices.length || invoicesGenerated) {
        setRecurringInvoices(updatedRecurring)
        localStorage.setItem("recurringInvoices", JSON.stringify(updatedRecurring))

        if (invoicesGenerated) {
          toast({
            title: t("invoiceGenerated"),
            description: t("invoiceGeneratedDesc"),
          })
        }
      }
    }

    // Check on component mount and set interval
    checkRecurringInvoices()
    const interval = setInterval(checkRecurringInvoices, 60000) // Check every minute

    return () => clearInterval(interval)
  }, [recurringInvoices, savedInvoices, toast])

  // Filter invoices based on search query
  const filteredInvoices = savedInvoices.filter((invoice) => {
    const query = searchQuery.toLowerCase()
    return (
      invoice.invoiceNumber.toLowerCase().includes(query) ||
      invoice.toName.toLowerCase().includes(query) ||
      invoice.fromName.toLowerCase().includes(query) ||
      (invoice.date && format(new Date(invoice.date), "dd MMM yyyy").toLowerCase().includes(query))
    )
  })

  // Generate next invoice number
  const generateNextInvoiceNumber = (invoices: Invoice[]): string => {
    if (invoices.length === 0) return "INV-001"

    // Find the highest invoice number
    const numbers = invoices.map((invoice) => {
      const parts = invoice.invoiceNumber.split("-")
      const num = Number.parseInt(parts[parts.length - 1])
      return isNaN(num) ? 0 : num
    })

    const highestNumber = Math.max(...numbers)
    const nextNumber = highestNumber + 1
    return `INV-${nextNumber.toString().padStart(3, "0")}`
  }

  // Item management
  const addItem = () => {
    setItems([...items, { deskripsi: "", kuantitas: 1, harga: 0 }])
  }

  const removeItem = (index: number) => {
    const newItems = [...items]
    newItems.splice(index, 1)
    setItems(newItems)
  }

  const updateItem = (index: number, field: string, value: string | number) => {
    const newItems = [...items]
    newItems[index] = { ...newItems[index], [field]: value }
    setItems(newItems)
  }

  // Calculation functions
  const calculateSubtotal = () => {
    return items.reduce((total, item) => {
      return total + item.kuantitas * item.harga
    }, 0)
  }

  const calculateDiscount = () => {
    if (!discountEnabled) return 0

    const subtotal = calculateSubtotal()
    if (discountType === "percentage") {
      return subtotal * (discountValue / 100)
    } else {
      return discountValue
    }
  }

  const calculateTax = () => {
    if (!taxEnabled) return 0

    const subtotalAfterDiscount = calculateSubtotal() - calculateDiscount()
    return subtotalAfterDiscount * 0.11 // PPN 11%
  }

  const calculateTotal = () => {
    const subtotal = calculateSubtotal()
    const discount = calculateDiscount()
    const tax = calculateTax()
    return subtotal - discount + tax
  }

  const formatCurrency = (amount: number, currencyCode = currency) => {
    const currencyConfig = currencies[currencyCode]
    return new Intl.NumberFormat(currencyCode === "IDR" ? "id-ID" : "en-US", {
      style: "currency",
      currency: currencyConfig.code,
      minimumFractionDigits: currencyConfig.decimalPlaces,
      maximumFractionDigits: currencyConfig.decimalPlaces,
    }).format(amount)
  }

  // Print function
  const handlePrint = () => {
    window.print()
  }

  // Save invoice
  const handleSave = () => {
    // Create invoice object
    const invoice: Invoice = {
      id: currentInvoiceId,
      invoiceNumber,
      date,
      dueDate,
      paymentMethod,
      fromName,
      fromEmail,
      fromPhone,
      fromAddress,
      toName,
      toEmail,
      toPhone,
      toWhatsapp,
      toAddress,
      items: [...items],
      taxEnabled,
      discountEnabled,
      discountType,
      discountValue,
      notes,
      terms,
      logo,
      signature,
      stamp,
      currency,
      template,
      qrCodeEnabled,
      status: invoiceStatus,
      paidDate,
      paidAmount,
      createdAt: new Date(),
    }

    // Check if invoice already exists in saved invoices
    const existingInvoiceIndex = savedInvoices.findIndex((inv) => inv.id === currentInvoiceId)

    let newSavedInvoices
    if (existingInvoiceIndex >= 0) {
      // Update existing invoice
      newSavedInvoices = [...savedInvoices]
      newSavedInvoices[existingInvoiceIndex] = invoice
    } else {
      // Add new invoice
      newSavedInvoices = [...savedInvoices, invoice]
    }

    // Update state and localStorage
    setSavedInvoices(newSavedInvoices)
    localStorage.setItem("savedInvoices", JSON.stringify(newSavedInvoices))

    // Update storage usage
    setStorageUsage(calculateStorageUsage())

    toast({
      title: t("invoiceSaved"),
      description: `${t("invoiceNumber")} ${invoiceNumber} ${
        existingInvoiceIndex >= 0 ? t("invoiceUpdated") : t("invoiceSaved")
      }`,
    })
  }

  // Duplicate invoice
  const handleDuplicate = () => {
    // Create a new invoice ID
    const newInvoiceId = generateId()

    // Create a new invoice number (increment the last number)
    const invoiceNumberParts = invoiceNumber.split("-")
    const lastPart = invoiceNumberParts[invoiceNumberParts.length - 1]
    const newNumber = Number.parseInt(lastPart) + 1
    const newInvoiceNumber =
      invoiceNumberParts.slice(0, -1).join("-") + "-" + newNumber.toString().padStart(lastPart.length, "0")

    // Set new invoice ID and number
    setCurrentInvoiceId(newInvoiceId)
    setInvoiceNumber(newInvoiceNumber)
    setInvoiceStatus("draft")

    toast({
      title: t("invoiceDuplicated"),
      description: `${t("invoiceNumber")} ${newInvoiceNumber}`,
    })
  }

  // File upload handlers
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (event) => {
        if (event.target?.result) {
          setLogo(event.target.result as string)
        }
      }
      reader.readAsDataURL(file)
    }
  }

  const handleStampUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (event) => {
        if (event.target?.result) {
          setStamp(event.target.result as string)
        }
      }
      reader.readAsDataURL(file)
    }
  }

  // Remove uploaded files
  const removeLogo = () => {
    setLogo(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const removeStamp = () => {
    setStamp(null)
    if (stampInputRef.current) {
      stampInputRef.current.value = ""
    }
  }

  // Load invoice
  const loadInvoice = (invoice: Invoice) => {
    setCurrentInvoiceId(invoice.id)
    setInvoiceNumber(invoice.invoiceNumber)
    setDate(invoice.date)
    setDueDate(invoice.dueDate)
    setPaymentMethod(invoice.paymentMethod)
    setFromName(invoice.fromName)
    setFromEmail(invoice.fromEmail)
    setFromPhone(invoice.fromPhone)
    setFromAddress(invoice.fromAddress)
    setToName(invoice.toName)
    setToEmail(invoice.toEmail)
    setToPhone(invoice.toPhone)
    setToWhatsapp(invoice.toWhatsapp || "")
    setToAddress(invoice.toAddress)
    setItems(invoice.items)
    setTaxEnabled(invoice.taxEnabled)
    setDiscountEnabled(invoice.discountEnabled)
    setDiscountType(invoice.discountType)
    setDiscountValue(invoice.discountValue)
    setNotes(invoice.notes)
    setTerms(invoice.terms)
    setLogo(invoice.logo)
    setSignature(invoice.signature)
    setStamp(invoice.stamp)
    setCurrency(invoice.currency || "IDR")
    setTemplate(invoice.template || "default")
    setQrCodeEnabled(invoice.qrCodeEnabled !== undefined ? invoice.qrCodeEnabled : true)
    setInvoiceStatus(invoice.status || "draft")
    setPaidDate(invoice.paidDate)
    setPaidAmount(invoice.paidAmount || 0)
    setActiveTab("edit")
    setShowSavedInvoices(false)

    toast({
      title: t("invoiceLoaded"),
      description: `${t("invoiceNumber")} ${invoice.invoiceNumber}`,
    })
  }

  // Delete invoice
  const deleteInvoice = (id: string) => {
    const newSavedInvoices = savedInvoices.filter((invoice) => invoice.id !== id)
    setSavedInvoices(newSavedInvoices)
    localStorage.setItem("savedInvoices", JSON.stringify(newSavedInvoices))

    // Update storage usage
    setStorageUsage(calculateStorageUsage())

    toast({
      title: t("invoiceDeleted"),
      description: t("invoiceDeleted"),
    })
  }

  // Export to different formats
  const exportToFormat = (format: string) => {
    switch (format) {
      case "pdf":
        handlePrint() // Use print functionality for PDF
        break
      case "excel":
        // In a real app, this would generate an Excel file
        toast({
          title: "Ekspor ke Excel",
          description: "Faktur berhasil diekspor ke format Excel.",
        })
        break
      case "csv":
        // Generate CSV content
        let csvContent = "data:text/csv;charset=utf-8,"

        // Headers
        csvContent += `${t("description")},${t("quantity")},${t("price")},${t("amount")}\n`

        // Items
        items.forEach((item) => {
          const amount = item.kuantitas * item.harga
          csvContent += `${item.deskripsi},${item.kuantitas},${item.harga},${amount}\n`
        })

        // Summary
        csvContent += `\n${t("subtotal")},,${calculateSubtotal()}\n`
        if (discountEnabled) {
          csvContent += `${t("discount")},,${calculateDiscount()}\n`
        }
        if (taxEnabled) {
          csvContent += `${t("tax")},,${calculateTax()}\n`
        }
        csvContent += `${t("total")},,${calculateTotal()}\n`

        // Create download link
        const encodedUri = encodeURI(csvContent)
        const link = document.createElement("a")
        link.setAttribute("href", encodedUri)
        link.setAttribute("download", `faktur-${invoiceNumber}.csv`)
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)

        toast({
          title: "Ekspor ke CSV",
          description: "Faktur berhasil diekspor ke format Excel.",
        })
        break
      default:
        break
    }
  }

  // Reset form
  const resetForm = () => {
    setCurrentInvoiceId(generateId())
    setInvoiceNumber(generateNextInvoiceNumber(savedInvoices))
    const today = new Date()
    setDate(today)
    setDueDate(addDays(today, 14))
    setPaymentMethod("")
    setFromName("PT Maju Bersama")
    setFromEmail("info@majubersama.com")
    setFromPhone("021-5551234")
    setFromAddress("Jl. Sudirman No. 123, Jakarta Pusat")
    setToName("PT Pelanggan Setia")
    setToEmail("finance@pelanggansetia.com")
    setToPhone("021-5557890")
    setToWhatsapp("6281234567890")
    setToAddress("Jl. Gatot Subroto No. 456, Jakarta Selatan")
    setItems([{ deskripsi: "Jasa Konsultasi", kuantitas: 1, harga: 1000000 }])
    setTaxEnabled(true)
    setDiscountEnabled(false)
    setDiscountType("percentage")
    setDiscountValue(0)
    setNotes("Terima kasih atas kerjasamanya.")
    setTerms("Pembayaran harus dilakukan dalam 14 hari.")
    setLogo(null)
    setSignature(null)
    setStamp(null)
    setCurrency("IDR")
    setTemplate("default")
    setQrCodeEnabled(true)
    setInvoiceStatus("draft")
    setPaidDate(undefined)
    setPaidAmount(0)

    toast({
      title: t("newInvoiceCreated"),
      description: t("formReset"),
    })
  }

  // Signature drawing functions
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    setIsDrawing(true)
    const canvas = signatureCanvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    let clientX, clientY
    if ("touches" in e) {
      // Touch event
      clientX = e.touches[0].clientX
      clientY = e.touches[0].clientY
    } else {
      // Mouse event
      clientX = e.clientX
      clientY = e.clientY
    }

    const rect = canvas.getBoundingClientRect()
    ctx.beginPath()
    ctx.moveTo(clientX - rect.left, clientY - rect.top)
    ctx.strokeStyle = "#000"
    ctx.lineWidth = 2
  }

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return
    const canvas = signatureCanvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    let clientX, clientY
    if ("touches" in e) {
      // Touch event
      clientX = e.touches[0].clientX
      clientY = e.touches[0].clientY
      e.preventDefault() // Prevent scrolling when drawing
    } else {
      // Mouse event
      clientX = e.clientX
      clientY = e.clientY
    }

    const rect = canvas.getBoundingClientRect()
    ctx.lineTo(clientX - rect.left, clientY - rect.top)
    ctx.stroke()
  }

  const endDrawing = () => {
    setIsDrawing(false)
    const canvas = signatureCanvasRef.current
    if (!canvas) return

    // Save the signature as data URL
    setSignature(canvas.toDataURL())
  }

  const clearSignature = () => {
    const canvas = signatureCanvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    ctx.clearRect(0, 0, canvas.width, canvas.height)
    setSignature(null)
  }

  const saveSignature = () => {
    if (signature) {
      setShowSignatureDialog(false)
      toast({
        title: t("signatureSaved"),
        description: t("signatureAdded"),
      })
    } else {
      toast({
        title: t("emptySignature"),
        description: t("createSignatureFirst"),
        variant: "destructive",
      })
    }
  }

  // Email handling
  const handleSendEmail = () => {
    // In a real app, this would send an actual email
    // Here we just simulate the process
    if (!emailRecipient) {
      toast({
        title: t("emailRequired"),
        description: t("enterRecipientEmail"),
        variant: "destructive",
      })
      return
    }

    // Simulate sending email
    setTimeout(() => {
      toast({
        title: t("invoiceSent"),
        description: `${t("invoiceNumber")} ${invoiceNumber} ${t("invoiceSent")} ${emailRecipient}.`,
      })
      setShowEmailDialog(false)
      setEmailRecipient("")
      setEmailSubject("")
      setEmailMessage("")

      // Update invoice status to sent if it's still draft
      if (invoiceStatus === "draft") {
        setInvoiceStatus("sent")
      }
    }, 1500)
  }

  // WhatsApp integration
  const handleSendWhatsApp = () => {
    if (!toWhatsapp) {
      toast({
        title: t("whatsappRequired"),
        description: t("enterWhatsappNumber"),
        variant: "destructive",
      })
      return
    }

    // Format WhatsApp number (remove any non-digit characters)
    const formattedNumber = toWhatsapp.replace(/\D/g, "")

    // Create message text
    const messageText =
      `${t("invoiceNumber")} ${invoiceNumber} ${t("from")} ${fromName}\n\n` +
      `${t("total")}: ${formatCurrency(calculateTotal())}\n` +
      `${t("date")}: ${date ? format(date, "dd MMMM yyyy", { locale: language === "id" ? id : enUS }) : "-"}\n` +
      `${t("dueDate")}: ${dueDate ? format(dueDate, "dd MMMM yyyy", { locale: language === "id" ? id : enUS }) : "-"}\n\n` +
      `${notes}`

    // Create WhatsApp URL
    const whatsappUrl = `https://wa.me/${formattedNumber}?text=${encodeURIComponent(messageText)}`

    // Open WhatsApp in new tab
    window.open(whatsappUrl, "_blank")

    // Update invoice status to sent if it's still draft
    if (invoiceStatus === "draft") {
      setInvoiceStatus("sent")
    }
  }

  // Local storage management
  const exportAllInvoices = () => {
    if (savedInvoices.length === 0) {
      toast({
        title: t("noInvoicesToExport"),
        description: t("noInvoicesToExportDesc"),
        variant: "destructive",
      })
      return
    }

    // Create a JSON file with all invoices
    const dataStr = JSON.stringify(savedInvoices, null, 2)
    const dataUri = "data:application/json;charset=utf-8," + encodeURIComponent(dataStr)

    // Create download link
    const exportFileName = `faktur-export-${format(new Date(), "yyyy-MM-dd")}.json`
    const linkElement = document.createElement("a")
    linkElement.setAttribute("href", dataUri)
    linkElement.setAttribute("download", exportFileName)
    linkElement.click()

    toast({
      title: t("exportSuccess"),
      description: `${savedInvoices.length} ${t("invoicesExported")}`,
    })
  }

  const importInvoices = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      try {
        const importedData = JSON.parse(event.target?.result as string)

        if (!Array.isArray(importedData)) {
          throw new Error("Format file tidak valid")
        }

        // Process imported invoices
        const processedData = importedData.map((invoice: any) => ({
          ...invoice,
          date: invoice.date ? new Date(invoice.date) : undefined,
          dueDate: invoice.dueDate ? new Date(invoice.dueDate) : undefined,
          paidDate: invoice.paidDate ? new Date(invoice.paidDate) : undefined,
          createdAt: new Date(invoice.createdAt || new Date()),
          id: invoice.id || generateId(), // Ensure each invoice has an ID
          status: invoice.status || "draft",
        }))

        // Merge with existing invoices (avoid duplicates by ID)
        const existingIds = new Set(savedInvoices.map((inv) => inv.id))
        const newInvoices = processedData.filter((inv: Invoice) => !existingIds.has(inv.id))
        const mergedInvoices = [...savedInvoices, ...newInvoices]

        // Update state and localStorage
        setSavedInvoices(mergedInvoices)
        localStorage.setItem("savedInvoices", JSON.stringify(mergedInvoices))

        // Update storage usage
        setStorageUsage(calculateStorageUsage())

        toast({
          title: t("importSuccess"),
          description: `${newInvoices.length} ${t("newInvoicesImported")}`,
        })

        // Reset file input
        if (fileImportRef.current) {
          fileImportRef.current.value = ""
        }
      } catch (error) {
        toast({
          title: t("importFailed"),
          description: t("invalidFileFormat"),
          variant: "destructive",
        })
      }
    }
    reader.readAsText(file)
  }

  const clearAllInvoices = () => {
    if (confirm("Apakah Anda yakin ingin menghapus semua faktur tersimpan? Tindakan ini tidak dapat dibatalkan.")) {
      setSavedInvoices([])
      localStorage.removeItem("savedInvoices")

      // Update storage usage
      setStorageUsage(calculateStorageUsage())

      toast({
        title: t("storageCleared"),
        description: t("allInvoicesDeleted"),
      })
    }
  }

  // Recurring invoice functions
  const handleCreateRecurring = () => {
    if (!recurringName.trim()) {
      toast({
        title: t("nameRequired"),
        description: t("enterTemplateName"),
        variant: "destructive",
      })
      return
    }

    if (!recurringStartDate) {
      toast({
        title: t("startDateRequired"),
        description: t("selectStartDate"),
        variant: "destructive",
      })
      return
    }

    if (recurringEndDate && isBefore(recurringEndDate, recurringStartDate)) {
      toast({
        title: t("invalidEndDate"),
        description: t("endDateAfterStart"),
        variant: "destructive",
      })
      return
    }

    // Calculate days between invoices based on frequency
    let daysBetweenInvoices = 30 // Default to monthly
    switch (recurringFrequency) {
      case "weekly":
        daysBetweenInvoices = 7
        break
      case "monthly":
        daysBetweenInvoices = 30
        break
      case "quarterly":
        daysBetweenInvoices = 90
        break
      case "yearly":
        daysBetweenInvoices = 365
        break
    }

    // Create invoice template
    const invoiceTemplate: Invoice = {
      id: generateId(),
      invoiceNumber: "TEMPLATE",
      date,
      dueDate,
      paymentMethod,
      fromName,
      fromEmail,
      fromPhone,
      fromAddress,
      toName,
      toEmail,
      toPhone,
      toWhatsapp,
      toAddress,
      items: [...items],
      taxEnabled,
      discountEnabled,
      discountType,
      discountValue,
      notes,
      terms,
      logo,
      signature,
      stamp,
      currency,
      template,
      qrCodeEnabled,
      status: "draft",
      createdAt: new Date(),
    }

    // Create recurring invoice
    const recurringInvoice: RecurringInvoice = {
      id: editingRecurringId || generateId(),
      name: recurringName,
      frequency: recurringFrequency,
      startDate: recurringStartDate,
      endDate: recurringEndDate,
      daysBetweenInvoices,
      active: true,
      template: invoiceTemplate,
      nextDue: recurringStartDate,
    }

    // Update recurring invoices
    let updatedRecurring: RecurringInvoice[]
    if (editingRecurringId) {
      updatedRecurring = recurringInvoices.map((r) => (r.id === editingRecurringId ? recurringInvoice : r))
    } else {
      updatedRecurring = [...recurringInvoices, recurringInvoice]
    }

    setRecurringInvoices(updatedRecurring)
    localStorage.setItem("recurringInvoices", JSON.stringify(updatedRecurring))

    // Reset form
    setRecurringName("")
    setRecurringFrequency("monthly")
    setRecurringStartDate(undefined)
    setRecurringEndDate(undefined)
    setEditingRecurringId(null)
    setShowCreateRecurringDialog(false)

    toast({
      title: editingRecurringId ? t("recurringUpdated") : t("recurringCreated"),
      description: editingRecurringId ? t("recurringUpdatedDesc") : t("recurringCreatedDesc"),
    })
  }

  const editRecurringInvoice = (recurring: RecurringInvoice) => {
    setEditingRecurringId(recurring.id)
    setRecurringName(recurring.name)
    setRecurringFrequency(recurring.frequency)
    setRecurringStartDate(recurring.startDate)
    setRecurringEndDate(recurring.endDate)
    setShowCreateRecurringDialog(true)
  }

  const deleteRecurringInvoice = (id: string) => {
    const updatedRecurring = recurringInvoices.filter((r) => r.id !== id)
    setRecurringInvoices(updatedRecurring)
    localStorage.setItem("recurringInvoices", JSON.stringify(updatedRecurring))

    toast({
      title: t("recurringDeleted"),
      description: t("recurringDeletedDesc"),
    })
  }

  const toggleRecurringActive = (id: string, active: boolean) => {
    const updatedRecurring = recurringInvoices.map((r) => (r.id === id ? { ...r, active } : r))
    setRecurringInvoices(updatedRecurring)
    localStorage.setItem("recurringInvoices", JSON.stringify(updatedRecurring))

    toast({
      title: active ? t("recurringActivated") : t("recurringDeactivated"),
      description: active ? t("recurringActivatedDesc") : t("recurringDeactivatedDesc"),
    })
  }

  const generateInvoiceFromRecurring = (recurring: RecurringInvoice) => {
    // Create new invoice from template
    const newInvoice: Invoice = {
      ...recurring.template,
      id: generateId(),
      invoiceNumber: generateNextInvoiceNumber(savedInvoices),
      date: new Date(),
      dueDate: addDays(new Date(), 14),
      status: "draft",
      createdAt: new Date(),
    }

    // Add to saved invoices
    const updatedInvoices = [...savedInvoices, newInvoice]
    setSavedInvoices(updatedInvoices)
    localStorage.setItem("savedInvoices", JSON.stringify(updatedInvoices))

    // Update recurring invoice
    const updatedRecurring = recurringInvoices.map((r) =>
      r.id === recurring.id
        ? {
            ...r,
            lastGenerated: new Date(),
            nextDue: addDays(new Date(), r.daysBetweenInvoices),
          }
        : r,
    )
    setRecurringInvoices(updatedRecurring)
    localStorage.setItem("recurringInvoices", JSON.stringify(updatedRecurring))

    toast({
      title: t("invoiceGenerated"),
      description: t("invoiceGeneratedDesc"),
    })

    // Load the new invoice
    loadInvoice(newInvoice)
  }

  // Update invoice status
  const updateInvoiceStatus = () => {
    // Update current invoice status
    setShowStatusDialog(false)

    // If marking as paid, set paid date and amount if not already set
    if (invoiceStatus === "paid" && !paidDate) {
      setPaidDate(new Date())
    }

    if (invoiceStatus === "paid" && !paidAmount) {
      setPaidAmount(calculateTotal())
    }

    // Save changes if invoice exists in saved invoices
    const existingInvoiceIndex = savedInvoices.findIndex((inv) => inv.id === currentInvoiceId)
    if (existingInvoiceIndex >= 0) {
      const updatedInvoices = [...savedInvoices]
      updatedInvoices[existingInvoiceIndex] = {
        ...updatedInvoices[existingInvoiceIndex],
        status: invoiceStatus,
        paidDate: invoiceStatus === "paid" ? paidDate || new Date() : paidDate,
        paidAmount: invoiceStatus === "paid" ? paidAmount || calculateTotal() : paidAmount,
      }
      setSavedInvoices(updatedInvoices)
      localStorage.setItem("savedInvoices", JSON.stringify(updatedInvoices))
    }

    toast({
      title: t("statusUpdated"),
      description: `${t("invoiceStatus")}: ${t(invoiceStatus)}`,
    })
  }

  // Report functions
  const getReportData = () => {
    // Apply date filters
    let filteredInvoices = [...savedInvoices]

    if (reportPeriod !== "allTime" || (reportDateRange.startDate && reportDateRange.endDate)) {
      let startDate: Date | undefined
      let endDate: Date | undefined

      if (reportDateRange.startDate && reportDateRange.endDate) {
        startDate = reportDateRange.startDate
        endDate = reportDateRange.endDate
      } else {
        const today = new Date()
        const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)
        const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0)

        switch (reportPeriod) {
          case "thisMonth":
            startDate = firstDayOfMonth
            endDate = lastDayOfMonth
            break
          case "lastMonth":
            startDate = new Date(today.getFullYear(), today.getMonth() - 1, 1)
            endDate = new Date(today.getFullYear(), today.getMonth(), 0)
            break
          case "thisQuarter":
            const quarter = Math.floor(today.getMonth() / 3)
            startDate = new Date(today.getFullYear(), quarter * 3, 1)
            endDate = new Date(today.getFullYear(), (quarter + 1) * 3, 0)
            break
          case "thisYear":
            startDate = new Date(today.getFullYear(), 0, 1)
            endDate = new Date(today.getFullYear(), 11, 31)
            break
        }
      }

      if (startDate && endDate) {
        filteredInvoices = filteredInvoices.filter((invoice) => {
          const invoiceDate = invoice.date ? new Date(invoice.date) : null
          return invoiceDate && isAfter(invoiceDate, startDate!) && isBefore(invoiceDate, endDate!)
        })
      }
    }

    // Calculate summary data
    const totalRevenue = filteredInvoices
      .filter((invoice) => invoice.status === "paid")
      .reduce((sum, invoice) => sum + (invoice.paidAmount || 0), 0)

    const outstandingAmount = filteredInvoices
      .filter((invoice) => invoice.status !== "paid")
      .reduce((sum, invoice) => {
        // Calculate total for this invoice
        const items = invoice.items || []
        const subtotal = items.reduce((total, item) => total + item.kuantitas * item.harga, 0)
        const discount = invoice.discountEnabled
          ? invoice.discountType === "percentage"
            ? subtotal * (invoice.discountValue / 100)
            : invoice.discountValue
          : 0
        const tax = invoice.taxEnabled ? (subtotal - discount) * 0.11 : 0
        return sum + (subtotal - discount + tax)
      }, 0)

    const paidInvoices = filteredInvoices.filter((invoice) => invoice.status === "paid").length
    const unpaidInvoices = filteredInvoices.filter((invoice) => invoice.status !== "paid").length
    const overdueInvoices = filteredInvoices.filter((invoice) => {
      if (invoice.status !== "paid" && invoice.dueDate) {
        return isBefore(new Date(invoice.dueDate), new Date())
      }
      return false
    }).length

    // Revenue by month
    const revenueByMonth: { label: string; value: number }[] = []
    const monthsMap: Record<string, number> = {}

    filteredInvoices
      .filter((invoice) => invoice.status === "paid" && invoice.paidDate)
      .forEach((invoice) => {
        if (invoice.paidDate) {
          const monthYear = format(new Date(invoice.paidDate), "MMM yyyy")
          if (!monthsMap[monthYear]) {
            monthsMap[monthYear] = 0
          }
          monthsMap[monthYear] += invoice.paidAmount || 0
        }
      })

    // Convert to array and sort by date
    Object.entries(monthsMap).forEach(([month, amount]) => {
      revenueByMonth.push({ label: month, value: amount })
    })

    // Sort by date
    revenueByMonth.sort((a, b) => {
      const dateA = new Date(a.label)
      const dateB = new Date(b.label)
      return dateA.getTime() - dateB.getTime()
    })

    // Top customers
    const customerMap: Record<string, number> = {}
    filteredInvoices.forEach((invoice) => {
      if (!customerMap[invoice.toName]) {
        customerMap[invoice.toName] = 0
      }

      if (invoice.status === "paid") {
        customerMap[invoice.toName] += invoice.paidAmount || 0
      }
    })

    const topCustomers = Object.entries(customerMap)
      .map(([name, amount]) => ({ label: name, value: amount }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5)

    return {
      totalRevenue,
      outstandingAmount,
      paidInvoices,
      unpaidInvoices,
      overdueInvoices,
      revenueByMonth,
      topCustomers,
    }
  }

  // Apply report date filter
  const applyReportDateFilter = () => {
    setReportPeriod("allTime")
    // The actual filtering is done in getReportData()
  }

  // Reset report date filter
  const resetReportDateFilter = () => {
    setReportDateRange({
      startDate: undefined,
      endDate: undefined,
    })
    setReportPeriod("thisMonth")
  }

  // Get current template
  const currentTemplate = invoiceTemplates.find((t) => t.id === template) || invoiceTemplates[0]

  // Get report data
  const reportData = getReportData()

  return (
    <div className="container mx-auto max-w-5xl">
      <style jsx global>{`
        @media print {
          .no-print {
            display: none !important;
          }
          .print-only {
            display: block !important;
          }
          body {
            background: white !important;
          }
          .print-container {
            padding: 0 !important;
            margin: 0 !important;
          }
        }
        .print-only {
          display: none;
        }
        .${currentTemplate.fontFamily} {
          font-family: ${
            currentTemplate.fontFamily === "font-serif"
              ? "Georgia, serif"
              : currentTemplate.fontFamily === "font-mono"
                ? "monospace"
                : "system-ui, sans-serif"
          };
        }
      `}</style>

      <div className="flex justify-between items-center mb-6 no-print">
        <h1 className="text-2xl font-bold">{t("appTitle")}</h1>
        <div className="flex items-center gap-2">
          <Select value={language} onValueChange={(value) => setLanguage(value as Language)}>
            <SelectTrigger className="w-[120px]">
              <SelectValue>
                <div className="flex items-center">
                  <Globe className="h-4 w-4 mr-2" />
                  {language === "id" ? "Indonesia" : "English"}
                </div>
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="id">Indonesia</SelectItem>
              <SelectItem value="en">English</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex justify-between items-center mb-6 no-print">
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => resetForm()}>
            {t("newInvoice")}
          </Button>
          <Dialog open={showSavedInvoices} onOpenChange={setShowSavedInvoices}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <List className="h-4 w-4 mr-2" />
                {t("invoiceList")}
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl">
              <DialogHeader>
                <DialogTitle>{t("savedInvoices")}</DialogTitle>
              </DialogHeader>
              <div className="mb-4">
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder={t("searchInvoices")}
                    className="pl-8"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>
              {filteredInvoices.length > 0 ? (
                <div className="max-h-[60vh] overflow-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>{t("invoiceNumber")}</TableHead>
                        <TableHead>{t("date")}</TableHead>
                        <TableHead>{t("customer")}</TableHead>
                        <TableHead>{t("status")}</TableHead>
                        <TableHead>{t("total")}</TableHead>
                        <TableHead className="text-right">{t("actions")}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredInvoices.map((invoice) => (
                        <TableRow key={invoice.id}>
                          <TableCell>{invoice.invoiceNumber}</TableCell>
                          <TableCell>
                            {invoice.date
                              ? format(new Date(invoice.date), "dd MMM yyyy", {
                                  locale: language === "id" ? id : enUS,
                                })
                              : "-"}
                          </TableCell>
                          <TableCell>{invoice.toName}</TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                invoice.status === "paid"
                                  ? "success"
                                  : invoice.status === "overdue"
                                    ? "destructive"
                                    : invoice.status === "sent"
                                      ? "outline"
                                      : "secondary"
                              }
                            >
                              {t(invoice.status)}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {invoice.currency
                              ? new Intl.NumberFormat(invoice.currency === "IDR" ? "id-ID" : "en-US", {
                                  style: "currency",
                                  currency: invoice.currency,
                                  minimumFractionDigits: invoice.currency === "IDR" ? 0 : 2,
                                  maximumFractionDigits: invoice.currency === "IDR" ? 0 : 2,
                                }).format(
                                  invoice.items.reduce((total, item) => total + item.kuantitas * item.harga, 0) -
                                    (invoice.discountEnabled
                                      ? invoice.discountType === "percentage"
                                        ? invoice.items.reduce(
                                            (total, item) => total + item.kuantitas * item.harga,
                                            0,
                                          ) *
                                          (invoice.discountValue / 100)
                                        : invoice.discountValue
                                      : 0) +
                                    (invoice.taxEnabled
                                      ? (invoice.items.reduce((total, item) => total + item.kuantitas * item.harga, 0) -
                                          (invoice.discountEnabled
                                            ? invoice.discountType === "percentage"
                                              ? invoice.items.reduce(
                                                  (total, item) => total + item.kuantitas * item.harga,
                                                  0,
                                                ) *
                                                (invoice.discountValue / 100)
                                              : invoice.discountValue
                                            : 0)) *
                                        0.11
                                      : 0),
                                )
                              : formatCurrency(
                                  invoice.items.reduce((total, item) => total + item.kuantitas * item.harga, 0) -
                                    (invoice.discountEnabled
                                      ? invoice.discountType === "percentage"
                                        ? invoice.items.reduce(
                                            (total, item) => total + item.kuantitas * item.harga,
                                            0,
                                          ) *
                                          (invoice.discountValue / 100)
                                        : invoice.discountValue
                                      : 0) +
                                    (invoice.taxEnabled
                                      ? (invoice.items.reduce((total, item) => total + item.kuantitas * item.harga, 0) -
                                          (invoice.discountEnabled
                                            ? invoice.discountType === "percentage"
                                              ? invoice.items.reduce(
                                                  (total, item) => total + item.kuantitas * item.harga,
                                                  0,
                                                ) *
                                                (invoice.discountValue / 100)
                                              : invoice.discountValue
                                            : 0)) *
                                        0.11
                                      : 0),
                                )}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button variant="ghost" size="sm" onClick={() => loadInvoice(invoice)}>
                                {t("load")}
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-red-500 hover:text-red-700"
                                onClick={() => deleteInvoice(invoice.id)}
                              >
                                {t("delete")}
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  {searchQuery ? t("noInvoicesFound") : t("noInvoicesSaved")}
                </div>
              )}
            </DialogContent>
          </Dialog>
          <Dialog open={showStorageDialog} onOpenChange={setShowStorageDialog}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <HardDrive className="h-4 w-4 mr-2" />
                {t("storage")}
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{t("storageManagement")}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>
                      {t("usage")}: {storageUsage.used.toFixed(2)} KB {t("of")} {storageUsage.total.toFixed(2)} KB
                    </span>
                    <span>{storageUsage.percentage.toFixed(1)}%</span>
                  </div>
                  <Progress value={storageUsage.percentage} className="h-2" />
                </div>

                {storageUsage.percentage > 80 && (
                  <Alert variant="warning" className="bg-amber-50">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>{t("storageAlmostFull")}</AlertTitle>
                    <AlertDescription>{t("storageWarning")}</AlertDescription>
                  </Alert>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-sm font-medium mb-2">{t("exportData")}</h3>
                    <Button variant="outline" className="w-full" onClick={exportAllInvoices}>
                      <ArrowDownToLine className="h-4 w-4 mr-2" />
                      {t("exportAllInvoices")}
                    </Button>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium mb-2">{t("importData")}</h3>
                    <input
                      type="file"
                      accept=".json"
                      onChange={importInvoices}
                      className="hidden"
                      ref={fileImportRef}
                    />
                    <Button variant="outline" className="w-full" onClick={() => fileImportRef.current?.click()}>
                      <ArrowUpFromLine className="h-4 w-4 mr-2" />
                      {t("importInvoices")}
                    </Button>
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <h3 className="text-sm font-medium mb-2 text-red-500">{t("dangerZone")}</h3>
                  <Button variant="destructive" className="w-full" onClick={clearAllInvoices}>
                    <Trash2 className="h-4 w-4 mr-2" />
                    {t("deleteAllInvoices")}
                  </Button>
                  <p className="text-xs text-gray-500 mt-2">{t("deleteWarning")}</p>
                </div>
              </div>
            </DialogContent>
          </Dialog>
          <Dialog open={showRecurringDialog} onOpenChange={setShowRecurringDialog}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <RepeatIcon className="h-4 w-4 mr-2" />
                {t("recurringInvoices")}
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl">
              <DialogHeader>
                <DialogTitle>{t("recurringInvoices")}</DialogTitle>
              </DialogHeader>
              <div className="mb-4">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowRecurringDialog(false)
                    setShowCreateRecurringDialog(true)
                  }}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  {t("createRecurring")}
                </Button>
              </div>
              {recurringInvoices.length > 0 ? (
                <div className="max-h-[60vh] overflow-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>{t("recurringName")}</TableHead>
                        <TableHead>{t("frequency")}</TableHead>
                        <TableHead>{t("nextDue")}</TableHead>
                        <TableHead>{t("status")}</TableHead>
                        <TableHead className="text-right">{t("actions")}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {recurringInvoices.map((recurring) => (
                        <TableRow key={recurring.id}>
                          <TableCell>{recurring.name}</TableCell>
                          <TableCell>{t(recurring.frequency)}</TableCell>
                          <TableCell>
                            {recurring.nextDue
                              ? format(new Date(recurring.nextDue), "dd MMM yyyy", {
                                  locale: language === "id" ? id : enUS,
                                })
                              : "-"}
                          </TableCell>
                          <TableCell>
                            <Badge variant={recurring.active ? "success" : "secondary"}>
                              {recurring.active ? t("active") : t("inactive")}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => toggleRecurringActive(recurring.id, !recurring.active)}
                              >
                                {recurring.active ? t("deactivate") : t("activate")}
                              </Button>
                              <Button variant="ghost" size="sm" onClick={() => editRecurringInvoice(recurring)}>
                                {t("edit")}
                              </Button>
                              <Button variant="ghost" size="sm" onClick={() => generateInvoiceFromRecurring(recurring)}>
                                {t("generateNow")}
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-red-500 hover:text-red-700"
                                onClick={() => deleteRecurringInvoice(recurring.id)}
                              >
                                {t("delete")}
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">{t("noRecurringInvoices")}</div>
              )}
            </DialogContent>
          </Dialog>
          <Dialog open={showReportsDialog} onOpenChange={setShowReportsDialog}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <BarChart3 className="h-4 w-4 mr-2" />
                {t("reports")}
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl">
              <DialogHeader>
                <DialogTitle>{t("financialReports")}</DialogTitle>
              </DialogHeader>
              <div className="space-y-6 py-4">
                <Collapsible>
                  <div className="flex items-center justify-between p-2">
                    <h3 className="text-lg font-semibold">{t("filterByDate")}</h3>
                    <CollapsibleTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <ChevronDown className="h-4 w-4" />
                      </Button>
                    </CollapsibleTrigger>
                  </div>
                  <CollapsibleContent className="pl-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="start-date">{t("startDate")}</Label>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant={"outline"}
                              className={cn(
                                "w-full justify-start text-left font-normal",
                                !reportDateRange.startDate && "text-muted-foreground",
                              )}
                            >
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {reportDateRange.startDate
                                ? format(reportDateRange.startDate, "PPP", { locale: language === "id" ? id : enUS })
                                : t("selectDate")}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0">
                            <CalendarComponent
                              mode="single"
                              selected={reportDateRange.startDate}
                              onSelect={(date) => setReportDateRange({ ...reportDateRange, startDate: date })}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="end-date">{t("endDate")}</Label>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant={"outline"}
                              className={cn(
                                "w-full justify-start text-left font-normal",
                                !reportDateRange.endDate && "text-muted-foreground",
                              )}
                            >
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {reportDateRange.endDate
                                ? format(reportDateRange.endDate, "PPP", { locale: language === "id" ? id : enUS })
                                : t("selectDate")}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0">
                            <CalendarComponent
                              mode="single"
                              selected={reportDateRange.endDate}
                              onSelect={(date) => setReportDateRange({ ...reportDateRange, endDate: date })}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                      </div>
                    </div>
                    <div className="flex justify-end gap-2 mt-4">
                      <Button variant="outline" size="sm" onClick={resetReportDateFilter}>
                        {t("reset")}
                      </Button>
                      <Button size="sm" onClick={applyReportDateFilter}>
                        {t("apply")}
                      </Button>
                    </div>
                  </CollapsibleContent>
                </Collapsible>
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">{t("summary")}</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <Card>
                      <CardContent className="flex flex-col gap-2">
                        <div className="text-sm text-muted-foreground">{t("totalRevenue")}</div>
                        <div className="text-2xl font-bold">{formatCurrency(reportData.totalRevenue)}</div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="flex flex-col gap-2">
                        <div className="text-sm text-muted-foreground">{t("outstandingAmount")}</div>
                        <div className="text-2xl font-bold">{formatCurrency(reportData.outstandingAmount)}</div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="flex flex-col gap-2">
                        <div className="text-sm text-muted-foreground">{t("paidInvoices")}</div>
                        <div className="text-2xl font-bold">{reportData.paidInvoices}</div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="flex flex-col gap-2">
                        <div className="text-sm text-muted-foreground">{t("unpaidInvoices")}</div>
                        <div className="text-2xl font-bold">{reportData.unpaidInvoices}</div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="flex flex-col gap-2">
                        <div className="text-sm text-muted-foreground">{t("overdueInvoices")}</div>
                        <div className="text-2xl font-bold">{reportData.overdueInvoices}</div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">{t("revenueByMonth")}</h3>
                  <BarChart data={reportData.revenueByMonth} />
                </div>
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">{t("topCustomers")}</h3>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>{t("customer")}</TableHead>
                        <TableHead className="text-right">{t("total")}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {reportData.topCustomers.map((customer) => (
                        <TableRow key={customer.label}>
                          <TableCell>{customer.label}</TableCell>
                          <TableCell className="text-right">{formatCurrency(customer.value)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-6 no-print">
          <TabsTrigger value="edit">{t("edit")}</TabsTrigger>
          <TabsTrigger value="preview">{t("preview")}</TabsTrigger>
        </TabsList>

        <TabsContent value="edit" className="no-print">
          <div className="grid gap-6">
            <Card>
              <CardContent className="pt-6">
                <h2 className="text-lg font-semibold mb-4">{t("basicInfo")}</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="invoiceNumber">{t("invoiceNumber")}</Label>
                    <Input
                      id="invoiceNumber"
                      placeholder="INV-001"
                      value={invoiceNumber}
                      onChange={(e) => setInvoiceNumber(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>{t("invoiceDate")}</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant={"outline"}
                          className={cn("w-full justify-start text-left font-normal", !date && "text-muted-foreground")}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {date ? (
                            format(date, "PPP", { locale: language === "id" ? id : enUS })
                          ) : (
                            <span>{t("selectDate")}</span>
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <CalendarComponent mode="single" selected={date} onSelect={setDate} initialFocus />
                      </PopoverContent>
                    </Popover>
                  </div>

                  <div className="space-y-2">
                    <Label>{t("dueDate")}</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !dueDate && "text-muted-foreground",
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {dueDate ? (
                            format(dueDate, "PPP", { locale: language === "id" ? id : enUS })
                          ) : (
                            <span>{t("selectDate")}</span>
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <CalendarComponent mode="single" selected={dueDate} onSelect={setDueDate} initialFocus />
                      </PopoverContent>
                    </Popover>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="paymentMethod">{t("paymentMethod")}</Label>
                    <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                      <SelectTrigger>
                        <SelectValue placeholder={t("paymentMethod")} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="transfer">{t("bankTransfer")}</SelectItem>
                        <SelectItem value="cash">{t("cash")}</SelectItem>
                        <SelectItem value="ewallet">{t("eWallet")}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="invoiceStatus">{t("invoiceStatus")}</Label>
                    <Button variant="outline" onClick={() => setShowStatusDialog(true)}>
                      {t(invoiceStatus)}
                    </Button>
                    <Dialog open={showStatusDialog} onOpenChange={setShowStatusDialog}>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>{t("updateStatus")}</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                          <div className="space-y-2">
                            <Label htmlFor="status">{t("status")}</Label>
                            <Select value={invoiceStatus} onValueChange={setInvoiceStatus}>
                              <SelectTrigger>
                                <SelectValue placeholder={t("status")} />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="draft">{t("draft")}</SelectItem>
                                <SelectItem value="sent">{t("sent")}</SelectItem>
                                <SelectItem value="paid">{t("paid")}</SelectItem>
                                <SelectItem value="overdue">{t("overdue")}</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          {invoiceStatus === "paid" && (
                            <>
                              <div className="space-y-2">
                                <Label>{t("paidDate")}</Label>
                                <Popover>
                                  <PopoverTrigger asChild>
                                    <Button
                                      variant={"outline"}
                                      className={cn(
                                        "w-full justify-start text-left font-normal",
                                        !paidDate && "text-muted-foreground",
                                      )}
                                    >
                                      <CalendarIcon className="mr-2 h-4 w-4" />
                                      {paidDate ? (
                                        format(paidDate, "PPP", { locale: language === "id" ? id : enUS })
                                      ) : (
                                        <span>{t("selectDate")}</span>
                                      )}
                                    </Button>
                                  </PopoverTrigger>
                                  <PopoverContent className="w-auto p-0">
                                    <CalendarComponent
                                      mode="single"
                                      selected={paidDate}
                                      onSelect={setPaidDate}
                                      initialFocus
                                    />
                                  </PopoverContent>
                                </Popover>
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="paidAmount">{t("paidAmount")}</Label>
                                <Input
                                  id="paidAmount"
                                  type="number"
                                  placeholder="0"
                                  value={paidAmount}
                                  onChange={(e) => setPaidAmount(Number.parseInt(e.target.value) || 0)}
                                />
                              </div>
                            </>
                          )}
                        </div>
                        <DialogFooter>
                          <Button variant="outline" onClick={() => setShowStatusDialog(false)}>
                            {t("cancel")}
                          </Button>
                          <Button onClick={updateInvoiceStatus}>{t("save")}</Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <h2 className="text-lg font-semibold mb-4">{t("invoiceSettings")}</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="currency">{t("currency")}</Label>
                      <Select value={currency} onValueChange={setCurrency}>
                        <SelectTrigger>
                          <SelectValue placeholder={t("currency")} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="IDR">Rupiah Indonesia (IDR)</SelectItem>
                          <SelectItem value="USD">Dollar Amerika (USD)</SelectItem>
                          <SelectItem value="SAR">Riyal Saudi (SAR)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch id="qrcode-toggle" checked={qrCodeEnabled} onCheckedChange={setQrCodeEnabled} />
                      <Label htmlFor="qrcode-toggle">{t("showQrCode")}</Label>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="template">{t("template")}</Label>
                      <Select value={template} onValueChange={setTemplate}>
                        <SelectTrigger>
                          <SelectValue placeholder={t("template")} />
                        </SelectTrigger>
                        <SelectContent>
                          {invoiceTemplates.map((template) => (
                            <SelectItem key={template.id} value={template.id}>
                              {template.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardContent className="pt-6">
                  <h2 className="text-lg font-semibold mb-4">{t("companyLogo")}</h2>
                  <div className="flex items-center gap-4">
                    <div className="w-32 h-32 border rounded-md flex items-center justify-center overflow-hidden">
                      {logo ? (
                        <div className="relative w-full h-full">
                          <img
                            src={logo || "/placeholder.svg"}
                            alt={t("companyLogo")}
                            className="object-contain w-full h-full p-2"
                          />
                          <Button
                            variant="ghost"
                            size="icon"
                            className="absolute top-0 right-0 bg-white/80 rounded-full p-1"
                            onClick={removeLogo}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ) : (
                        <ImageIcon className="h-10 w-10 text-gray-300" />
                      )}
                    </div>
                    <div>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleLogoUpload}
                        className="hidden"
                        ref={fileInputRef}
                      />
                      <Button variant="outline" onClick={() => fileInputRef.current?.click()} className="mb-2">
                        <ImageIcon className="h-4 w-4 mr-2" />
                        {t("uploadLogo")}
                      </Button>
                      <p className="text-sm text-gray-500">Format yang didukung: JPG, PNG, GIF. Ukuran maksimal 2MB.</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <h2 className="text-lg font-semibold mb-4">{t("signatureStamp")}</h2>
                  <div className="space-y-4">
                    <div className="flex items-center gap-4">
                      <div className="w-32 h-32 border rounded-md flex items-center justify-center overflow-hidden">
                        {signature ? (
                          <div className="relative w-full h-full">
                            <img
                              src={signature || "/placeholder.svg"}
                              alt={t("digitalSignature")}
                              className="object-contain w-full h-full p-2"
                            />
                            <Button
                              variant="ghost"
                              size="icon"
                              className="absolute top-0 right-0 bg-white/80 rounded-full p-1"
                              onClick={() => setSignature(null)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ) : (
                          <Pencil className="h-10 w-10 text-gray-300" />
                        )}
                      </div>
                      <div>
                        <Dialog open={showSignatureDialog} onOpenChange={setShowSignatureDialog}>
                          <DialogTrigger asChild>
                            <Button variant="outline" className="mb-2">
                              <Pencil className="h-4 w-4 mr-2" />
                              {signature ? t("editSignature") : t("createSignature")}
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>{t("digitalSignature")}</DialogTitle>
                            </DialogHeader>
                            <div className="border rounded-md p-2 bg-white">
                              <canvas
                                ref={signatureCanvasRef}
                                width={500}
                                height={200}
                                className="border border-gray-200 w-full touch-none"
                                onMouseDown={startDrawing}
                                onMouseMove={draw}
                                onMouseUp={endDrawing}
                                onMouseLeave={endDrawing}
                                onTouchStart={startDrawing}
                                onTouchMove={draw}
                                onTouchEnd={endDrawing}
                              />
                            </div>
                            <DialogFooter>
                              <Button variant="outline" onClick={clearSignature}>
                                {t("cancel")}
                              </Button>
                              <Button onClick={saveSignature}>{t("save")}</Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                        <p className="text-sm text-gray-500">
                          Buat tanda tangan digital atau unggah gambar tanda tangan.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="w-32 h-32 border rounded-md flex items-center justify-center overflow-hidden">
                        {stamp ? (
                          <div className="relative w-full h-full">
                            <img
                              src={stamp || "/placeholder.svg"}
                              alt="Stempel"
                              className="object-contain w-full h-full p-2"
                            />
                            <Button
                              variant="ghost"
                              size="icon"
                              className="absolute top-0 right-0 bg-white/80 rounded-full p-1"
                              onClick={removeStamp}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ) : (
                          <StampIcon className="h-10 w-10 text-gray-300" />
                        )}
                      </div>
                      <div>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleStampUpload}
                          className="hidden"
                          ref={stampInputRef}
                        />
                        <Button variant="outline" onClick={() => stampInputRef.current?.click()} className="mb-2">
                          <StampIcon className="h-4 w-4 mr-2" />
                          {t("uploadStamp")}
                        </Button>
                        <p className="text-sm text-gray-500">
                          Format yang didukung: JPG, PNG, GIF. Ukuran maksimal 2MB.
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardContent className="pt-6">
                  <h2 className="text-lg font-semibold mb-4">{t("from")}</h2>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="fromName">{t("nameCompany")}</Label>
                      <Input
                        id="fromName"
                        placeholder="PT Maju Bersama"
                        value={fromName}
                        onChange={(e) => setFromName(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="fromEmail">{t("email")}</Label>
                      <Input
                        id="fromEmail"
                        type="email"
                        placeholder="info@majubersama.com"
                        value={fromEmail}
                        onChange={(e) => setFromEmail(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="fromPhone">{t("phone")}</Label>
                      <Input
                        id="fromPhone"
                        placeholder="021-5551234"
                        value={fromPhone}
                        onChange={(e) => setFromPhone(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="fromAddress">{t("address")}</Label>
                      <Textarea
                        id="fromAddress"
                        placeholder="Jl. Sudirman No. 123, Jakarta Pusat"
                        value={fromAddress}
                        onChange={(e) => setFromAddress(e.target.value)}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <h2 className="text-lg font-semibold mb-4">{t("to")}</h2>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="toName">{t("nameCompany")}</Label>
                      <Input
                        id="toName"
                        placeholder="PT Pelanggan Setia"
                        value={toName}
                        onChange={(e) => setToName(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="toEmail">{t("email")}</Label>
                      <Input
                        id="toEmail"
                        type="email"
                        placeholder="finance@pelanggansetia.com"
                        value={toEmail}
                        onChange={(e) => setToEmail(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="toPhone">{t("phone")}</Label>
                      <Input
                        id="toPhone"
                        placeholder="021-5557890"
                        value={toPhone}
                        onChange={(e) => setToPhone(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="toWhatsapp">{t("whatsapp")}</Label>
                      <Input
                        id="toWhatsapp"
                        placeholder="6281234567890"
                        value={toWhatsapp}
                        onChange={(e) => setToWhatsapp(e.target.value)}
                      />
                      <p className="text-xs text-gray-500">Format: 628xxxxxxxxxx (tanpa tanda + atau spasi)</p>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="toAddress">{t("address")}</Label>
                      <Textarea
                        id="toAddress"
                        placeholder="Jl. Gatot Subroto No. 456, Jakarta Selatan"
                        value={toAddress}
                        onChange={(e) => setToAddress(e.target.value)}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardContent className="pt-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-semibold">{t("items")}</h2>
                  <Button onClick={addItem} size="sm" variant="outline">
                    <Plus className="h-4 w-4 mr-2" />
                    {t("addItem")}
                  </Button>
                </div>

                <div className="space-y-4">
                  {items.map((item, index) => (
                    <div key={index} className="grid grid-cols-12 gap-4 items-end">
                      <div className="col-span-12 md:col-span-6 space-y-2">
                        <Label htmlFor={`item-${index}-desc`}>{t("description")}</Label>
                        <Input
                          id={`item-${index}-desc`}
                          value={item.deskripsi}
                          onChange={(e) => updateItem(index, "deskripsi", e.target.value)}
                          placeholder={t("description")}
                        />
                      </div>
                      <div className="col-span-4 md:col-span-2 space-y-2">
                        <Label htmlFor={`item-${index}-qty`}>{t("quantity")}</Label>
                        <Input
                          id={`item-${index}-qty`}
                          type="number"
                          min="1"
                          value={item.kuantitas}
                          onChange={(e) => updateItem(index, "kuantitas", Number.parseInt(e.target.value) || 1)}
                        />
                      </div>
                      <div className="col-span-6 md:col-span-3 space-y-2">
                        <Label htmlFor={`item-${index}-price`}>{t("price")}</Label>
                        <Input
                          id={`item-${index}-price`}
                          type="number"
                          min="0"
                          value={item.harga}
                          onChange={(e) => updateItem(index, "harga", Number.parseInt(e.target.value) || 0)}
                          placeholder={t("price")}
                        />
                      </div>
                      <div className="col-span-2 md:col-span-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeItem(index)}
                          disabled={items.length === 1}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-6 space-y-4 border-t pt-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Switch id="discount-toggle" checked={discountEnabled} onCheckedChange={setDiscountEnabled} />
                      <Label htmlFor="discount-toggle">{t("discount")}</Label>
                    </div>

                    {discountEnabled && (
                      <div className="flex items-center space-x-4">
                        <RadioGroup
                          defaultValue="percentage"
                          value={discountType}
                          onValueChange={(value) => setDiscountType(value as "percentage" | "fixed")}
                          className="flex items-center space-x-4"
                        >
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="percentage" id="percentage" />
                            <Label htmlFor="percentage">{t("percentage")}</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="fixed" id="fixed" />
                            <Label htmlFor="fixed">{t("fixed")}</Label>
                          </div>
                        </RadioGroup>

                        <div className="w-24">
                          <Input
                            type="number"
                            min="0"
                            value={discountValue}
                            onChange={(e) => setDiscountValue(Number.parseInt(e.target.value) || 0)}
                            placeholder={discountType === "percentage" ? "10%" : "100000"}
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Switch id="tax-toggle" checked={taxEnabled} onCheckedChange={setTaxEnabled} />
                      <Label htmlFor="tax-toggle">{t("tax")}</Label>
                    </div>
                  </div>

                  <div className="space-y-2 pt-2">
                    <div className="flex justify-between">
                      <span className="font-medium">{t("subtotal")}</span>
                      <span>{formatCurrency(calculateSubtotal())}</span>
                    </div>

                    {discountEnabled && (
                      <div className="flex justify-between">
                        <span className="font-medium">
                          {t("discount")} {discountType === "percentage" ? `(${discountValue}%)` : ""}
                        </span>
                        <span>- {formatCurrency(calculateDiscount())}</span>
                      </div>
                    )}

                    {taxEnabled && (
                      <div className="flex justify-between py-2 border-b border-gray-200">
                        <span className="text-gray-600">{t("tax")}</span>
                        <span>{formatCurrency(calculateTax())}</span>
                      </div>
                    )}

                    <div className="flex justify-between text-lg font-bold border-t pt-2">
                      <span>{t("total")}</span>
                      <span>{formatCurrency(calculateTotal())}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <h2 className="text-lg font-semibold mb-4">{t("notesTerms")}</h2>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="notes">{t("notes")}</Label>
                    <Textarea
                      id="notes"
                      placeholder="Terima kasih atas kerjasamanya."
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="terms">{t("terms")}</Label>
                    <Textarea
                      id="terms"
                      placeholder="Pembayaran harus dilakukan dalam 14 hari."
                      value={terms}
                      onChange={(e) => setTerms(e.target.value)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="flex justify-between mt-6">
            <div className="flex gap-2">
              <Button variant="outline" className="gap-2" onClick={handleDuplicate}>
                <Copy className="h-4 w-4" />
                {t("duplicate")}
              </Button>
              <Dialog open={showEmailDialog} onOpenChange={setShowEmailDialog}>
                <DialogTrigger asChild>
                  <Button variant="outline" className="gap-2">
                    <Mail className="h-4 w-4" />
                    {t("emailInvoice")}
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>{t("sendInvoiceEmail")}</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="email-recipient">{t("recipient")}</Label>
                      <Input
                        id="email-recipient"
                        type="email"
                        placeholder="finance@pelanggansetia.com"
                        value={emailRecipient}
                        onChange={(e) => setEmailRecipient(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email-subject">{t("subject")}</Label>
                      <Input
                        id="email-subject"
                        placeholder={`Faktur ${invoiceNumber}`}
                        value={emailSubject}
                        onChange={(e) => setEmailSubject(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email-message">{t("message")}</Label>
                      <Textarea
                        id="email-message"
                        placeholder="Terlampir faktur untuk layanan yang telah kami berikan. Terima kasih."
                        value={emailMessage}
                        onChange={(e) => setEmailMessage(e.target.value)}
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setShowEmailDialog(false)}>
                      {t("cancel")}
                    </Button>
                    <Button onClick={handleSendEmail}>{t("send")}</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
              <Button variant="outline" className="gap-2" onClick={handleSendWhatsApp}>
                <MessageSquare className="h-4 w-4" />
                WhatsApp
              </Button>
              <Dialog open={showCreateRecurringDialog} onOpenChange={setShowCreateRecurringDialog}>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>{t("createRecurring")}</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="recurringName">{t("recurringName")}</Label>
                      <Input
                        id="recurringName"
                        placeholder={t("recurringName")}
                        value={recurringName}
                        onChange={(e) => setRecurringName(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="recurringFrequency">{t("frequency")}</Label>
                      <Select value={recurringFrequency} onValueChange={setRecurringFrequency}>
                        <SelectTrigger>
                          <SelectValue placeholder={t("frequency")} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="weekly">{t("weekly")}</SelectItem>
                          <SelectItem value="monthly">{t("monthly")}</SelectItem>
                          <SelectItem value="quarterly">{t("quarterly")}</SelectItem>
                          <SelectItem value="yearly">{t("yearly")}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>{t("startDate")}</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "w-full justify-start text-left font-normal",
                              !recurringStartDate && "text-muted-foreground",
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {recurringStartDate
                              ? format(recurringStartDate, "PPP", { locale: language === "id" ? id : enUS })
                              : t("selectDate")}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <CalendarComponent
                            mode="single"
                            selected={recurringStartDate}
                            onSelect={setRecurringStartDate}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                    <div className="space-y-2">
                      <Label>{t("endDate")}</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "w-full justify-start text-left font-normal",
                              !recurringEndDate && "text-muted-foreground",
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {recurringEndDate
                              ? format(recurringEndDate, "PPP", { locale: language === "id" ? id : enUS })
                              : t("selectDate")}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <CalendarComponent
                            mode="single"
                            selected={recurringEndDate}
                            onSelect={setRecurringEndDate}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setShowCreateRecurringDialog(false)}>
                      {t("cancel")}
                    </Button>
                    <Button onClick={handleCreateRecurring}>{t("save")}</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
              <Button
                variant="outline"
                className="gap-2"
                onClick={() => {
                  // Load current invoice to recurring invoice template
                  setRecurringName(`${t("recurringName")} ${invoiceNumber}`)
                  setRecurringFrequency("monthly")
                  setRecurringStartDate(date)
                  setRecurringEndDate(dueDate)
                  setShowCreateRecurringDialog(true)
                }}
              >
                <RepeatIcon className="h-4 w-4" />
                {t("createFromCurrent")}
              </Button>
            </div>
            <Button className="gap-2" onClick={handleSave}>
              <Save className="h-4 w-4" />
              {t("save")}
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="preview" className="print-container">
          <Card className={`bg-white shadow-lg print-container ${currentTemplate.fontFamily}`}>
            <CardContent className="p-8">
              <div className="flex justify-between items-start mb-8">
                <div className={currentTemplate.headerStyle}>
                  <h1 className={`text-2xl font-bold ${currentTemplate.primaryColor}`}>FAKTUR</h1>
                  <p className={`mt-1 ${currentTemplate.secondaryColor}`}>#{invoiceNumber}</p>
                </div>
                <div className="text-right flex flex-col items-end">
                  {logo && (
                    <div className="mb-4 w-32 h-auto">
                      <img
                        src={logo || "/placeholder.svg"}
                        alt="Logo Perusahaan"
                        className="max-w-full max-h-20 object-contain"
                      />
                    </div>
                  )}
                  <h2 className={`font-bold text-xl ${currentTemplate.primaryColor}`}>{fromName}</h2>
                  <p className={currentTemplate.secondaryColor}>{fromAddress}</p>
                  <p className={currentTemplate.secondaryColor}>{fromEmail}</p>
                  <p className={currentTemplate.secondaryColor}>{fromPhone}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-8 mb-8">
                <div>
                  <h3 className={`font-semibold mb-2 ${currentTemplate.secondaryColor}`}>{t("invoiceTo")}</h3>
                  <p className="font-semibold">{toName}</p>
                  <p className="text-gray-600">{toAddress}</p>
                  <p className="text-gray-600">{toEmail}</p>
                  <p className="text-gray-600">{toPhone}</p>
                  {toWhatsapp && <p className="text-gray-600">WA: {toWhatsapp}</p>}
                </div>
                <div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h3 className={`font-semibold mb-2 ${currentTemplate.secondaryColor}`}>{t("invoiceNum")}</h3>
                      <p className="text-gray-800">{invoiceNumber}</p>
                    </div>
                    <div>
                      <h3 className={`font-semibold mb-2 ${currentTemplate.secondaryColor}`}>{t("date")}</h3>
                      <p className="text-gray-800">
                        {date
                          ? format(date, "dd MMMM yyyy", { locale: language === "id" ? id : enUS })
                          : "01 Januari 2023"}
                      </p>
                    </div>
                    <div>
                      <h3 className={`font-semibold mb-2 ${currentTemplate.secondaryColor}`}>JATUH TEMPO</h3>
                      <p className="text-gray-800">
                        {dueDate
                          ? format(dueDate, "dd MMMM yyyy", { locale: language === "id" ? id : enUS })
                          : "15 Januari 2023"}
                      </p>
                    </div>
                    <div>
                      <h3 className={`font-semibold mb-2 ${currentTemplate.secondaryColor}`}>{t("total")}</h3>
                      <p className={`font-bold ${currentTemplate.primaryColor}`}>{formatCurrency(calculateTotal())}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mb-8">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className={`text-left py-3 px-2 font-semibold ${currentTemplate.secondaryColor}`}>
                        {t("description")}
                      </th>
                      <th className={`text-center py-3 px-2 font-semibold ${currentTemplate.secondaryColor}`}>
                        {t("quantity")}
                      </th>
                      <th className={`text-right py-3 px-2 font-semibold ${currentTemplate.secondaryColor}`}>
                        {t("price")}
                      </th>
                      <th className={`text-right py-3 px-2 font-semibold ${currentTemplate.secondaryColor}`}>
                        {t("amount")}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((item, index) => (
                      <tr key={index} className="border-b border-gray-100">
                        <td className="py-4 px-2 text-gray-800">{item.deskripsi || "Jasa Konsultasi"}</td>
                        <td className="py-4 px-2 text-center text-gray-800">{item.kuantitas}</td>
                        <td className="py-4 px-2 text-right text-gray-800">{formatCurrency(item.harga)}</td>
                        <td className="py-4 px-2 text-right text-gray-800">
                          {formatCurrency(item.kuantitas * item.harga)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="flex justify-end mb-8">
                <div className="w-1/2">
                  <div className="flex justify-between py-2">
                    <span className="text-gray-600">{t("subtotal")}</span>
                    <span className="text-gray-800">{formatCurrency(calculateSubtotal())}</span>
                  </div>

                  {discountEnabled && (
                    <div className="flex justify-between py-2">
                      <span className="text-gray-600">
                        {t("discount")} {discountType === "percentage" ? `(${discountValue}%)` : ""}
                      </span>
                      <span className="text-gray-800">- {formatCurrency(calculateDiscount())}</span>
                    </div>
                  )}

                  {taxEnabled && (
                    <div className="flex justify-between py-2 border-b border-gray-200">
                      <span className="text-gray-600">{t("tax")}</span>
                      <span className="text-gray-800">{formatCurrency(calculateTax())}</span>
                    </div>
                  )}

                  <div className="flex justify-between py-2 font-bold text-lg">
                    <span>{t("total")}</span>
                    <span className={currentTemplate.primaryColor}>{formatCurrency(calculateTotal())}</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-8 mb-8">
                <div>
                  <h3 className={`font-semibold mb-2 ${currentTemplate.secondaryColor}`}>{t("notes")}</h3>
                  <p className="text-gray-600">{notes}</p>
                </div>
                <div>
                  <h3 className={`font-semibold mb-2 ${currentTemplate.secondaryColor}`}>{t("terms")}</h3>
                  <p className="text-gray-600">{terms}</p>
                </div>
              </div>

              <div className="flex justify-between items-end mt-12">
                <div className="text-center">
                  {signature && (
                    <div className="mb-2">
                      <img src={signature || "/placeholder.svg"} alt="Tanda Tangan" className="h-16 mx-auto" />
                    </div>
                  )}
                  <div className="border-t border-gray-300 pt-2 w-48">
                    <p className="font-semibold">{fromName}</p>
                  </div>
                </div>
                <div className="text-center">
                  {stamp && (
                    <div className="mb-2">
                      <img src={stamp || "/placeholder.svg"} alt="Stempel" className="h-24 mx-auto" />
                    </div>
                  )}
                </div>
              </div>

              {qrCodeEnabled && (
                <div className="mt-8 flex justify-end">
                  <div className="text-center">
                    <QRCode text={qrCodeData} size={100} />
                    <p className="text-xs text-gray-500 mt-1">{t("scanToVerify")}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <div className="flex justify-center gap-4 mt-6 no-print">
            <div className="flex gap-2">
              <Button variant="outline" className="gap-2" onClick={() => exportToFormat("pdf")}>
                <FileText className="h-4 w-4" />
                PDF
              </Button>
              <Button variant="outline" className="gap-2" onClick={() => exportToFormat("excel")}>
                <FileSpreadsheet className="h-4 w-4" />
                Excel
              </Button>
              <Button variant="outline" className="gap-2" onClick={() => exportToFormat("csv")}>
                <Download className="h-4 w-4" />
                CSV
              </Button>
              <Dialog open={showEmailDialog} onOpenChange={setShowEmailDialog}>
                <DialogTrigger asChild>
                  <Button variant="outline" className="gap-2">
                    <Mail className="h-4 w-4" />
                    {t("email")}
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>{t("sendInvoiceEmail")}</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="email-recipient">{t("recipient")}</Label>
                      <Input
                        id="email-recipient"
                        type="email"
                        placeholder="finance@pelanggansetia.com"
                        value={emailRecipient}
                        onChange={(e) => setEmailRecipient(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email-subject">{t("subject")}</Label>
                      <Input
                        id="email-subject"
                        placeholder={`Faktur ${invoiceNumber}`}
                        value={emailSubject}
                        onChange={(e) => setEmailSubject(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email-message">{t("message")}</Label>
                      <Textarea
                        id="email-message"
                        placeholder="Terlampir faktur untuk layanan yang telah kami berikan. Terima kasih."
                        value={emailMessage}
                        onChange={(e) => setEmailMessage(e.target.value)}
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setShowEmailDialog(false)}>
                      {t("cancel")}
                    </Button>
                    <Button onClick={handleSendEmail}>{t("send")}</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
              <Button variant="outline" className="gap-2" onClick={handleSendWhatsApp}>
                <MessageSquare className="h-4 w-4" />
                WhatsApp
              </Button>
            </div>
            <Button className="gap-2" onClick={handlePrint}>
              <Printer className="h-4 w-4" />
              {t("print")}
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
