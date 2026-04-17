import { columns } from "./columns"
import { DataTable } from "./data-table"
import { AddMenuDialog } from "./components/add-menu-dialog"
import { getMenuItems } from "@/lib/actions/menu-actions"
import { Separator } from "@/components/ui/separator"
import { Beef, Hamburger } from "lucide-react"

export default async function MenuManagementPage() {
  const { menuItems, error } = await getMenuItems()

  return (
    <div className="container mx-auto p-7 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 text-primary mb-1">
            <Hamburger className="h-6 w-6" />
            <h2 className="text-3xl font-bold tracking-tight">Burger Menu</h2>
          </div>
          <p className="text-muted-foreground">
            Manage your burger selection, specialty sides, and combo deals.
          </p>
        </div>

        <AddMenuDialog />
      </div>
      <Separator className="my-6" />
      <DataTable columns={columns} data={menuItems || []} />
    </div>
  )
}
