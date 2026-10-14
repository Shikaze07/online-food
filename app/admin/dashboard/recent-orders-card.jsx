"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { OrderStatusBadge } from "@/app/admin/order-management/components/order-status-badge";
import { getDashboardOrders } from "@/lib/actions/dashboard-actions";
import { ArrowRight, ChevronLeft, ChevronRight, Loader2, ShoppingBag } from "lucide-react";

const peso = (n) =>
  `₱${Number(n).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

export function RecentOrdersCard({ initialOrders, totalOrders, pageSize = 5 }) {
  const [orders, setOrders] = useState(initialOrders || []);
  const [total, setTotal] = useState(totalOrders || 0);
  const [page, setPage] = useState(1);
  const [isPending, startTransition] = useTransition();

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > totalPages || newPage === page || isPending) return;

    startTransition(async () => {
      const res = await getDashboardOrders(newPage, pageSize);
      if (res?.orders) {
        setOrders(res.orders);
        setPage(res.page);
        if (typeof res.total === "number") setTotal(res.total);
      }
    });
  };

  return (
    <Card className="overflow-hidden border-border/70 shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between border-b border-border/40 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <CardTitle className="text-base font-bold">Recent Orders</CardTitle>
            {isPending && <Loader2 className="h-3.5 w-3.5 animate-spin text-primary" />}
          </div>
          <CardDescription className="text-xs">
            Latest orders placed by customers across Koronadal City
          </CardDescription>
        </div>
        <Button asChild variant="ghost" size="sm" className="gap-1.5 text-xs font-semibold">
          <Link href="/admin/order-management">
            Manage All <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </Button>
      </CardHeader>

      <CardContent className="p-0">
        {orders.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-10 text-center space-y-2">
            <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center text-muted-foreground">
              <ShoppingBag className="h-5 w-5" />
            </div>
            <p className="text-sm font-semibold">No orders yet</p>
            <p className="text-xs text-muted-foreground">Customer orders will appear here in real-time.</p>
          </div>
        ) : (
          <div className={`divide-y divide-border/30 transition-opacity duration-200 ${isPending ? "opacity-60" : "opacity-100"}`}>
            {orders.map((o) => (
              <div
                key={o.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-6 py-3.5 hover:bg-muted/20 transition-colors"
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className="h-10 w-10 rounded-xl bg-muted/80 text-foreground flex items-center justify-center text-xs font-black shrink-0 border border-border/50">
                    #{o.id}
                  </div>
                  <div className="min-w-0 space-y-0.5">
                    <p className="text-sm font-bold text-foreground truncate">{o.customer}</p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>
                        {new Date(o.createdAt).toLocaleString("en-US", {
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                      {o.itemSummary && (
                        <>
                          <span>·</span>
                          <span className="truncate max-w-[200px] sm:max-w-[300px]">{o.itemSummary}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-border/20">
                  <OrderStatusBadge status={o.status} />
                  <span className="font-black text-sm text-foreground w-24 text-right">
                    {peso(o.totalAmount)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination footer */}
        {total > 0 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-6 py-3.5 border-t border-border/40 bg-muted/20 text-xs">
            <p className="text-muted-foreground">
              Showing {(page - 1) * pageSize + 1}–{Math.min(page * pageSize, total)} of {total} orders
            </p>

            <div className="flex items-center gap-1.5">
              <Button
                variant="outline"
                size="sm"
                className="h-8 w-8 p-0"
                disabled={page === 1 || isPending}
                onClick={() => handlePageChange(page - 1)}
                aria-label="Previous page"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>

              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
                .reduce((acc, p, idx, arr) => {
                  if (idx > 0 && p - arr[idx - 1] > 1) acc.push("…");
                  acc.push(p);
                  return acc;
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
                      disabled={isPending}
                      onClick={() => handlePageChange(p)}
                    >
                      {p}
                    </Button>
                  )
                )}

              <Button
                variant="outline"
                size="sm"
                className="h-8 w-8 p-0"
                disabled={page === totalPages || isPending}
                onClick={() => handlePageChange(page + 1)}
                aria-label="Next page"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
