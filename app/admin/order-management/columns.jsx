"use client"

import { useState } from "react"
import {
  MoreHorizontal,
  Pencil,
  Trash2,
  Eye,
  User,
  MapPin,
  CircleDollarSign,
  Calendar,
  Bike,
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { OrderStatusBadge } from "./components/order-status-badge"
import { UpdateOrderStatusDialog } from "./components/update-order-status-dialog"
import { ViewOrderItemsDialog } from "./components/view-order-items-dialog"
import { AssignRiderDialog } from "./components/assign-rider-dialog"
import { ConfirmationDialog } from "@/components/shared/confirmation-dialog"
import { deleteOrder } from "@/lib/actions/order-actions"

export const columns = [
  {
    accessorKey: "id",
    header: "Order ID",
    cell: ({ row }) => {
      return (
        <span className="font-bold text-primary">#{row.getValue("id")}</span>
      )
    },
  },
  {
    accessorKey: "customer",
    header: "Customer",
    cell: ({ row }) => {
      const customer = row.original.customer
      return (
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5 font-medium">
            <User className="h-3.5 w-3.5 text-muted-foreground" />
            {customer.firstName} {customer.lastName}
          </div>
          <span className="text-xs text-muted-foreground ml-5">{customer.email}</span>
        </div>
      )
    },
  },
  {
    accessorKey: "address",
    header: "Delivery Address",
    cell: ({ row }) => {
      return (
        <div className="flex items-center gap-2 max-w-[200px]">
          <MapPin className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
          <span className="truncate text-sm">{row.getValue("address")}</span>
        </div>
      )
    },
  },
  {
    accessorKey: "totalAmount",
    header: "Amount",
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue("totalAmount"))
      const formatted = new Intl.NumberFormat("en-PH", {
        style: "currency",
        currency: "PHP",
      }).format(amount)
      return (
        <div className="flex items-center gap-1.5 font-bold">
          <CircleDollarSign className="h-3.5 w-3.5 text-emerald-600" />
          {formatted}
        </div>
      )
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      return <OrderStatusBadge status={row.getValue("status")} />
    },
  },
  {
    accessorKey: "createdAt",
    header: "Date",
    cell: ({ row }) => {
      return (
        <div className="flex items-center gap-1.5 text-muted-foreground whitespace-nowrap">
          <Calendar className="h-3.5 w-3.5" />
          {new Intl.DateTimeFormat("en-US", {
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
          }).format(new Date(row.getValue("createdAt")))}
        </div>
      )
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const order = row.original
      const [editOpen, setEditOpen] = useState(false)
      const [viewOpen, setViewOpen] = useState(false)
      const [assignOpen, setAssignOpen] = useState(false)
      const [showDeleteDialog, setShowDeleteDialog] = useState(false)
      const [isLoading, setIsLoading] = useState(false)

      const handleDelete = async () => {
        setIsLoading(true)
        const result = await deleteOrder(order.id)
        setIsLoading(false)
        setShowDeleteDialog(false)
        if (result.success) {
          toast.success("Order deleted successfully")
        } else {
          toast.error(result.error || "Failed to delete order")
        }
      }

      return (
        <>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[160px]">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => setViewOpen(true)}>
                <Eye className="mr-2 h-4 w-4" />
                View Details
              </DropdownMenuItem>
              {order.status === "PENDING" && (
                <DropdownMenuItem onClick={() => setAssignOpen(true)} className="text-primary focus:bg-primary/10 focus:text-primary">
                  <Bike className="mr-2 h-4 w-4" />
                  Accept & Assign Rider
                </DropdownMenuItem>
              )}
              <DropdownMenuItem onClick={() => setEditOpen(true)}>
                <Pencil className="mr-2 h-4 w-4" />
                Update Status
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={() => setShowDeleteDialog(true)}
                className="text-destructive focus:bg-destructive/10 focus:text-destructive"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete Order
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <UpdateOrderStatusDialog
            order={order}
            open={editOpen}
            onOpenChange={setEditOpen}
          />

          <ViewOrderItemsDialog
            order={order}
            open={viewOpen}
            onOpenChange={setViewOpen}
          />

          <AssignRiderDialog
            order={order}
            open={assignOpen}
            onOpenChange={setAssignOpen}
          />

          <ConfirmationDialog
            open={showDeleteDialog}
            onOpenChange={setShowDeleteDialog}
            onConfirm={handleDelete}
            isLoading={isLoading}
            title="Delete Order?"
            description={`Are you sure you want to delete order #${order.id}? This action cannot be undone.`}
            confirmText="Delete"
            variant="destructive"
          />
        </>
      )
    },
  },
]
