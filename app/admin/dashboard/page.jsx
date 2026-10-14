import Link from "next/link"
import { getDashboardStats } from "@/lib/actions/dashboard-actions"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { OrderStatusBadge } from "@/app/admin/order-management/components/order-status-badge"
import { RecentOrdersCard } from "./recent-orders-card"
import {
  LayoutDashboard,
  ShoppingBag,
  TrendingUp,
  Users,
  Bike,
  Pizza,
  Clock,
  ChefHat,
  Truck,
  PackageCheck,
  Ban,
  ArrowRight,
} from "lucide-react"

export const dynamic = "force-dynamic"

const peso = (n) =>
  `₱${Number(n).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

function KpiCard({ icon: Icon, label, value, sub, highlight }) {
  return (
    <Card className={highlight ? "border-primary/30 bg-primary/5" : ""}>
      <CardContent className="p-5 flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">{label}</p>
          <p className={`text-2xl font-black ${highlight ? "text-primary" : ""}`}>{value}</p>
          {sub && <p className="text-xs text-muted-foreground">{sub}</p>}
        </div>
        <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
          <Icon className="h-5 w-5" />
        </div>
      </CardContent>
    </Card>
  )
}

const PIPELINE = [
  { key: "PENDING", label: "Pending", icon: Clock },
  { key: "PREPARING", label: "Preparing", icon: ChefHat },
  { key: "OUT_FOR_DELIVERY", label: "Out for Delivery", icon: Truck },
  { key: "COMPLETED", label: "Completed", icon: PackageCheck },
  { key: "CANCELLED", label: "Cancelled", icon: Ban },
]

export default async function AdminDashboardPage() {
  const data = await getDashboardStats()

  if (data.error) {
    return (
      <div className="p-6 md:p-8">
        <Card className="border-dashed py-12 text-center">
          <CardContent className="text-muted-foreground">
            Couldn&apos;t load dashboard data. Please refresh.
          </CardContent>
        </Card>
      </div>
    )
  }

  const { stats, recentOrders, weekly, topItems } = data
  const maxRevenue = Math.max(1, ...weekly.map((d) => d.revenue))
  const maxQty = Math.max(1, ...topItems.map((i) => i.quantity))

  return (
    <div className="p-6 md:p-8 space-y-6 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b border-border/60 pb-6">
        <div>
          <div className="flex items-center gap-2 text-primary font-semibold mb-1">
            <LayoutDashboard className="h-4 w-4" />
            <span className="text-xs uppercase tracking-widest">Albertoz Admin</span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Today&apos;s snapshot of orders, sales and deliveries.
          </p>
        </div>
        <Button asChild variant="outline" className="gap-2 self-start">
          <Link href="/admin/reports">
            View Reports <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <KpiCard
          icon={TrendingUp}
          label="Total Revenue"
          value={peso(stats.revenue)}
          sub={`${peso(stats.todayRevenue)} today`}
          highlight
        />
        <KpiCard
          icon={ShoppingBag}
          label="Total Orders"
          value={stats.totalOrders}
          sub={`${stats.todayOrders} placed today`}
        />
        <KpiCard icon={Users} label="Customers" value={stats.customers} sub="Registered accounts" />
        <KpiCard
          icon={Bike}
          label="Riders"
          value={stats.riders}
          sub={`${stats.menuItems} menu items on offer`}
        />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {PIPELINE.map(({ key, label, icon: Icon }) => (
          <div key={key} className="flex items-center gap-3 rounded-xl border bg-muted/30 px-4 py-3">
            <Icon className="h-4 w-4 text-primary shrink-0" />
            <div>
              <p className="text-lg font-black leading-none">{stats.statusCounts[key] || 0}</p>
              <p className="text-[11px] text-muted-foreground mt-1">{label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Sales — Last 7 Days</CardTitle>
            <CardDescription>Daily revenue excluding cancelled orders</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-end gap-3 h-48">
              {weekly.map((d) => (
                <div key={d.label} className="flex-1 flex flex-col items-center justify-end h-full gap-1.5">
                  <span className="text-[10px] text-muted-foreground">
                    {d.revenue > 0 ? `₱${Math.round(d.revenue)}` : ""}
                  </span>
                  <div
                    className="w-full rounded-t-md bg-gradient-to-t from-primary/70 to-primary transition-all"
                    style={{ height: `${Math.max(3, (d.revenue / maxRevenue) * 100)}%`, opacity: d.revenue ? 1 : 0.25 }}
                    title={`${d.orders} orders · ${peso(d.revenue)}`}
                  />
                  <span className="text-xs font-semibold text-muted-foreground">{d.label}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Pizza className="h-4 w-4 text-primary" /> Best Sellers
            </CardTitle>
            <CardDescription>Top 5 by quantity sold</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {topItems.length === 0 ? (
              <p className="text-sm text-muted-foreground">No sales yet.</p>
            ) : (
              topItems.map((item, i) => (
                <div key={item.name + i} className="space-y-1.5">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium truncate pr-2">
                      {i + 1}. {item.name}
                    </span>
                    <span className="font-bold text-primary">{item.quantity}</span>
                  </div>
                  <div className="h-2 rounded-full bg-muted overflow-hidden">
                    <div
                      className="h-full rounded-full bg-primary"
                      style={{ width: `${(item.quantity / maxQty) * 100}%` }}
                    />
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Orders with Pagination */}
      <RecentOrdersCard
        initialOrders={recentOrders}
        totalOrders={stats.totalOrders}
        pageSize={5}
      />
    </div>
  )
}
