"use client"

import { useState } from "react"
import {
  MoreHorizontal,
  Pencil,
  Trash2,
  UtensilsCrossed,
  CheckCircle2,
  XCircle,
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
import { EditMenuDialog } from "./components/edit-menu-dialog"
import { Badge } from "@/components/ui/badge"
import { ConfirmationDialog } from "@/components/shared/confirmation-dialog"
import { deleteMenuItem, toggleMenuItemAvailability } from "@/lib/actions/menu-actions"
import Image from "next/image"

export const columns = [
  {
    accessorKey: "name",
    header: "Item",
    cell: ({ row }) => {
      const imageUrl = row.original.imageUrl
      return (
        <div className="flex items-center gap-3">
          {imageUrl ? (
            <div className="relative h-10 w-10 rounded-md overflow-hidden shrink-0 border border-border">
              <Image src={imageUrl} alt={row.getValue("name")} fill sizes="40px" className="object-cover" />
            </div>
          ) : (
            <div className="h-10 w-10 rounded-md bg-muted flex items-center justify-center shrink-0 border border-border">
              <UtensilsCrossed className="h-4 w-4 text-muted-foreground" />
            </div>
          )}
          <span className="font-medium">{row.getValue("name")}</span>
        </div>
      )
    },
  },
  {
    accessorKey: "price",
    header: "Price",
    cell: ({ row }) => {
      const price = parseFloat(row.getValue("price"))
      const formatted = new Intl.NumberFormat("en-PH", {
        style: "currency",
        currency: "PHP",
      }).format(price)
      return <div className="font-medium">{formatted}</div>
    },
  },
  {
    accessorKey: "category",
    header: "Category",
    cell: ({ row }) => {
      return (
        <Badge variant="secondary" className="font-medium">
          {row.getValue("category")}
        </Badge>
      )
    },
  },
  {
    accessorKey: "isAvailable",
    header: "Availability",
    cell: ({ row }) => {
      const isAvailable = row.getValue("isAvailable")
      return (
        <Badge
          variant={isAvailable ? "default" : "destructive"}
          className={`gap-1.5 px-2.5 py-0.5 font-medium ${
            isAvailable
              ? "bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 border-emerald-500/20"
              : "bg-red-500/10 text-red-600 hover:bg-red-500/20 border-red-500/20"
          }`}
        >
          {isAvailable ? (
            <CheckCircle2 className="h-3.5 w-3.5" />
          ) : (
            <XCircle className="h-3.5 w-3.5" />
          )}
          {isAvailable ? "In Stock" : "Sold Out"}
        </Badge>
      )
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const item = row.original
      const [editOpen, setEditOpen] = useState(false)
      const [showDeleteDialog, setShowDeleteDialog] = useState(false)
      const [isLoading, setIsLoading] = useState(false)

      const handleDelete = async () => {
        setIsLoading(true)
        const result = await deleteMenuItem(item.id)
        setIsLoading(false)
        setShowDeleteDialog(false)
        if (result.success) {
          toast.success("Dish removed successfully")
        } else {
          toast.error(result.error || "Failed to remove dish")
        }
      }

      const handleToggle = async () => {
        const result = await toggleMenuItemAvailability(item.id, item.isAvailable)
        if (result.success) {
          toast.success(`Dish marked as ${!item.isAvailable ? "in stock" : "sold out"}`)
        } else {
          toast.error(result.error || "Failed to update status")
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
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => setEditOpen(true)}>
                <Pencil className="mr-2 h-4 w-4" />
                Edit Burger
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleToggle}>
                {item.isAvailable ? (
                  <div className="flex items-center text-amber-600">
                    <XCircle className="mr-2 h-4 w-4" />
                    Mark Sold Out
                  </div>
                ) : (
                  <div className="flex items-center text-emerald-600">
                    <CheckCircle2 className="mr-2 h-4 w-4" />
                    Back on Menu
                  </div>
                )}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={() => setShowDeleteDialog(true)}
                className="text-destructive focus:bg-destructive/10 focus:text-destructive"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <EditMenuDialog
            item={item}
            open={editOpen}
            onOpenChange={setEditOpen}
          />

          <ConfirmationDialog
            open={showDeleteDialog}
            onOpenChange={setShowDeleteDialog}
            onConfirm={handleDelete}
            isLoading={isLoading}
            title="Remove from Menu?"
            description={`Are you sure you want to remove "${item.name}" from the burger menu?`}
            confirmText="Remove"
            variant="destructive"
          />
        </>
      )
    },
  },
]
