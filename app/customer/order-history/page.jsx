"use client"

import { useState, useEffect, useMemo } from "react"
import { getCustomerOrders } from "@/lib/actions/order-actions"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Input } from "@/components/ui/input"
import { OrderStatusBadge } from "@/app/admin/order-management/components/order-status-badge"
import Link from "next/link"
import {
  Pizza,
  ReceiptText,
  MapPin,
  Clock,
  ArrowRight,
  ChevronRight,
  ChevronLeft,
  CreditCard,
  Search,
  ShoppingBag,
  PackageCheck,
  AlertCircle,
  Loader2,
  SlidersHorizontal,
  CalendarDays,
  TrendingUp,
  X,
} from "lucide-react"

const PAGE_SIZE = 8

const STATUS_OPTIONS = [
  { value: "ALL", label: "All Orders" },
  { value: "PENDING", label: "Pending" },
  { value: "PREPARING", label: "Preparing" },
  { value: "OUT_FOR_DELIVERY", label: "Out for Delivery" },
  { value: "COMPLETED", label: "Completed" },
  { value: "CANCELLED", label: "Cancelled" },
]

function StatPill({ icon: Icon, label, value, highlight }) {
  return (
    <div className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl border ${highlight ? "bg-primary/5 border-primary/20" : "bg-muted/30 border-border/50"}`}>
      <Icon className={`h-4 w-4 shrink-0 ${highlight ? "text-primary" : "text-muted-foreground"}`} />
      <div>
        <p className={`text-base font-black leading-none ${highlight ? "text-primary" : "text-foreground"}`}>{value}</p>
        <p className="text-[11px] text-muted-foreground mt-0.5">{label}</p>
      </div>
    </div>
  )
}

export default function OrderHistoryPage() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("ALL")
  const [page, setPage] = useState(1)

  useEffect(() => {
    async function load() {
      setLoading(true)
      const res = await getCustomerOrders()
      if (res?.orders) setOrders(res.orders)
      setLoading(false)
    }
    load()
  }, [])

  // Reset to page 1 when filters change
  useEffect(() => { setPage(1) }, [search, statusFilter])

  const filtered = useMemo(() => {
    return orders.filter((o) => {
      const matchStatus = statusFilter === "ALL" || o.status === statusFilter
      const q = search.toLowerCase().trim()
      const matchSearch = !q ||
        String(o.id).includes(q) ||
        o.address?.toLowerCase().includes(q) ||
        o.orderItems?.some((i) => i.menuItem?.name?.toLowerCase().includes(q)) ||
        o.payment?.method?.toLowerCase().includes(q)
      return matchStatus && matchSearch
    })
  }, [orders, search, statusFilter])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  // Stats
  const completedOrders = orders.filter((o) => o.status === "COMPLETED").length
  const totalSpent = orders.filter((o) => o.status === "COMPLETED").reduce((s, o) => s + Number(o.totalAmount), 0)
  const activeOrders = orders.filter((o) => ["PENDING", "PREPARING", "OUT_FOR_DELIVERY"].includes(o.status)).length

  if (loading) {
    return (
      <div className="container mx-auto p-6 md:p-8 max-w-5xl space-y-6 animate-pulse">
        <div className="h-10 w-64 bg-muted rounded-lg" />
        <div className="flex gap-3">
          {[1, 2, 3].map((i) => <div key={i} className="h-16 w-36 bg-muted/60 rounded-xl" />)}
        </div>
        <div className="space-y-4 pt-2">
          {[1, 2, 3, 4].map((i) => <div key={i} className="h-40 w-full bg-muted/40 rounded-2xl border" />)}
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 md:p-8 max-w-5xl space-y-7 animate-in fade-in duration-300">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b border-border/60 pb-6">
        <div>
          <div className="flex items-center gap-2 text-primary font-semibold mb-1">
            <ReceiptText className="h-4 w-4" />
            <span className="text-xs uppercase tracking-widest">Albertoz Pizza</span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight">Order History</h1>
          <p className="text-muted-foreground text-sm mt-1">
            All your pizza orders — past, present, and in progress.
          </p>
        </div>
      </div>

      {/* Stats */}
      {orders.length > 0 && (
        <div className="flex flex-wrap gap-2">
          <StatPill icon={ShoppingBag} label="Total Orders" value={orders.length} />
          <StatPill icon={PackageCheck} label="Completed" value={completedOrders} highlight />
          <StatPill icon={TrendingUp} label="Total Spent" value={`₱${totalSpent.toFixed(0)}`} />
          {activeOrders > 0 && (
            <StatPill icon={Clock} label="Active" value={activeOrders} highlight />
          )}
        </div>
      )}

      {/* Filters */}
      {orders.length > 0 && (
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by order #, item, address, payment…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 pr-9"
            />
            {search && (
              <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
          {/* Status Filter */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <SlidersHorizontal className="h-4 w-4 text-muted-foreground shrink-0" />
            {STATUS_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setStatusFilter(opt.value)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all ${
                  statusFilter === opt.value
                    ? "bg-primary text-primary-foreground border-primary shadow-sm"
                    : "bg-background text-muted-foreground border-border hover:border-primary/40 hover:text-foreground"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Empty state — no orders at all */}
      {orders.length === 0 ? (
        <Card className="border-dashed border-2 bg-muted/20 text-center py-16">
          <CardContent className="flex flex-col items-center space-y-4">
            <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center">
              <Pizza className="h-10 w-10 text-primary/60 stroke-[1.5]" />
            </div>
            <div className="space-y-1">
              <h3 className="text-xl font-bold">No pizza orders yet</h3>
              <p className="text-muted-foreground text-sm max-w-sm mx-auto">
                You haven&apos;t placed any orders yet. Explore our handcrafted crusts and signature toppings!
              </p>
            </div>
            <Button asChild size="lg" className="font-semibold mt-2">
              <Link href="/customer/menu">Explore Albertoz Menu</Link>
            </Button>
          </CardContent>
        </Card>
      ) : filtered.length === 0 ? (
        /* Empty filtered state */
        <Card className="bg-muted/20 border-dashed py-12">
          <CardContent className="flex flex-col items-center space-y-3">
            <Search className="h-8 w-8 text-muted-foreground/40" />
            <p className="text-muted-foreground font-medium text-sm">No orders match your search</p>
            <Button variant="ghost" size="sm" onClick={() => { setSearch(""); setStatusFilter("ALL") }} className="text-xs gap-1.5">
              <X className="h-3 w-3" /> Clear filters
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          <p className="text-xs text-muted-foreground px-1">
            Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length} orders
          </p>

          {/* Order Cards */}
          <div className="space-y-4">
            {paginated.map((order) => {
              const itemCount = order.orderItems?.reduce((s, i) => s + i.quantity, 0) || 0
              const isOngoing = ["PENDING", "PREPARING", "OUT_FOR_DELIVERY"].includes(order.status)
              const isCancelled = order.status === "CANCELLED"

              return (
                <Card
                  key={order.id}
                  className={`overflow-hidden border-border/70 hover:shadow-md transition-all bg-card/60 backdrop-blur-sm ${
                    isOngoing ? "border-primary/30 ring-1 ring-primary/10" : ""
                  } ${isCancelled ? "opacity-70" : ""}`}
                >
                  {/* Card Header Row */}
                  <div className="bg-muted/40 px-5 py-3.5 flex flex-wrap items-center justify-between gap-3 border-b border-border/40">
                    <div className="flex items-center gap-3">
                      <div className={`h-9 w-9 rounded-xl flex items-center justify-center font-bold text-xs ${isOngoing ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
                        #{order.id}
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5 text-sm font-semibold">
                          <CalendarDays className="h-3.5 w-3.5 text-muted-foreground" />
                          {new Date(order.createdAt).toLocaleDateString("en-US", {
                            month: "short", day: "numeric", year: "numeric",
                          })}
                          <span className="text-muted-foreground font-normal">·</span>
                          <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                          <span className="text-xs text-muted-foreground font-normal">
                            {new Date(order.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                          </span>
                        </div>
                        <p className="text-[11px] text-muted-foreground mt-0.5">
                          {itemCount} item{itemCount !== 1 ? "s" : ""} · ₱{Number(order.totalAmount).toFixed(2)}
                        </p>
                      </div>
                    </div>
                    <OrderStatusBadge status={order.status} />
                  </div>

                  {/* Card Body */}
                  <CardContent className="p-5">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                      {/* Items */}
                      <div className="md:col-span-2 space-y-3">
                        {order.address && (
                          <p className="flex items-start gap-2 text-xs text-muted-foreground">
                            <MapPin className="h-3.5 w-3.5 mt-0.5 shrink-0 text-primary" />
                            <span className="line-clamp-2">{order.address}</span>
                          </p>
                        )}
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {order.orderItems?.slice(0, 4).map((item) => (
                            <span
                              key={item.id}
                              className="text-[11px] px-2 py-1 rounded-md bg-primary/10 text-primary font-semibold"
                            >
                              {item.quantity}× {item.menuItem?.name || "Pizza Item"}
                            </span>
                          ))}
                          {order.orderItems?.length > 4 && (
                            <span className="text-[11px] px-2 py-1 text-muted-foreground">
                              +{order.orderItems.length - 4} more
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Payment Summary */}
                      <div className="border-t md:border-t-0 md:border-l border-border/40 md:pl-5 pt-4 md:pt-0 space-y-2">
                        <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                          Order Summary
                        </p>
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-muted-foreground flex items-center gap-1">
                            <CreditCard className="h-3 w-3" /> Payment
                          </span>
                          <span className="font-semibold">{order.payment?.method || "COD"}</span>
                        </div>
                        <div className="flex items-center justify-between pt-1">
                          <span className="text-xs font-semibold">Total</span>
                          <span className="text-lg font-black text-primary">
                            ₱{Number(order.totalAmount).toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-2">
              <p className="text-xs text-muted-foreground">
                Page {page} of {totalPages}
              </p>
              <div className="flex items-center gap-1.5">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="h-8 w-8 p-0"
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
                      <span key={`ellipsis-${i}`} className="text-muted-foreground text-xs px-1">…</span>
                    ) : (
                      <Button
                        key={p}
                        variant={page === p ? "default" : "outline"}
                        size="sm"
                        onClick={() => setPage(p)}
                        className="h-8 w-8 p-0 text-xs font-bold"
                      >
                        {p}
                      </Button>
                    )
                  )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="h-8 w-8 p-0"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
