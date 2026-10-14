"use client"

import { useState, useEffect } from "react"
import dynamic from "next/dynamic"
import { getRiderActiveDelivery, updateDeliveryStatus } from "@/lib/actions/delivery-actions"
import { getCurrentUser } from "@/lib/actions/auth-actions"
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
  Navigation, 
  CheckCircle2, 
  User,
  AlertCircle,
  Truck,
  ExternalLink,
  Layers,
} from "lucide-react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

import {
  Map,
  MapControls,
  MapMarker,
  MarkerContent,
  MarkerPopup,
} from "@/components/ui/map"

const OSM_STYLE = {
  version: 8,
  sources: {
    osm: {
      type: "raster",
      tiles: ["https://tile.openstreetmap.org/{z}/{x}/{y}.png"],
      tileSize: 256,
      attribution: "\u00a9 <a href='https://www.openstreetmap.org/copyright'>OpenStreetMap</a> contributors",
    },
  },
  layers: [{ id: "osm-tiles", type: "raster", source: "osm" }],
}

const SATELLITE_STYLE = {
  version: 8,
  sources: {
    esri: {
      type: "raster",
      tiles: [
        "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
      ],
      tileSize: 256,
      attribution: "Tiles \u00a9 Esri \u2014 Source: Esri, USGS, AEX, GeoEye, Aerogrid, IGN",
    },
  },
  layers: [{ id: "satellite-tiles", type: "raster", source: "esri" }],
}

const MAP_STYLES = [
  {
    id: "street",
    label: "Street",
    styles: {
      light: "https://basemaps.cartocdn.com/gl/positron-gl-style/style.json",
      dark: "https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json",
    },
  },
  {
    id: "osm",
    label: "OpenStreetMap",
    styles: { light: OSM_STYLE, dark: OSM_STYLE },
  },
  {
    id: "satellite",
    label: "Satellite",
    styles: { light: SATELLITE_STYLE, dark: SATELLITE_STYLE },
  },
]

export default function DeliveryTrackingPage() {
  const [activeDelivery, setActiveDelivery] = useState(null)
  const [loading, setLoading] = useState(true)
  const [personnel, setPersonnel] = useState([])
  const [selectedRiderId, setSelectedRiderId] = useState("")
  const [updatingId, setUpdatingId] = useState(null)
  const [riderCoords, setRiderCoords] = useState(null)
  const [isInitialLoad, setIsInitialLoad] = useState(true)
  const [mapStyleId, setMapStyleId] = useState("street")

  useEffect(() => {
    if ("geolocation" in navigator) {
      const watchId = navigator.geolocation.watchPosition(
        (pos) => setRiderCoords([pos.coords.latitude, pos.coords.longitude]),
        (err) => console.log("Geolocation error:", err),
        { enableHighAccuracy: true }
      )
      return () => navigator.geolocation.clearWatch(watchId)
    }
  }, [])

  // Fetch active delivery for the logged in rider
  useEffect(() => {
    async function loadActiveDelivery(isInitial = false) {
      if (isInitial) setLoading(true)
      try {
        const user = await getCurrentUser()
        if (user && user.role === "RIDER") {
          setSelectedRiderId(user.id)
          const res = await getRiderActiveDelivery(user.id)
          if (res.delivery) {
            setActiveDelivery(res.delivery)
          } else {
            setActiveDelivery(null)
          }
        }
      } catch (error) {
        console.error("Failed to load delivery:", error)
      } finally {
        if (isInitial) setLoading(false)
      }
    }
    
    loadActiveDelivery(true)
    setIsInitialLoad(false)

    // Poll for updates every 30 seconds (silent refetch, no loading state)
    const interval = setInterval(() => loadActiveDelivery(false), 30000)
    return () => clearInterval(interval)
  }, [])

  const handleStatusUpdate = async (newStatus) => {
    if (!activeDelivery) return
    setUpdatingId(activeDelivery.id)
    try {
      const res = await updateDeliveryStatus(activeDelivery.id, { 
        status: newStatus,
        currentLocation: riderCoords ? `${riderCoords[0]},${riderCoords[1]}` : null
      })
      if (res.success) {
        toast.success(`Status updated to ${newStatus}`)
        if (newStatus === "DELIVERED") {
            setActiveDelivery(null)
        } else {
            const updated = await getRiderActiveDelivery(selectedRiderId)
            if (updated.delivery) setActiveDelivery(updated.delivery)
        }
      } else {
        toast.error(res.error || "Update failed")
      }
    } catch (error) {
      toast.error("An unexpected error occurred")
    } finally {
      setUpdatingId(null)
    }
  }

  // Use real coords from order if available, otherwise Koronadal City mock
  const customerCoords = activeDelivery?.order?.lat && activeDelivery?.order?.lng 
    ? [parseFloat(activeDelivery.order.lat), parseFloat(activeDelivery.order.lng)] 
    : [6.5034, 124.8465]

  return (
    <div className="container mx-auto p-4 md:p-6 max-w-5xl space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 bg-primary rounded-xl flex items-center justify-center text-primary-foreground shadow-lg">
            <Truck className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight italic">Live Delivery Tracking</h1>
            <p className="text-sm text-muted-foreground">Monitor progress and navigate to customer</p>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 space-y-4">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
          <p className="text-muted-foreground font-medium animate-pulse">Locating your current delivery...</p>
        </div>
      ) : !activeDelivery ? (
        <Card className="bg-muted/30 border-dashed py-20">
          <CardContent className="flex flex-col items-center justify-center space-y-6">
            <div className="h-20 w-20 bg-muted/50 rounded-full flex items-center justify-center border-4 border-background shadow-inner">
              <Navigation className="h-10 w-10 text-muted-foreground/50 rotate-45" />
            </div>
            <div className="text-center space-y-2">
              <h3 className="text-xl font-bold">No Active Deliveries</h3>
              <p className="text-muted-foreground max-w-sm mx-auto">
                You don't have any deliveries in progress. Go to the "Order Assignment" page to pick up a pending order.
              </p>
            </div>
            <Button size="lg" variant="default" className="font-bold group" onClick={() => window.location.href='/rider/order-assignment'}>
              View Assignments
              <ExternalLink className="ml-2 h-4 w-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Map */}
          <div className="lg:col-span-2 space-y-4">
            <Card className="overflow-hidden bg-card border-border/60 shadow-xl lg:h-[600px] flex flex-col">
              <CardContent className="p-0 flex-1 relative min-h-[400px]">
                <Map
                  center={[
                    riderCoords ? riderCoords[1] : customerCoords[1],
                    riderCoords ? riderCoords[0] : customerCoords[0],
                  ]}
                  zoom={14}
                  styles={MAP_STYLES.find((s) => s.id === mapStyleId)?.styles}
                  className="h-full w-full"
                >
                  <MapControls position="top-right" showZoom showCompass showFullscreen showLocate />

                  {/* Customer Destination Marker */}
                  <MapMarker
                    longitude={customerCoords[1]}
                    latitude={customerCoords[0]}
                  >
                    <MarkerContent>
                      <div className="flex items-center justify-center p-2 rounded-full bg-destructive text-white shadow-xl ring-4 ring-destructive/20 hover:scale-110 transition-transform cursor-pointer">
                        <MapPin className="h-5 w-5" />
                      </div>
                    </MarkerContent>
                    <MarkerPopup>
                      <div className="p-2 space-y-1 text-xs">
                        <p className="font-bold text-foreground">Customer Destination</p>
                        <p className="text-muted-foreground">{activeDelivery.order.address}</p>
                        <p className="font-semibold text-primary">
                          {activeDelivery.order.customer.firstName} {activeDelivery.order.customer.lastName}
                        </p>
                      </div>
                    </MarkerPopup>
                  </MapMarker>

                  {/* Rider Current Marker */}
                  {riderCoords && (
                    <MapMarker
                      longitude={riderCoords[1]}
                      latitude={riderCoords[0]}
                    >
                      <MarkerContent>
                        <div className="relative flex items-center justify-center">
                          <span className="absolute inline-flex h-full w-full rounded-full bg-primary opacity-60 animate-ping"></span>
                          <div className="flex items-center justify-center p-2 rounded-full bg-primary text-primary-foreground shadow-2xl ring-4 ring-primary/30 hover:scale-110 transition-transform cursor-pointer z-10">
                            <Truck className="h-5 w-5" />
                          </div>
                        </div>
                      </MarkerContent>
                      <MarkerPopup>
                        <div className="p-2 space-y-1 text-xs">
                          <p className="font-bold text-primary">Your Current Location</p>
                          <p className="text-muted-foreground">Live GPS Broadcast Active</p>
                        </div>
                      </MarkerPopup>
                    </MapMarker>
                  )}

                </Map>

                {/* Map Style Switcher */}
                <div className="absolute top-4 left-4 z-10 flex items-center gap-1 bg-background/90 backdrop-blur-md rounded-xl border border-border/70 shadow-lg p-1">
                  <Layers className="h-3.5 w-3.5 text-muted-foreground ml-1.5 mr-0.5 shrink-0" />
                  {MAP_STYLES.map((s) => (
                    <button
                      key={s.id}
                      onClick={() => setMapStyleId(s.id)}
                      className={`px-2.5 py-1 text-[11px] font-semibold rounded-lg transition-all ${
                        mapStyleId === s.id
                          ? "bg-primary text-primary-foreground shadow"
                          : "text-muted-foreground hover:bg-muted"
                      }`}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>

                {/* Map Legend */}
                <div className="absolute bottom-4 left-4 bg-background/90 backdrop-blur-md px-3.5 py-2.5 rounded-xl border border-border/70 shadow-lg text-xs space-y-2 z-10">
                  <p className="font-bold text-[11px] uppercase tracking-wider text-muted-foreground">
                    Navigation Legend
                  </p>
                  <div className="flex items-center gap-2">
                    <span className="h-3 w-3 rounded-full bg-destructive inline-block" />
                    <span className="font-medium text-foreground">Customer Address</span>
                  </div>
                  {riderCoords && (
                    <div className="flex items-center gap-2">
                      <span className="h-3 w-3 rounded-full bg-primary inline-block" />
                      <span className="font-medium text-foreground">You (Rider Live)</span>
                    </div>
                  )}
                </div>
              </CardContent>
              <CardFooter className="bg-muted/50 p-4 border-t flex justify-between items-center text-sm font-medium">
                <div className="flex items-center gap-2 text-primary">
                  <div className="h-2 w-2 rounded-full bg-primary animate-ping" />
                  Live GPS Active
                </div>
                <div className="text-muted-foreground">
                  Tap pins for details
                </div>
              </CardFooter>
            </Card>
          </div>

          {/* Right Column: Order Details & Actions */}
          <div className="space-y-6">
            <Card className="border-primary/20 shadow-lg overflow-hidden">
              <CardHeader className="bg-primary/5 pb-4">
                <div className="flex justify-between items-center">
                  <Badge className="bg-primary text-primary-foreground font-bold font-mono">
                    ORDER #{activeDelivery.order.id}
                  </Badge>
                  <Badge variant={activeDelivery.status === "ON_THE_WAY" ? "warning" : "default"}>
                    {activeDelivery.status.replace(/_/g, " ")}
                  </Badge>
                </div>
                <CardTitle className="text-2xl mt-4 italic">{activeDelivery.order.customer.firstName} {activeDelivery.order.customer.lastName}</CardTitle>
                <div className="flex items-center gap-2 text-primary font-bold">
                  <Phone className="h-4 w-4 shrink-0" />
                  {activeDelivery.order.customer.phone || "---"}
                </div>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                <div className="space-y-4">
                  <div className="flex items-start gap-4">
                    <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center shrink-0 border border-border">
                      <MapPin className="h-5 w-5 text-destructive" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Destination</p>
                      <p className="text-sm font-medium leading-relaxed">{activeDelivery.order.address}</p>
                      <Button 
                        variant="link" 
                        size="sm" 
                        className="h-auto p-0 text-primary font-bold mt-1"
                        onClick={() => window.open(`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(activeDelivery.order.address)}`, "_blank")}
                      >
                        <Navigation className="h-3 w-3 mr-1" />
                        Get Navigation Guide
                      </Button>
                    </div>
                  </div>
                  
                  <Separator />

                  <div className="space-y-3">
                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Order Contents</p>
                    <div className="grid gap-2">
                       {activeDelivery.order.orderItems.map((item) => (
                         <div key={item.id} className="flex justify-between items-center text-sm p-2 bg-muted/20 rounded-md border border-border/30">
                           <span className="flex items-center gap-3">
                             <div className="bg-primary/10 text-primary h-6 w-6 rounded flex items-center justify-center font-bold text-xs">{item.quantity}</div>
                             <span className="font-semibold">{item.menuItem.name}</span>
                           </span>
                           <span className="font-mono text-muted-foreground">₱{item.price.toFixed(2)}</span>
                         </div>
                       ))}
                    </div>
                  </div>
                </div>

                <div className="space-y-3 pt-4">
                   {activeDelivery.status === "PICKED_UP" && (
                     <Button 
                       className="w-full h-14 text-lg font-bold gap-3 shadow-lg shadow-amber-500/20 bg-amber-500 hover:bg-amber-600 border-none" 
                       size="lg"
                       onClick={() => handleStatusUpdate("ON_THE_WAY")}
                       disabled={updatingId === activeDelivery.id}
                     >
                       {updatingId === activeDelivery.id ? <Loader2 className="h-6 w-6 animate-spin" /> : <Navigation className="h-6 w-6" />}
                       Start Trip Navigation
                     </Button>
                   )}
                   
                   {activeDelivery.status === "ON_THE_WAY" && (
                     <Button 
                       className="w-full h-14 text-lg font-bold gap-3 shadow-lg shadow-green-500/20 bg-green-600 hover:bg-green-700 border-none" 
                       size="lg"
                       onClick={() => handleStatusUpdate("DELIVERED")}
                       disabled={updatingId === activeDelivery.id}
                     >
                       {updatingId === activeDelivery.id ? <Loader2 className="h-6 w-6 animate-spin" /> : <CheckCircle2 className="h-6 w-6" />}
                       Finish & Confirm Delivery
                     </Button>
                   )}
                </div>
              </CardContent>
            </Card>

            <div className="bg-muted/40 p-5 rounded-2xl border border-dashed border-border flex items-center gap-4">
               <div className="bg-white p-3 rounded-full shadow-sm text-primary">
                 <Truck className="h-6 w-6" />
               </div>
               <div className="text-xs text-muted-foreground leading-relaxed">
                 <p className="font-bold text-foreground">Safety First!</p>
                 <p>Don't use your phone while operating a vehicle. The map updates automatically.</p>
               </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
