"use client"

import { useState } from "react"
import {
  MoreHorizontal,
  Pencil,
  Trash2,
  Bike,
  User,
  MapPin,
  Calendar,
  Hash,
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
import { DeliveryStatusBadge } from "./components/delivery-status-badge"
import { UpdateDeliveryStatusDialog } from "./components/update-delivery-status-dialog"
import { ConfirmationDialog } from "@/components/shared/confirmation-dialog"
import { deleteDelivery } from "@/lib/actions/delivery-actions"

export const columns = [
  {
    accessorKey: "id",
    header: "Delivery ID",
    cell: ({ row }) => {
      return (
        <span className="font-bold text-primary">#{row.getValue("id")}</span>
      )
    },
  },
  {
    accessorKey: "orderId",
    header: "Order",
    cell: ({ row }) => {
      return (
        <div className="flex items-center gap-1.5 font-medium">
          <Hash className="h-3.5 w-3.5 text-muted-foreground" />
          Order #{row.getValue("orderId")}
        </div>
      )
    },
  },
  {
    accessorKey: "deliveryPerson",
    header: "Delivery Personnel",
    cell: ({ row }) => {
      const person = row.original.deliveryPerson
      return (
        <div className="flex items-center gap-1.5 font-medium">
          <User className="h-3.5 w-3.5 text-muted-foreground" />
          {person.firstName} {person.lastName}
        </div>
      )
    },
  },
  {
    accessorKey: "currentLocation",
    header: "Current Location",
    cell: ({ row }) => {
      const location = row.getValue("currentLocation")
      return (
        <div className="flex items-center gap-2 max-w-[180px]">
          <MapPin className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
          <span className="truncate text-sm italic">
            {location || "Location not set"}
          </span>
        </div>
      )
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      return <DeliveryStatusBadge status={row.getValue("status")} />
    },
  },
  {
    accessorKey: "updatedAt",
    header: "Last Update",
    cell: ({ row }) => {
      return (
        <div className="flex items-center gap-1.5 text-muted-foreground whitespace-nowrap">
          <Calendar className="h-3.5 w-3.5" />
          {new Intl.DateTimeFormat("en-US", {
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          }).format(new Date(row.getValue("updatedAt")))}
        </div>
      )
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const delivery = row.original
      const [editOpen, setEditOpen] = useState(false)
      const [showDeleteDialog, setShowDeleteDialog] = useState(false)
      const [isLoading, setIsLoading] = useState(false)

      const handleDelete = async () => {
        setIsLoading(true)
        const result = await deleteDelivery(delivery.id)
        setIsLoading(false)
        setShowDeleteDialog(false)
        if (result.success) {
          toast.success("Delivery record removed")
        } else {
          toast.error(result.error || "Failed to remove delivery")
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
                Remove Record
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <UpdateDeliveryStatusDialog
            delivery={delivery}
            open={editOpen}
            onOpenChange={setEditOpen}
          />

          <ConfirmationDialog
            open={showDeleteDialog}
            onOpenChange={setShowDeleteDialog}
            onConfirm={handleDelete}
            isLoading={isLoading}
            title="Remove Delivery Record?"
            description="Are you sure you want to remove this delivery record? This will not delete the order itself."
            confirmText="Remove"
            variant="destructive"
          />
        </>
      )
    },
  },
]
