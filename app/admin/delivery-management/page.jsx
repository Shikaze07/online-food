import { columns } from "./columns"
import { DataTable } from "./data-table"
import { getDeliveries } from "@/lib/actions/delivery-actions"
import { Separator } from "@/components/ui/separator"
import { IconTruckDelivery } from "@tabler/icons-react"
import { AssignDeliveryDialog } from "./components/assign-delivery-dialog"

export const metadata = {
  title: "Delivery Management | Admin Dashboard",
  description: "Manage delivery assignments and track order fulfillment.",
}

export default async function DeliveryManagementPage() {
  const { deliveries, error } = await getDeliveries()

  return (
    <div className="container mx-auto p-7 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 text-primary mb-1">
            <IconTruckDelivery className="h-6 w-6" />
            <h2 className="text-3xl font-bold tracking-tight">Rider Management</h2>
          </div>
          <p className="text-muted-foreground">
            Monitor delivery progress and assign riders to new orders.
          </p>
        </div>

        <AssignDeliveryDialog />
      </div>
      <Separator className="my-6" />
      
      {error ? (
        <div className="p-4 rounded-lg bg-destructive/10 text-destructive border border-destructive/20">
          <p className="font-medium">Error loading deliveries</p>
          <p className="text-sm">{error}</p>
        </div>
      ) : (
        <DataTable columns={columns} data={deliveries || []} />
      )}
    </div>
  )
}
