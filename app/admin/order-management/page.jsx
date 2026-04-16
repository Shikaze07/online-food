import { columns } from "./columns"
import { DataTable } from "./data-table"
import { getOrders } from "@/lib/actions/order-actions"
import { Separator } from "@/components/ui/separator"
import { IconShoppingCart } from "@tabler/icons-react"

export const metadata = {
  title: "Order Management | Admin Dashboard",
  description: "Manage and track customer orders in real-time.",
}

export default async function OrderManagementPage() {
  const { orders, error } = await getOrders()

  return (
    <div className="container mx-auto p-7 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 text-primary mb-1">
            <IconShoppingCart className="h-6 w-6" />
            <h2 className="text-3xl font-bold tracking-tight">Order Management</h2>
          </div>
          <p className="text-muted-foreground">
            Monitor, update, and manage all incoming customer orders.
          </p>
        </div>
      </div>
      <Separator className="my-6" />
      
      {error ? (
        <div className="p-4 rounded-lg bg-destructive/10 text-destructive border border-destructive/20">
          <p className="font-medium">Error loading orders</p>
          <p className="text-sm">{error}</p>
        </div>
      ) : (
        <DataTable columns={columns} data={orders || []} />
      )}
    </div>
  )
}
