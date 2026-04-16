"use client"

import { useState, useEffect } from "react"
import { getRiderDeliveries, updateDeliveryStatus, getDeliveryPersonnel } from "@/lib/actions/delivery-actions"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { toast } from "sonner"
import { 
  Loader2, 
  MapPin, 
  Phone, 
  Package, 
  Truck, 
  CheckCircle2, 
  User,
  Clock,
  ChevronRight
} from "lucide-react"
import { useRouter } from "next/navigation"

export default function OrderAssignmentPage() {
  const router = useRouter()
  const [deliveries, setDeliveries] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedRiderId, setSelectedRiderId] = useState("")

  // Automically select the first rider as "logged in" since auth is pending
  useEffect(() => {
    async function init() {
      const res = await getDeliveryPersonnel()
      if (res.personnel && res.personnel.length > 0) {
        setSelectedRiderId(res.personnel[0].id.toString())
      }
      setLoading(false)
    }
    init()
  }, [])

  // Fetch deliveries for the current rider
  useEffect(() => {
    if (!selectedRiderId) return
    async function load() {
      const res = await getRiderDeliveries(selectedRiderId)
      if (res.deliveries) setDeliveries(res.deliveries)
    }
    load()
  }, [selectedRiderId])

  const handleStatusUpdate = async (deliveryId, newStatus) => {
    setLoading(true)
    try {
      const res = await updateDeliveryStatus(deliveryId, { status: newStatus })
      if (res.success) {
        toast.success(`Status updated to ${newStatus}`)
        if (newStatus === "PICKED_UP") {
          router.push("/rider/delivery-tracking")
        } else {
          const updated = await getRiderDeliveries(selectedRiderId)
          if (updated.deliveries) setDeliveries(updated.deliveries)
        }
      } else {
        toast.error(res.error || "Update failed")
      }
    } catch (error) {
      toast.error("An unexpected error occurred")
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status) => {
    switch (status) {
      case "ASSIGNED": return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Pending Pickup</Badge>
      case "PICKED_UP": return <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">Picked Up</Badge>
      case "ON_THE_WAY": return <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">On the Way</Badge>
      case "DELIVERED": return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Delivered</Badge>
      default: return <Badge variant="secondary">{status}</Badge>
    }
  }

  return (
    <div className="container mx-auto p-4 md:p-6 max-w-4xl space-y-6">
      <div className="flex items-center gap-3 mb-2">
        <Package className="h-6 w-6 text-primary" />
        <h1 className="text-2xl font-bold tracking-tight italic">Active Assignments</h1>
      </div>

      {loading && !deliveries.length ? (
        <div className="flex flex-col items-center justify-center py-12 space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Checking your assignments...</p>
        </div>
      ) : deliveries.length === 0 ? (
        <Card className="bg-muted/30 border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16 space-y-4">
            <div className="h-16 w-16 bg-muted rounded-full flex items-center justify-center">
              <Truck className="h-8 w-8 text-muted-foreground" />
            </div>
            <div className="text-center">
              <h3 className="text-lg font-semibold">No active assignments</h3>
              <p className="text-muted-foreground">Refresh the page or check back later for new orders.</p>
            </div>
            <Button variant="outline" onClick={() => window.location.reload()}>Refresh</Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6">
          {deliveries.map((delivery) => (
            <Card key={delivery.id} className="overflow-hidden border-border/60 hover:shadow-md transition-all">
              <CardHeader className="bg-muted/40 pb-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold font-mono text-muted-foreground tracking-widest uppercase">
                      Order #{delivery.order.id}
                    </span>
                    <Separator orientation="vertical" className="h-3" />
                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      {new Date(delivery.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  {getStatusBadge(delivery.status)}
                </div>
                <CardTitle className="text-xl flex items-center gap-2 italic">
                  <User className="h-5 w-5 text-primary" />
                  {delivery.order.customer.firstName} {delivery.order.customer.lastName}
                </CardTitle>
                <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                  <Phone className="h-3.5 w-3.5 italic" />
                  {delivery.order.customer.phone || "---"}
                </div>
              </CardHeader>
              <CardContent className="p-5 space-y-4">
                <div className="flex items-start gap-3 bg-muted/20 p-3 rounded-lg border border-border/40">
                  <MapPin className="h-5 w-5 text-destructive mt-0.5 shrink-0" />
                  <div className="text-sm">
                    <p className="font-semibold mb-0.5 text-foreground">Delivery Address</p>
                    <p className="text-muted-foreground leading-snug">{delivery.order.address}</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="text-xs font-bold uppercase text-muted-foreground tracking-wider underline-offset-4 underline decoration-primary/30">Order Items</p>
                  <div className="space-y-1.5">
                    {delivery.order.orderItems.map((item) => (
                      <div key={item.id} className="flex justify-between text-sm">
                        <span className="flex items-center gap-2">
                          <Badge variant="secondary" className="h-5 px-1.5 font-mono text-[10px]">{item.quantity}x</Badge>
                          <span className="font-medium italic">{item.menuItem.name}</span>
                        </span>
                        <span className="text-muted-foreground">₱{item.price.toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
              <CardFooter className="bg-muted/20 p-4 border-t gap-3">
                {delivery.status === "ASSIGNED" && (
                  <Button 
                    className="w-full font-bold gap-2" 
                    onClick={() => handleStatusUpdate(delivery.id, "PICKED_UP")}
                    disabled={loading}
                  >
                    {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Package className="h-4 w-4" />}
                    Confirm Pickup
                  </Button>
                )}
                {delivery.status === "PICKED_UP" && (
                  <Button 
                    variant="warning"
                    className="w-full font-bold gap-2 bg-amber-500 hover:bg-amber-600 text-white" 
                    onClick={() => handleStatusUpdate(delivery.id, "ON_THE_WAY")}
                    disabled={loading}
                  >
                    {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Truck className="h-4 w-4" />}
                    Start Delivery
                  </Button>
                )}
                {(delivery.status === "ON_THE_WAY") && (
                  <Button 
                    className="w-full font-bold gap-2 bg-green-600 hover:bg-green-700 text-white" 
                    onClick={() => handleStatusUpdate(delivery.id, "DELIVERED")}
                    disabled={loading}
                  >
                    {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                    Complete Delivery
                  </Button>
                )}
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
