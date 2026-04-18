"use client"

import { useState, useEffect } from "react"
import { useCart } from "@/context/cart-context"
import { createOrder } from "@/lib/actions/order-actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import dynamic from "next/dynamic"
import {
  IconMapPin,
  IconCreditCard,
  IconWallet,
  IconCash,
  IconCheck,
  IconLoader2,
  IconChevronLeft,
} from "@tabler/icons-react"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Separator } from "@/components/ui/separator"
import Link from "next/link"
import {
  Field,
  FieldError,
} from "@/components/ui/field"

const LocationPicker = dynamic(() => import("@/components/location-picker"), { 
  ssr: false,
  loading: () => (
    <div className="h-[300px] w-full bg-muted/20 flex flex-col items-center justify-center space-y-4 rounded-xl border border-dashed border-border">
      <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      <p className="text-sm text-muted-foreground animate-pulse">Warming up map engines...</p>
    </div>
  )
})

export default function PayoutPage() {
  const { cartItems, totalPrice, clearCart } = useCart()
  const [address, setAddress] = useState("")
  const [addressError, setAddressError] = useState("")
  const [paymentMethod, setPaymentMethod] = useState("COD")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isDetecting, setIsDetecting] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [placedOrderId, setPlacedOrderId] = useState(null)
  const [coords, setCoords] = useState({ lat: null, lng: null })
  const router = useRouter()

  const detectLocation = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by your browser")
      return
    }
    
    setIsDetecting(true)
    
    const options = {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 0
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords
        setCoords({ lat: latitude, lng: longitude })

        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}`
          )
          const data = await response.json()
          
          if (data && data.display_name) {
            setAddress(data.display_name)
            setAddressError("")
            toast.success("Location accurately pinned!")
          } else {
            setAddress(`${latitude.toFixed(4)}, ${longitude.toFixed(4)}`)
            toast.warning("Location pinned, but couldn't resolve address.")
          }
        } catch (error) {
          console.error("Reverse geocoding failed:", error)
          setAddress(`${latitude.toFixed(4)}, ${longitude.toFixed(4)}`)
          toast.warning("Location pinned, but couldn't resolve address.")
        }
        
        setIsDetecting(false)
      },
      (error) => {
        setIsDetecting(false)
        const errorMsg = error.code === 1 
          ? "Location permission denied. Please enable it in your browser settings."
          : "Unable to retrieve your location. Please check your signal/GPS."
        
        toast.error(errorMsg)
      },
      options
    )
  }

  const handleLocationChange = async (newCoords) => {
    setCoords(newCoords)
    
    // Perform reverse geocoding for the new coordinates
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${newCoords.lat}&lon=${newCoords.lng}`
      )
      const data = await response.json()
      
      if (data && data.display_name) {
        setAddress(data.display_name)
        setAddressError("")
      }
    } catch (error) {
      console.error("Reverse geocoding failed:", error)
    }
  }

  useEffect(() => {
    detectLocation()
  }, [])

  const handlePlaceOrder = async (e) => {
    e.preventDefault()
    
    if (!address || address.length < 5) {
      setAddressError("Please provide a complete delivery address (min 5 characters)")
      toast.error("Delivery address is required")
      return
    }

    setAddressError("")

    if (!paymentMethod) {
      toast.error("Please select a payment method")
      return
    }

    setIsSubmitting(true)
    const result = await createOrder({
      items: cartItems,
      address,
      paymentMethod,
      totalAmount: totalPrice,
      lat: coords.lat,
      lng: coords.lng,
    })
    setIsSubmitting(false)

    console.log("Order result from server:", result)

    if (result.success) {
      setPlacedOrderId(result.orderId)
      setIsModalOpen(true)
      clearCart()
      toast.success("Order placed successfully!")
    } else {
      toast.error(result.error || "Failed to place order")
      console.error("Order Submission Detail:", result)
    }
  }


  return (
    <div className="container mx-auto p-7 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center gap-4">
        <Button asChild variant="ghost" size="icon" className="rounded-full">
          <Link href="/customer/cart-management">
            <IconChevronLeft className="h-6 w-6" />
          </Link>
        </Button>
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Checkout & Payout</h2>
          <p className="text-muted-foreground italic text-sm">One last step before you enjoy your meal.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        <div className="lg:col-span-3 space-y-8">
          {/* Delivery Section */}
          <Card className="border-muted/60 shadow-sm bg-card/50 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg text-primary">
                <IconMapPin className="h-6 w-6" />
              </div>
              <div>
                <CardTitle>Delivery Address</CardTitle>
                <CardDescription>Verify your delivery location on the map for 100% accuracy.</CardDescription>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <LocationPicker 
                  value={coords.lat ? coords : null} 
                  onChange={handleLocationChange}
                  className="h-[300px] w-full"
                />
                
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="w-full gap-2 h-10 font-bold border-primary/20 hover:bg-primary/5 text-primary"
                  onClick={detectLocation}
                  disabled={isDetecting}
                >
                  {isDetecting ? (
                    <>
                      <IconLoader2 className="h-4 w-4 animate-spin" />
                      Pinpointing...
                    </>
                  ) : (
                    <>
                      <IconMapPin className="h-4 w-4" />
                      Re-detect My Current Location
                    </>
                  )}
                </Button>
              </div>

              <Separator className="bg-primary/5" />

              <Field data-invalid={!!addressError}>
                <Label htmlFor="address" className="flex justify-between items-center group">
                  <span>Street Address / Building Details <span className="text-destructive">*</span></span>
                  <span className="text-[10px] text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity uppercase tracking-wider">Required</span>
                </Label>
                <Input
                  id="address"
                  placeholder="e.g., House 123, Street Name, Barangay"
                  className="h-12 bg-background border-muted/80 transition-all focus:ring-2 focus:ring-primary/20"
                  value={address}
                  onChange={(e) => {
                    setAddress(e.target.value)
                    if (addressError) setAddressError("")
                  }}
                  required
                />
                <FieldError>{addressError}</FieldError>
              </Field>
            </CardContent>
          </Card>

          {/* Payment Section */}
          <Card className="border-muted/60 shadow-sm bg-card/50 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg text-primary">
                <IconCreditCard className="h-6 w-6" />
              </div>
              <div>
                <CardTitle>Payment Method</CardTitle>
                <CardDescription>Select how you want to pay.</CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div
                  onClick={() => setPaymentMethod("GCASH")}
                  className={`flex items-center justify-between p-4 rounded-xl border-2 transition-all cursor-pointer hover:bg-muted/30 ${
                    paymentMethod === "GCASH" ? "border-primary bg-primary/5 ring-1 ring-primary" : "border-muted"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-600/10 rounded-lg text-blue-600">
                      <IconWallet className="h-6 w-6" />
                    </div>
                    <div>
                      <p className="font-bold">GCash</p>
                      <p className="text-xs text-muted-foreground">Digital Wallet</p>
                    </div>
                  </div>
                  {paymentMethod === "GCASH" && <IconCheck className="h-5 w-5 text-primary animate-in zoom-in" />}
                </div>

                <div
                  onClick={() => setPaymentMethod("COD")}
                  className={`flex items-center justify-between p-4 rounded-xl border-2 transition-all cursor-pointer hover:bg-muted/30 ${
                    paymentMethod === "COD" ? "border-primary bg-primary/5 ring-1 ring-primary" : "border-muted"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-600/10 rounded-lg text-green-600">
                      <IconCash className="h-6 w-6" />
                    </div>
                    <div>
                      <p className="font-bold">Cash on Delivery</p>
                      <p className="text-xs text-muted-foreground">Pay when food arrives</p>
                    </div>
                  </div>
                  {paymentMethod === "COD" && <IconCheck className="h-5 w-5 text-primary animate-in zoom-in" />}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Order Details Column */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-primary/20 shadow-xl overflow-hidden bg-background">
            <CardHeader className="bg-primary/5 border-b border-primary/10">
              <CardTitle className="text-xl">Your Order Details</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="p-6 space-y-4">
                <div className="max-h-[250px] overflow-y-auto space-y-3 pr-2 custom-scrollbar">
                  {cartItems.map((item) => (
                    <div key={item.id} className="flex justify-between items-center text-sm">
                      <div className="flex items-center gap-3">
                        <span className="font-bold text-primary bg-primary/10 size-6 rounded flex items-center justify-center text-[10px]">
                          {item.quantity}x
                        </span>
                        <span className="font-medium">{item.name}</span>
                      </div>
                      <span className="font-bold">₱{(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
                
                <Separator className="bg-primary/10" />
                
                <div className="space-y-2">
                  <div className="flex justify-between text-muted-foreground">
                    <span>Items Subtotal</span>
                    <span>₱{totalPrice.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>Delivery Charge</span>
                    <span className="text-green-600 font-medium">Free</span>
                  </div>
                  <div className="flex justify-between items-center pt-2">
                    <span className="text-xl font-extrabold tracking-tight">Grand Total</span>
                    <span className="text-3xl font-black text-primary">₱{totalPrice.toFixed(2)}</span>
                  </div>
                </div>

                <Button 
                  onClick={handlePlaceOrder}
                  disabled={isSubmitting || cartItems.length === 0}
                  className="w-full h-14 mt-4 text-lg font-black tracking-wide gap-3 shadow-lg hover:shadow-primary/20 transition-all"
                >
                  {isSubmitting ? (
                    <>
                      <IconLoader2 className="h-6 w-6 animate-spin" />
                      Finalizing Order...
                    </>
                  ) : (
                    "Place Secure Order"
                  )}
                </Button>
                
                <p className="text-[10px] text-center text-muted-foreground italic leading-tight pt-4">
                  By clicking "Place Secure Order", you agree to our Terms of Service and Privacy Policy.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Success Confirmation Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader className="flex flex-col items-center justify-center text-center space-y-4 pt-4">
            <div className="h-20 w-20 bg-primary/10 rounded-full flex items-center justify-center text-primary">
              <IconCheck className="h-12 w-12 stroke-[3]" />
            </div>
            <div className="space-y-2">
              <DialogTitle className="text-3xl font-black">Order Confirmed!</DialogTitle>
              <DialogDescription className="text-base">
                Your order <span className="font-bold text-foreground">#{placedOrderId}</span> has been placed successfully. 
                Our team is already preparing your delicious meal!
              </DialogDescription>
            </div>
          </DialogHeader>
          
          <div className="grid gap-3 pt-4">
            <Button asChild className="h-12 font-bold">
              <Link href="/customer/order-history">
                Track My Order
              </Link>
            </Button>
            <Button 
              variant="outline" 
              className="h-12 font-medium"
              onClick={() => {
                setIsModalOpen(false)
                router.push("/customer/menu")
              }}
            >
              Order Something Else
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
