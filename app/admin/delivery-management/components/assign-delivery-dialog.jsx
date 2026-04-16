"use client"

import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import { assignDelivery, getDeliveryPersonnel } from "@/lib/actions/delivery-actions"
import { getOrders } from "@/lib/actions/order-actions"
import { PlusCircle, Truck, Search, Check } from "lucide-react"

export function AssignDeliveryDialog() {
  const [open, setOpen] = useState(false)
  const [orders, setOrders] = useState([])
  const [personnel, setPersonnel] = useState([])
  const [riderSearch, setRiderSearch] = useState("")
  const [selectedOrder, setSelectedOrder] = useState("")
  const [selectedPerson, setSelectedPerson] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isFetching, setIsFetching] = useState(false)

  const filteredPersonnel = personnel.filter(p => 
    `${p.firstName} ${p.lastName}`.toLowerCase().includes(riderSearch.toLowerCase())
  )

  const fetchData = async () => {
    setIsFetching(true)
    const [ordersRes, personnelRes] = await Promise.all([
      getOrders(),
      getDeliveryPersonnel()
    ])
    setIsFetching(false)

    if (ordersRes.orders) {
      // Filter orders that don't have a delivery record yet
      const unassigned = ordersRes.orders.filter(o => !o.delivery)
      setOrders(unassigned)
    }
    if (personnelRes.personnel) {
      setPersonnel(personnelRes.personnel)
    }
  }

  useEffect(() => {
    if (open) {
      fetchData()
    }
  }, [open])

  const handleAssign = async () => {
    if (!selectedOrder || !selectedPerson) {
      toast.error("Please select both an order and a delivery person")
      return
    }

    setIsLoading(true)
    const result = await assignDelivery(parseInt(selectedOrder), parseInt(selectedPerson))
    setIsLoading(false)

    if (result.success) {
      toast.success("Delivery assigned successfully")
      setOpen(false)
      setSelectedOrder("")
      setSelectedPerson("")
    } else {
      toast.error(result.error || "Failed to assign delivery")
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <PlusCircle className="h-4 w-4" />
          Assign Rider
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[450px]">
        <DialogHeader>
          <div className="flex items-center gap-2 text-primary mb-1">
            <h2 className="text-3xl font-bold tracking-tight">Rider Management</h2>
          </div>
          <p className="text-muted-foreground">
            Monitor delivery progress and assign riders to new orders.
          </p>
        </DialogHeader>
        <div className="grid gap-6 py-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="order">Select Order</Label>
            <Select value={selectedOrder} onValueChange={setSelectedOrder}>
              <SelectTrigger id="order">
                <SelectValue placeholder={isFetching ? "Loading orders..." : "Select Order ID"} />
              </SelectTrigger>
              <SelectContent>
                {orders.length === 0 && !isFetching && (
                  <p className="p-2 text-sm text-muted-foreground">No unassigned orders found</p>
                )}
                {orders.map((o) => (
                  <SelectItem key={o.id} value={o.id.toString()}>
                    Order #{o.id} - {o.customer.firstName} ({o.address})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-3 p-3 border rounded-lg bg-muted/20">
            <Label htmlFor="person" className="font-semibold">Available Riders</Label>
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search rider name..."
                className="pl-9 h-9"
                value={riderSearch}
                onChange={(e) => setRiderSearch(e.target.value)}
              />
            </div>
            
            <div className="grid gap-2 max-h-[150px] overflow-y-auto pr-2 custom-scrollbar">
              {isFetching ? (
                <p className="text-sm text-center py-4 text-muted-foreground italic">Fetching personnel...</p>
              ) : filteredPersonnel.length === 0 ? (
                <p className="text-sm text-center py-4 text-muted-foreground italic">
                  {riderSearch ? "No riders match your search" : "No delivery personnel found"}
                </p>
              ) : (
                filteredPersonnel.map((p) => (
                  <Button
                    key={p.id}
                    variant={selectedPerson === p.id.toString() ? "default" : "outline"}
                    className={`justify-start gap-2 h-9 px-3 ${
                      selectedPerson === p.id.toString() 
                        ? "bg-primary text-primary-foreground shadow-sm" 
                        : "hover:bg-muted/50"
                    }`}
                    onClick={() => setSelectedPerson(p.id.toString())}
                  >
                    <div className={`flex size-5 items-center justify-center rounded-full border ${
                      selectedPerson === p.id.toString() ? "bg-primary-foreground text-primary border-primary-foreground" : "border-muted-foreground/30"
                    }`}>
                      {selectedPerson === p.id.toString() ? (
                        <Check className="h-3 w-3" />
                      ) : (
                        <span className="text-[10px] font-bold">{p.firstName[0]}{p.lastName[0]}</span>
                      )}
                    </div>
                    <span>{p.firstName} {p.lastName}</span>
                  </Button>
                ))
              )}
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button type="button" onClick={handleAssign} disabled={isLoading || isFetching}>
            {isLoading ? "Assigning..." : "Confirm Assignment"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
