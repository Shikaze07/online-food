"use client"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"

export function ViewOrderItemsDialog({ order, open, onOpenChange }) {
  if (!order) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle>Order Details #{order.id}</DialogTitle>
          <DialogDescription>
            List of items and customer details for this order.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground font-medium mb-1">Customer</p>
              <p className="font-semibold text-base">
                {order.customer.firstName} {order.customer.lastName}
              </p>
              <p className="text-muted-foreground">{order.customer.email}</p>
              <p className="text-muted-foreground">{order.customer.phone || "No phone provided"}</p>
            </div>
            <div>
              <p className="text-muted-foreground font-medium mb-1">Delivery Address</p>
              <p className="font-medium">{order.address}</p>
            </div>
          </div>

          <Separator />

          <div>
            <p className="text-muted-foreground font-medium mb-3 underline">Order Items</p>
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="h-10">Item</TableHead>
                  <TableHead className="h-10 text-center">Qty</TableHead>
                  <TableHead className="h-10 text-right">Price</TableHead>
                  <TableHead className="h-10 text-right">Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {order.orderItems.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="py-3">
                      <p className="font-medium">{item.menuItem.name}</p>
                      <p className="text-xs text-muted-foreground">{item.menuItem.category}</p>
                    </TableCell>
                    <TableCell className="text-center py-3">{item.quantity}</TableCell>
                    <TableCell className="text-right py-3">${item.price.toFixed(2)}</TableCell>
                    <TableCell className="text-right font-medium py-3">
                      ${(item.price * item.quantity).toFixed(2)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <Separator />

          <div className="flex justify-between items-center bg-muted/30 p-4 rounded-lg border border-border/50">
            <p className="font-bold text-lg">Total Amount</p>
            <p className="font-bold text-xl text-primary">${order.totalAmount.toFixed(2)}</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
