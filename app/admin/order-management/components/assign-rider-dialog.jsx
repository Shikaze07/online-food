"use client"

import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import { Loader2, Bike, Search, Check } from "lucide-react"
import { getDeliveryPersonnel, assignDelivery } from "@/lib/actions/delivery-actions"

export function AssignRiderDialog({ order, open, onOpenChange }) {
  const [loading, setLoading] = useState(false)
  const [fetchingRiders, setFetchingRiders] = useState(false)
  const [riders, setRiders] = useState([])
  const [riderSearch, setRiderSearch] = useState("")
  const [selectedRiderId, setSelectedRiderId] = useState("")

  const filteredRiders = riders.filter(r => 
    `${r.firstName} ${r.lastName}`.toLowerCase().includes(riderSearch.toLowerCase())
  )

  useEffect(() => {
    if (open) {
      const fetchRiders = async () => {
        setFetchingRiders(true)
        const result = await getDeliveryPersonnel()
        if (result.personnel) {
          setRiders(result.personnel)
        } else {
          toast.error("Failed to fetch available riders")
        }
        setFetchingRiders(false)
      }
      fetchRiders()
    }
  }, [open])

  const handleAssign = async () => {
    if (!selectedRiderId) {
      toast.error("Please select a rider")
      return
    }

    setLoading(true)
    try {
      const result = await assignDelivery(order.id, parseInt(selectedRiderId))
      if (result.success) {
        toast.success(`Order #${order.id} accepted and assigned to rider`)
        onOpenChange(false)
        setSelectedRiderId("")
        setRiderSearch("")
      } else {
        toast.error(result.error || "Failed to assign rider")
      }
    } catch (error) {
      toast.error("An unexpected error occurred")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[450px]">
        <DialogHeader>
          <div className="flex items-center gap-2 text-primary mb-1">
            <Bike className="h-5 w-5" />
            <DialogTitle>Accept & Assign Rider</DialogTitle>
          </div>
          <DialogDescription>
            Select a rider to assign to order <span className="font-bold text-foreground">#{order?.id}</span>. This will set the order status to Preparing.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-6 py-4">
          <div className="flex flex-col gap-3 p-3 border rounded-lg bg-muted/20">
            <Label htmlFor="rider-search" className="font-semibold">Available Riders</Label>
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                id="rider-search"
                placeholder="Search rider name..."
                className="pl-9 h-9"
                value={riderSearch}
                onChange={(e) => setRiderSearch(e.target.value)}
              />
            </div>
            
            <div className="grid gap-2 max-h-[180px] overflow-y-auto pr-2 custom-scrollbar">
              {fetchingRiders ? (
                <p className="text-sm text-center py-4 text-muted-foreground italic">Fetching riders...</p>
              ) : filteredRiders.length === 0 ? (
                <p className="text-sm text-center py-4 text-muted-foreground italic">
                  {riderSearch ? "No riders match your search" : "No available riders found"}
                </p>
              ) : (
                filteredRiders.map((rider) => (
                  <Button
                    key={rider.id}
                    variant={selectedRiderId === rider.id.toString() ? "default" : "outline"}
                    className={`justify-start gap-2 h-10 px-3 ${
                      selectedRiderId === rider.id.toString() 
                        ? "bg-primary text-primary-foreground shadow-sm" 
                        : "hover:bg-muted/50"
                    }`}
                    onClick={() => setSelectedRiderId(rider.id.toString())}
                  >
                    <div className={`flex size-6 items-center justify-center rounded-full border ${
                      selectedRiderId === rider.id.toString() 
                        ? "bg-primary-foreground text-primary border-primary-foreground" 
                        : "border-muted-foreground/30"
                    }`}>
                      {selectedRiderId === rider.id.toString() ? (
                        <Check className="h-3.5 w-3.5" />
                      ) : (
                        <span className="text-[10px] font-bold">{rider.firstName[0]}{rider.lastName[0]}</span>
                      )}
                    </div>
                    <span>{rider.firstName} {rider.lastName}</span>
                  </Button>
                ))
              )}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleAssign} disabled={loading || !selectedRiderId || fetchingRiders}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Assigning...
              </>
            ) : (
              "Confirm & Assign"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
