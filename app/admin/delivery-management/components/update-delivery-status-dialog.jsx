"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { updateDeliveryStatus } from "@/lib/actions/delivery-actions"

const statuses = [
  { value: "ASSIGNED", label: "Assigned" },
  { value: "PICKED_UP", label: "Picked Up" },
  { value: "ON_THE_WAY", label: "On the Way" },
  { value: "DELIVERED", label: "Delivered" },
]

export function UpdateDeliveryStatusDialog({ delivery, open, onOpenChange }) {
  const [status, setStatus] = useState(delivery?.status || "ASSIGNED")
  const [location, setLocation] = useState(delivery?.currentLocation || "")
  const [isLoading, setIsLoading] = useState(false)

  const handleUpdate = async () => {
    setIsLoading(true)
    const result = await updateDeliveryStatus(delivery.id, { 
      status, 
      currentLocation: location 
    })
    setIsLoading(false)

    if (result.success) {
      toast.success("Delivery status updated successfully")
      onOpenChange(false)
    } else {
      toast.error(result.error || "Failed to update status")
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Update Delivery Status</DialogTitle>
          <DialogDescription>
            Modify the progress and location for delivery #{delivery?.id}.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-6 py-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="status">New Status</Label>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger id="status">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                {statuses.map((s) => (
                  <SelectItem key={s.value} value={s.value}>
                    {s.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="location">Current Location</Label>
            <Input
              id="location"
              placeholder="e.g., Near Main Street"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />
          </div>
        </div>
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button type="button" onClick={handleUpdate} disabled={isLoading}>
            {isLoading ? "Updating..." : "Update Delivery"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
