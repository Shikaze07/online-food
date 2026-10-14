"use client"

import { useState, useEffect, useMemo } from "react"
import { getOrders } from "@/lib/actions/order-actions"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { OrderStatusBadge } from "@/app/admin/order-management/components/order-status-badge"
import {
  BarChart3,
  Search,
  X,
  Download,
  ChevronLeft,
  ChevronRight,
  ShoppingBag,
  TrendingUp,
  PackageCheck,
  Ban,
  Loader2,
} from "lucide-react"

const PAGE_SIZE = 10

const STATUS_OPTIONS = [
  { value: "ALL", label: "All" },
  { value: "PENDING", label: "Pending" },
  { value: "PREPARING", label: "Preparing" },
  { value: "OUT_FOR_DELIVERY", label: "Out for Delivery" },
  { value: "COMPLETED", label: "Completed" },
  { value: "CANCELLED", label: "Cancelled" },
]

const PAYMENT_OPTIONS = ["ALL", "COD", "GCASH", "CARD"]

function peso(n) {
  return `₱${Number(n).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

function customerName(o) {
  return o.customer ? `${o.customer.firstName} ${o.customer.lastName}` : "—"
}

function StatCard({ icon: Icon, label, value, highlight }) {
  return (
    <div
      className={`flex items-center gap-3 px-4 py-3 rounded-xl border ${
        highlight ? "bg-primary/5 border-primary/20" : "bg-muted/30 border-border/50"
      }`}
    >
      <Icon className={`h-5 w-5 shrink-0 ${highlight ? "text-primary" : "text-muted-foreground"}`} />
      <div>
        <p className={`text-lg font-black leading-none ${highlight ? "text-primary" : ""}`}>{value}</p>
        <p className="text-[11px] text-muted-foreground mt-1">{label}</p>
      </div>
    </div>
  )
}

export default function ReportsPage() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [exporting, setExporting] = useState(false)
  const [search, setSearch] = useState("")
  const [status, setStatus] = useState("ALL")
  const [payment, setPayment] = useState("ALL")
  const [from, setFrom] = useState("")
  const [to, setTo] = useState("")
  const [page, setPage] = useState(1)

  useEffect(() => {
    async function load() {
      try {
        const res = await getOrders()
        if (res?.orders) setOrders(res.orders)
      } catch (e) {
        console.error(e)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  useEffect(() => {
    setPage(1)
  }, [search, status, payment, from, to])

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim()
    const fromD = from ? new Date(`${from}T00:00:00`) : null
    const toD = to ? new Date(`${to}T23:59:59`) : null
    return orders.filter((o) => {
      if (status !== "ALL" && o.status !== status) return false
      if (payment !== "ALL" && (o.payment?.method || "COD") !== payment) return false
      const created = new Date(o.createdAt)
      if (fromD && created < fromD) return false
      if (toD && created > toD) return false
      if (!q) return true
      return (
        String(o.id).includes(q) ||
        customerName(o).toLowerCase().includes(q) ||
        o.address?.toLowerCase().includes(q) ||
        o.orderItems?.some((i) => i.menuItem?.name?.toLowerCase().includes(q))
      )
    })
  }, [orders, search, status, payment, from, to])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  const completed = filtered.filter((o) => o.status === "COMPLETED")
  const cancelled = filtered.filter((o) => o.status === "CANCELLED")
  const revenue = completed.reduce((s, o) => s + Number(o.totalAmount), 0)
  const avg = completed.length ? revenue / completed.length : 0

  const hasFilters = search || status !== "ALL" || payment !== "ALL" || from || to
  const clearFilters = () => {
    setSearch("")
    setStatus("ALL")
    setPayment("ALL")
    setFrom("")
    setTo("")
  }

  async function exportPdf() {
    setExporting(true)
    try {
      const { jsPDF } = await import("jspdf")
      const autoTable = (await import("jspdf-autotable")).default
      const doc = new jsPDF({ orientation: "landscape" })

      doc.setFontSize(18)
      doc.text("Albertoz Pizza - Sales Report", 14, 16)
      doc.setFontSize(10)
      doc.setTextColor(100)
      doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 23)
      const filterText = [
        status !== "ALL" && `Status: ${status}`,
        payment !== "ALL" && `Payment: ${payment}`,
        from && `From: ${from}`,
        to && `To: ${to}`,
        search && `Search: "${search}"`,
      ]
        .filter(Boolean)
        .join("  |  ")
      doc.text(`Filters: ${filterText || "None"}`, 14, 29)
      doc.text(
        `Orders: ${filtered.length}  |  Completed: ${completed.length}  |  Cancelled: ${cancelled.length}  |  Revenue: PHP ${revenue.toFixed(2)}`,
        14,
        35
      )

      autoTable(doc, {
        startY: 41,
        head: [["Order #", "Date", "Customer", "Items", "Payment", "Status", "Total (PHP)"]],
        body: filtered.map((o) => [
          `#${o.id}`,
          new Date(o.createdAt).toLocaleString(),
          customerName(o),
          (o.orderItems || []).map((i) => `${i.quantity}x ${i.menuItem?.name || "Item"}`).join(", "),
          o.payment?.method || "COD",
          o.status.replaceAll("_", " "),
          Number(o.totalAmount).toFixed(2),
        ]),
        styles: { fontSize: 8, cellPadding: 2 },
        headStyles: { fillColor: [220, 38, 38] },
        columnStyles: { 3: { cellWidth: 80 }, 6: { halign: "right" } },
      })

      doc.save(`albertoz-sales-report-${new Date().toISOString().slice(0, 10)}.pdf`)
    } catch (e) {
      console.error("PDF export failed", e)
    } finally {
      setExporting(false)
    }
  }

  if (loading) {
    return (
      <div className="p-6 md:p-8 space-y-6 animate-pulse">
        <div className="h-10 w-64 bg-muted rounded-lg" />
        <div className="flex gap-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-16 w-40 bg-muted/60 rounded-xl" />
          ))}
        </div>
        <div className="h-96 bg-muted/40 rounded-2xl border" />
      </div>
    )
  }

  return (
    <div className="p-6 md:p-8 space-y-6 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b border-border/60 pb-6">
        <div>
          <div className="flex items-center gap-2 text-primary font-semibold mb-1">
            <BarChart3 className="h-4 w-4" />
            <span className="text-xs uppercase tracking-widest">Albertoz Admin</span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight">Reports & Records</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Sales records and order performance. Filter, browse and export to PDF.
          </p>
        </div>
        <Button
          onClick={exportPdf}
          disabled={exporting || filtered.length === 0}
          className="gap-2 font-semibold self-start"
        >
          {exporting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
          Export PDF
        </Button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard icon={ShoppingBag} label="Orders (filtered)" value={filtered.length} />
        <StatCard icon={PackageCheck} label="Completed" value={completed.length} highlight />
        <StatCard icon={TrendingUp} label={`Revenue · avg ${peso(avg)}`} value={peso(revenue)} highlight />
        <StatCard icon={Ban} label="Cancelled" value={cancelled.length} />
      </div>

      <div className="space-y-3">
        <div className="flex flex-col lg:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by order #, customer, item, address…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <label className="text-xs text-muted-foreground">From</label>
            <Input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className="w-40" />
            <label className="text-xs text-muted-foreground">To</label>
            <Input type="date" value={to} onChange={(e) => setTo(e.target.value)} className="w-40" />
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
          <div className="flex items-center gap-1.5 flex-wrap">
            {STATUS_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setStatus(opt.value)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all ${
                  status === opt.value
                    ? "bg-primary text-primary-foreground border-primary shadow-sm"
                    : "bg-background text-muted-foreground border-border hover:border-primary/40 hover:text-foreground"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-1.5 flex-wrap">
            {PAYMENT_OPTIONS.map((p) => (
              <button
                key={p}
                onClick={() => setPayment(p)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all ${
                  payment === p
                    ? "bg-foreground text-background border-foreground"
                    : "bg-background text-muted-foreground border-border hover:text-foreground"
                }`}
              >
                {p === "ALL" ? "All Payments" : p}
              </button>
            ))}
          </div>
          {hasFilters && (
            <Button variant="ghost" size="sm" onClick={clearFilters} className="text-xs gap-1.5">
              <X className="h-3 w-3" /> Clear filters
            </Button>
          )}
        </div>
      </div>

      {filtered.length === 0 ? (
        <Card className="bg-muted/20 border-dashed py-12">
          <CardContent className="flex flex-col items-center space-y-3">
            <Search className="h-8 w-8 text-muted-foreground/40" />
            <p className="text-muted-foreground font-medium text-sm">No records match your filters</p>
          </CardContent>
        </Card>
      ) : (
        <>
          <Card className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted/40 text-xs uppercase tracking-wider text-muted-foreground">
                  <tr>
                    <th className="text-left px-4 py-3">Order</th>
                    <th className="text-left px-4 py-3">Date</th>
                    <th className="text-left px-4 py-3">Customer</th>
                    <th className="text-left px-4 py-3">Items</th>
                    <th className="text-left px-4 py-3">Payment</th>
                    <th className="text-left px-4 py-3">Status</th>
                    <th className="text-right px-4 py-3">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {paginated.map((o) => (
                    <tr key={o.id} className="border-t border-border/40 hover:bg-muted/20 transition-colors">
                      <td className="px-4 py-3 font-bold">#{o.id}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-muted-foreground">
                        {new Date(o.createdAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">{customerName(o)}</td>
                      <td className="px-4 py-3 max-w-xs">
                        <span className="line-clamp-2 text-xs text-muted-foreground">
                          {(o.orderItems || [])
                            .map((i) => `${i.quantity}× ${i.menuItem?.name || "Item"}`)
                            .join(", ")}
                        </span>
                      </td>
                      <td className="px-4 py-3">{o.payment?.method || "COD"}</td>
                      <td className="px-4 py-3">
                        <OrderStatusBadge status={o.status} />
                      </td>
                      <td className="px-4 py-3 text-right font-bold">{peso(o.totalAmount)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          <div className="flex items-center justify-between">
            <p className="text-xs text-muted-foreground">
              Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filtered.length)} of{" "}
              {filtered.length} · Page {page} of {totalPages}
            </p>
            <div className="flex items-center gap-1.5">
              <Button
                variant="outline"
                size="sm"
                className="h-8 w-8 p-0"
                disabled={page === 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
                .reduce((acc, p, idx, arr) => {
                  if (idx > 0 && p - arr[idx - 1] > 1) acc.push("…")
                  acc.push(p)
                  return acc
                }, [])
                .map((p, i) =>
                  p === "…" ? (
                    <span key={`e-${i}`} className="text-muted-foreground text-xs px-1">
                      …
                    </span>
                  ) : (
                    <Button
                      key={p}
                      variant={page === p ? "default" : "outline"}
                      size="sm"
                      className="h-8 w-8 p-0 text-xs font-bold"
                      onClick={() => setPage(p)}
                    >
                      {p}
                    </Button>
                  )
                )}
              <Button
                variant="outline"
                size="sm"
                className="h-8 w-8 p-0"
                disabled={page === totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
