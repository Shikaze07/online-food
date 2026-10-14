"use client"

import { useState, useEffect, useMemo } from "react"
import { getRiderDeliveryHistory } from "@/lib/actions/delivery-actions"
import { getCurrentUser } from "@/lib/actions/auth-actions"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  Truck,
  PackageCheck,
  MapPin,
  Phone,
  Search,
  Calendar,
  CalendarDays,
  Clock,
  ChevronLeft,
  ChevronRight,
  SlidersHorizontal,
  TrendingUp,
  Loader2,
  CreditCard,
  User,
  X,
} from "lucide-react"

const PAGE_SIZE = 8

const RANGE_OPTIONS = [
  { value: "ALL", label: "All Time" },
  { value: "TODAY", label: "Today" },
  { value: "WEEK", label: "Last 7 Days" },
  { value: "MONTH", label: "This Month" },
]

function inRange(date, range) {
  if (range === "ALL") return true
  const d = new Date(date)
  const now = new Date()
  if (range === "TODAY") return d.toDateString() === now.toDateString()
  if (range === "WEEK") return now - d <= 7 * 24 * 60 * 60 * 1000
  if (range === "MONTH")
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
  return true
}

function StatPill({ icon: Icon, label, value, highlight }) {
  return (
    <div
      className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl border ${
        highlight ? "bg-primary/5 border-primary/20" : "bg-muted/30 border-border/50"
      }`}
    >
      <Icon className={`h-4 w-4 shrink-0 ${highlight ? "text-primary" : "text-muted-foreground"}`} />
      <div>
        <p className={`text-base font-black leading-none ${highlight ? "text-primary" : "text-foreground"}`}>
          {value}
        </p>
        <p className="text-[11px] text-muted-foreground mt-0.5">{label}</p>
      </div>
    </div>
  )
}

export default function DeliveryHistoryPage() {
  const [deliveries, setDeliveries] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [range, setRange] = useState("ALL")
  const [page, setPage] = useState(1)

  useEffect(() => {
    async function load() {
      try {
        const user = await getCurrentUser()
        if (user?.role === "RIDER") {
          const res = await getRiderDeliveryHistory(user.id)
          if (res.deliveries) setDeliveries(res.deliveries)
        }
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
  }, [search, range])

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim()
    return deliveries.filter((d) => {
      if (!inRange(d.updatedAt, range)) return false
      if (!q) return true
      const c = d.order.customer
      return (
        String(d.order.id).includes(q) ||
        `${c.firstName} ${c.lastName}`.toLowerCase().includes(q) ||
        d.order.address?.toLowerCase().includes(q) ||
        d.order.orderItems?.some((i) => i.menuItem?.name?.toLowerCase().includes(q))
      )
    })
  }, [deliveries, search, range])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  const total = deliveries.length
  const today = deliveries.filter((d) => inRange(d.updatedAt, "TODAY")).length
  const month = deliveries.filter((d) => inRange(d.updatedAt, "MONTH")).length
  const value = deliveries.reduce((s, d) => s + Number(d.order.totalAmount), 0)

  if (loading) {
    return (
      <div className="container mx-auto p-6 md:p-8 max-w-5xl space-y-6 animate-pulse">
        <div className="h-10 w-64 bg-muted rounded-lg" />
        <div className="flex gap-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 w-36 bg-muted/60 rounded-xl" />
          ))}
        </div>
        <div className="space-y-4 pt-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 w-full bg-muted/40 rounded-2xl border" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 md:p-8 max-w-5xl space-y-7 animate-in fade-in duration-300">
      {/* Header */}
      <div className="border-b border-border/60 pb-6">
        <div className="flex items-center gap-2 text-primary font-semibold mb-1">
          <Truck className="h-4 w-4" />
          <span className="text-xs uppercase tracking-widest">Albertoz Delivery</span>
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight">Delivery History</h1>
        <p className="text-muted-foreground text-sm mt-1">
          A record of all pizza deliveries you have completed.
        </p>
      </div>

      {/* Stats */}
      {total > 0 && (
        <div className="flex flex-wrap gap-2">
          <StatPill icon={PackageCheck} label="Total Delivered" value={total} highlight />
          <StatPill icon={CalendarDays} label="Today" value={today} />
          <StatPill icon={Calendar} label="This Month" value={month} />
          <StatPill icon={TrendingUp} label="Orders Value" value={`₱${value.toFixed(0)}`} />
        </div>
      )}

      {/* Filters */}
      {total > 0 && (
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by order #, customer, item, address…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 pr-9"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
          <div className="flex items-center gap-1.5 flex-wrap">
            <SlidersHorizontal className="h-4 w-4 text-muted-foreground shrink-0" />
            {RANGE_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setRange(opt.value)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all ${
                  range === opt.value
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

      {total === 0 ? (
        <Card className="border-dashed border-2 bg-muted/20 text-center py-16">
          <CardContent className="flex flex-col items-center space-y-4">
            <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center">
              <Truck className="h-10 w-10 text-primary/60 stroke-[1.5]" />
            </div>
            <div className="space-y-1">
              <h3 className="text-xl font-bold">No deliveries yet</h3>
              <p className="text-muted-foreground text-sm max-w-sm mx-auto">
                Completed deliveries will show up here once you finish your first drop.
              </p>
            </div>
          </CardContent>
        </Card>
      ) : filtered.length === 0 ? (
        <Card className="bg-muted/20 border-dashed py-12">
          <CardContent className="flex flex-col items-center space-y-3">
            <Search className="h-8 w-8 text-muted-foreground/40" />
            <p className="text-muted-foreground font-medium text-sm">No deliveries match your filters</p>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setSearch("")
                setRange("ALL")
              }}
              className="text-xs gap-1.5"
            >
              <X className="h-3 w-3" /> Clear filters
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          <p className="text-xs text-muted-foreground px-1">
            Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filtered.length)} of{" "}
            {filtered.length} deliveries
          </p>

          <div className="space-y-4">
            {paginated.map((d) => {
              const order = d.order
              const customer = order.customer
              const items = order.orderItems || []
              const itemCount = items.reduce((s, i) => s + i.quantity, 0)
              const when = new Date(d.updatedAt)

              return (
                <Card
                  key={d.id}
                  className="overflow-hidden border-border/70 hover:shadow-md transition-all bg-card/60"
                >
                  <div className="bg-muted/40 px-5 py-3.5 flex flex-wrap items-center justify-between gap-3 border-b border-border/40">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-xl bg-muted text-muted-foreground flex items-center justify-center font-bold text-xs">
                        #{order.id}
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5 text-sm font-semibold">
                          <CalendarDays className="h-3.5 w-3.5 text-muted-foreground" />
                          {when.toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                          <span className="text-muted-foreground font-normal">·</span>
                          <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                          <span className="text-xs text-muted-foreground font-normal">
                            {when.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                          </span>
                        </div>
                        <p className="text-[11px] text-muted-foreground mt-0.5">
                          {itemCount} item{itemCount !== 1 ? "s" : ""} delivered
                        </p>
                      </div>
                    </div>
                    <Badge className="bg-emerald-500/15 text-emerald-700 border-emerald-500/30 gap-1">
                      <PackageCheck className="h-3 w-3" /> Delivered
                    </Badge>
                  </div>

                  <CardContent className="p-5">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                      <div className="md:col-span-2 space-y-3">
                        <div className="space-y-1.5">
                          <p className="flex items-center gap-2 text-sm font-semibold">
                            <User className="h-3.5 w-3.5 text-primary" />
                            {customer.firstName} {customer.lastName}
                          </p>
                          {customer.phone && (
                            <p className="flex items-center gap-2 text-xs text-muted-foreground">
                              <Phone className="h-3.5 w-3.5 text-primary" />
                              {customer.phone}
                            </p>
                          )}
                          <p className="flex items-start gap-2 text-xs text-muted-foreground">
                            <MapPin className="h-3.5 w-3.5 mt-0.5 shrink-0 text-primary" />
                            <span className="line-clamp-2">{order.address}</span>
                          </p>
                        </div>
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {items.slice(0, 4).map((item) => (
                            <span
                              key={item.id}
                              className="text-[11px] px-2 py-1 rounded-md bg-primary/10 text-primary font-semibold"
                            >
                              {item.quantity}× {item.menuItem?.name || "Pizza Item"}
                            </span>
                          ))}
                          {items.length > 4 && (
                            <span className="text-[11px] px-2 py-1 text-muted-foreground">
                              +{items.length - 4} more
                            </span>
                          )}
                        </div>
                      </div>

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
                      <span key={`e-${i}`} className="text-muted-foreground text-xs px-1">
                        …
                      </span>
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
