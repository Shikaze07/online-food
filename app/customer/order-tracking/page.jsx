"use client"

import { useState, useEffect, useRef, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { getCustomerActiveOrder, getCustomerOrders } from "@/lib/actions/order-actions"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { OrderStatusBadge } from "@/app/admin/order-management/components/order-status-badge"
import Link from "next/link"
import dynamic from "next/dynamic"
import {
  Pizza,
  ChefHat,
  Truck,
  CheckCircle2,
  Check,
  Clock,
  Phone,
  MapPin,
  RefreshCw,
  ShoppingBag,
  ArrowRight,
  AlertCircle,
  ShieldCheck,
  UserCheck,
  Layers,
} from "lucide-react"

import {
  Map,
  MapControls,
  MapMarker,
  MarkerContent,
  MarkerPopup,
} from "@/components/ui/map"

const STEPS = [
  {
    status: "PENDING",
    label: "Order Placed",
    desc: "We received your pizza order & sent it to the kitchen",
    icon: Clock,
  },
  {
    status: "PREPARING",
    label: "Baking in Oven",
    desc: "Our pizza chefs are kneading dough, topping, & stone-baking",
    icon: ChefHat,
  },
  {
    status: "OUT_FOR_DELIVERY",
    label: "Rider on the Way",
    desc: "Fresh, piping hot pizza is in the thermal box heading to you",
    icon: Truck,
  },
  {
    status: "COMPLETED",
    label: "Delivered",
    desc: "Arrived at your doorstep. Enjoy every slice!",
    icon: CheckCircle2,
  },
]

const OSM_STYLE = {
  version: 8,
  sources: {
    osm: {
      type: "raster",
      tiles: ["https://tile.openstreetmap.org/{z}/{x}/{y}.png"],
      tileSize: 256,
      attribution: "© <a href='https://www.openstreetmap.org/copyright'>OpenStreetMap</a> contributors",
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
      attribution: "Tiles © Esri — Source: Esri, USGS, AEX, GeoEye, Aerogrid, IGN",
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

function TrackerContent() {
  const searchParams = useSearchParams()
  const orderIdParam = searchParams.get("orderId")

  const [order, setOrder] = useState(null)
  const [allOrders, setAllOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [mapStyleId, setMapStyleId] = useState("street")

  const inFlight = useRef(false)
  const mounted = useRef(true)

  const loadData = async (isManualRefresh = false) => {
    if (inFlight.current) return
    inFlight.current = true
    if (isManualRefresh) setRefreshing(true)
    else setLoading(true)

    try {
      const [activeRes, allRes] = await Promise.all([
        getCustomerActiveOrder(orderIdParam),
        getCustomerOrders(),
      ])
      if (!mounted.current) return

      if (activeRes?.order) {
        setOrder(activeRes.order)
      } else if (allRes?.orders && allRes.orders.length > 0) {
        setOrder(allRes.orders[0])
      } else {
        setOrder(null)
      }

      if (allRes?.orders) {
        setAllOrders(allRes.orders)
      }
    } catch (e) {
      console.error("Failed to load order data", e)
    } finally {
      inFlight.current = false
      if (mounted.current) {
        setLoading(false)
        setRefreshing(false)
      }
    }
  }

  useEffect(() => {
    mounted.current = true
    loadData()
    // Auto-poll every 30s, only while the tab is visible
    const timer = setInterval(() => {
      if (document.visibilityState === "visible") loadData(true)
    }, 30000)
    return () => {
      mounted.current = false
      clearInterval(timer)
    }
  }, [orderIdParam])

  const getStepIndex = (status) => {
    switch (status) {
      case "PENDING":
        return 0
      case "PREPARING":
        return 1
      case "OUT_FOR_DELIVERY":
        return 2
      case "COMPLETED":
        return 3
      case "CANCELLED":
        return -1
      default:
        return 0
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto p-6 md:p-8 max-w-5xl space-y-6 animate-pulse">
        <div className="h-10 w-64 bg-muted rounded-lg" />
        <div className="h-4 w-96 bg-muted/60 rounded" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-4">
          <div className="lg:col-span-2 h-96 bg-muted/40 rounded-2xl border" />
          <div className="h-96 bg-muted/40 rounded-2xl border" />
        </div>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="container mx-auto p-6 md:p-8 max-w-3xl">
        <Card className="text-center py-16 px-4 border-dashed bg-card/50">
          <CardContent className="flex flex-col items-center justify-center space-y-4">
            <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center text-primary">
              <Pizza className="h-10 w-10" />
            </div>
            <div className="space-y-1">
              <h2 className="text-2xl font-bold">No active pizza orders to track</h2>
              <p className="text-muted-foreground text-sm max-w-sm mx-auto">
                Once you order from Albertoz Pizza, you can monitor the live preparation, baking, and rider delivery here!
              </p>
            </div>
            <Button asChild size="lg" className="mt-2 font-semibold">
              <Link href="/customer/menu">Browse Pizza Menu</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const currentStep = getStepIndex(order.status)
  const isCancelled = order.status === "CANCELLED"

  // Delivery coords
  const customerCoords =
    order.lat && order.lng
      ? { lat: order.lat, lng: order.lng }
      : { lat: 6.5034, lng: 124.8465 } // Koronadal City default

  let riderCoords = null
  if (order.delivery?.currentLocation) {
    try {
      const parsed = JSON.parse(order.delivery.currentLocation)
      if (parsed && typeof parsed.lat === "number" && typeof parsed.lng === "number") {
        riderCoords = parsed
      } else if (typeof order.delivery.currentLocation === "string" && order.delivery.currentLocation.includes(",")) {
        const [latStr, lngStr] = order.delivery.currentLocation.split(",")
        const lat = parseFloat(latStr.trim())
        const lng = parseFloat(lngStr.trim())
        if (!isNaN(lat) && !isNaN(lng)) {
          riderCoords = { lat, lng }
        }
      }
    } catch {
      if (typeof order.delivery?.currentLocation === "string" && order.delivery.currentLocation.includes(",")) {
        const [latStr, lngStr] = order.delivery.currentLocation.split(",")
        const lat = parseFloat(latStr.trim())
        const lng = parseFloat(lngStr.trim())
        if (!isNaN(lat) && !isNaN(lng)) {
          riderCoords = { lat, lng }
        }
      }
    }
  }

  // riderCoords is only shown when real GPS data is available from the rider
  // No mock/fallback offset to avoid inaccuracy

  return (
    <div className="container mx-auto p-6 md:p-8 max-w-5xl space-y-8 animate-in fade-in duration-300">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/60 pb-6">
        <div>
          <div className="flex items-center gap-2 text-primary font-semibold mb-1">
            <Truck className="h-5 w-5" />
            <span className="text-sm uppercase tracking-wider">Live Pizza Tracker</span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight flex items-center gap-3">
            Tracking Order #{order.id}
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Real-time status updates from Albertoz oven to your doorstep.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <Button
            variant="outline"
            size="sm"
            onClick={() => loadData(true)}
            disabled={refreshing}
            className="gap-2 h-9 text-xs"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? "animate-spin" : ""}`} />
            Refresh Status
          </Button>
          <Button asChild size="sm" variant="secondary" className="h-9 text-xs">
            <Link href="/customer/order-history">All Past Orders</Link>
          </Button>
        </div>
      </div>

      {/* Progress Stepper Card */}
      <Card className="border-border/60 shadow-sm overflow-hidden bg-card/70 backdrop-blur-sm">
        <CardHeader className="bg-muted/30 pb-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <CardTitle className="text-lg font-bold flex items-center gap-2">
                <span>Kitchen & Delivery Progress</span>
                {refreshing && <span className="text-xs font-normal text-muted-foreground animate-pulse">Checking updates...</span>}
              </CardTitle>
              <CardDescription>
                Placed on{" "}
                {new Date(order.createdAt).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </CardDescription>
            </div>
            <OrderStatusBadge status={order.status} />
          </div>
        </CardHeader>

        <CardContent className="p-6 md:p-8">
          {isCancelled ? (
            <div className="p-6 rounded-2xl bg-destructive/10 border border-destructive/20 text-center space-y-2">
              <AlertCircle className="h-10 w-10 text-destructive mx-auto" />
              <h3 className="font-bold text-destructive text-lg">Order Has Been Cancelled</h3>
              <p className="text-sm text-muted-foreground max-w-md mx-auto">
                This pizza order was cancelled. Please feel free to place another order from our menu.
              </p>
              <Button asChild className="mt-2" size="sm">
                <Link href="/customer/menu">Browse Menu</Link>
              </Button>
            </div>
          ) : (
            <div className="relative py-2">
              <ol className="grid grid-cols-1 md:grid-cols-4">
                {STEPS.map((step, index) => {
                  const Icon = step.icon
                  const isLast = index === STEPS.length - 1
                  const isPast = currentStep > index
                  const isCurrent = currentStep === index
                  const isFinished = isCurrent && order.status === "COMPLETED"
                  const isFuture = currentStep < index

                  return (
                    <li
                      key={step.status}
                      className={`relative flex md:flex-col items-start md:items-center gap-4 md:gap-3 md:px-3 ${isLast ? "" : "pb-8 md:pb-0"
                        }`}
                    >
                      {/* Connector: vertical on mobile, horizontal on desktop.
                          Starts at this icon's center and ends at the next icon's center. */}
                      {!isLast && (
                        <div
                          aria-hidden
                          className="absolute z-0 overflow-hidden rounded-full bg-muted
                                     left-7 top-7 h-full w-[3px] -translate-x-1/2
                                     md:left-1/2 md:top-7 md:h-[3px] md:w-full md:translate-x-0 md:-translate-y-1/2"
                        >
                          <div
                            className={`h-full w-full bg-primary origin-top md:origin-left transition-transform duration-700 ease-out ${isPast
                              ? "scale-y-100 md:scale-x-100 md:scale-y-100"
                              : "scale-y-0 md:scale-x-0 md:scale-y-100"
                              }`}
                          />
                        </div>
                      )}

                      {/* Icon bubble (solid backgrounds so the connector never shows through) */}
                      <div className="relative z-10 shrink-0">
                        {isCurrent && !isFinished && (
                          <span className="absolute inset-0 rounded-2xl bg-primary/30 animate-ping" />
                        )}
                        <div
                          className={`relative h-14 w-14 rounded-2xl flex items-center justify-center border-2 transition-all duration-300 ${isPast || isFinished
                            ? "bg-primary text-primary-foreground border-primary shadow-md shadow-primary/20"
                            : isCurrent
                              ? "bg-background text-primary border-primary ring-4 ring-primary/20 shadow-lg shadow-primary/20 scale-105"
                              : "bg-background text-muted-foreground border-border"
                            }`}
                        >
                          {isPast || isFinished ? (
                            <Check className="h-6 w-6 stroke-[3]" />
                          ) : (
                            <Icon className="h-6 w-6 stroke-[2.2]" />
                          )}
                        </div>
                      </div>

                      {/* Text */}
                      <div
                        className={`min-w-0 space-y-1 pt-1 md:pt-0 transition-opacity ${isFuture ? "opacity-50" : "opacity-100"
                          }`}
                      >
                        <div className="flex items-center gap-1.5 md:justify-center">
                          <span
                            className={`font-bold text-sm ${isCurrent ? "text-primary" : "text-foreground"
                              }`}
                          >
                            {step.label}
                          </span>
                          {isCurrent && !isFinished && (
                            <span className="relative flex h-2 w-2">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
                              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground leading-relaxed md:max-w-[190px] md:mx-auto">
                          {step.desc}
                        </p>
                      </div>
                    </li>
                  )
                })}
              </ol>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Main Grid: Map & Order Details */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        {/* Left Column: Live Map & Rider Details */}
        <div className="lg:col-span-3 space-y-6">
          <Card className="border-border/60 shadow-sm overflow-hidden bg-card/60">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-bold flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-primary" />
                  Delivery Route Map
                </CardTitle>
                <Badge variant="outline" className="text-xs font-normal">
                  Koronadal City
                </Badge>
              </div>
              <CardDescription className="text-xs line-clamp-1">
                Destination: {order.address || "Customer Address"}
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="h-[360px] w-full overflow-hidden relative">
                <Map
                  center={[
                    riderCoords?.lng ?? customerCoords.lng,
                    riderCoords?.lat ?? customerCoords.lat,
                  ]}
                  zoom={14}
                  styles={MAP_STYLES.find((s) => s.id === mapStyleId)?.styles}
                  className="h-full w-full"
                >
                  <MapControls position="top-right" showZoom showCompass showFullscreen showLocate />

                  {/* Customer Marker */}
                  <MapMarker
                    longitude={customerCoords.lng}
                    latitude={customerCoords.lat}
                  >
                    <MarkerContent>
                      <div className="flex items-center justify-center p-2 rounded-full bg-destructive text-white shadow-xl ring-4 ring-destructive/20 hover:scale-110 transition-transform cursor-pointer">
                        <MapPin className="h-5 w-5" />
                      </div>
                    </MarkerContent>
                    <MarkerPopup>
                      <div className="p-2 space-y-1 text-xs">
                        <p className="font-bold text-foreground">Delivery Destination</p>
                        <p className="text-muted-foreground">{order.address || "Customer Location"}</p>
                      </div>
                    </MarkerPopup>
                  </MapMarker>

                  {/* Rider Marker */}
                  {riderCoords && (
                    <MapMarker
                      longitude={riderCoords.lng}
                      latitude={riderCoords.lat}
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
                          <p className="font-bold text-primary">Rider Current Location</p>
                          <p className="text-muted-foreground">
                            {order.delivery?.deliveryPerson?.firstName
                              ? `${order.delivery.deliveryPerson.firstName} (Albertoz Delivery)`
                              : "Active Rider"}
                          </p>
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
                    Map Guide
                  </p>
                  <div className="flex items-center gap-2">
                    <span className="h-3 w-3 rounded-full bg-destructive inline-block" />
                    <span className="font-medium text-foreground">Delivery Address</span>
                  </div>
                  {riderCoords ? (
                    <div className="flex items-center gap-2">
                      <span className="h-3 w-3 rounded-full bg-primary inline-block" />
                      <span className="font-medium text-foreground">Active Rider Location</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-muted-foreground/70 italic">
                      <span className="h-3 w-3 rounded-full bg-muted-foreground/40 inline-block" />
                      <span>Awaiting rider GPS...</span>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Assigned Rider Info Card */}
          {order.delivery?.deliveryPerson ? (
            <Card className="border-primary/30 bg-primary/5 shadow-sm">
              <CardContent className="p-5 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-base">
                    {order.delivery.deliveryPerson.firstName?.[0] || "R"}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-foreground">
                        {order.delivery.deliveryPerson.firstName} {order.delivery.deliveryPerson.lastName}
                      </span>
                      <Badge className="bg-primary text-[10px] py-0 h-4">Assigned Rider</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Albertoz Fast Delivery Team
                    </p>
                  </div>
                </div>

                {order.delivery.deliveryPerson.phone && (
                  <Button asChild size="sm" variant="outline" className="gap-2 text-xs font-semibold">
                    <a href={`tel:${order.delivery.deliveryPerson.phone}`}>
                      <Phone className="h-3.5 w-3.5 text-primary" />
                      Call Rider
                    </a>
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="p-4 rounded-xl border border-dashed border-border text-center text-xs text-muted-foreground bg-muted/20">
              Rider will be assigned once pizza preparation is finished.
            </div>
          )}
        </div>

        {/* Right Column: Order Basket Summary */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-border/60 shadow-sm bg-card/60">
            <CardHeader className="pb-3 border-b border-border/40">
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <ShoppingBag className="h-4 w-4 text-primary" />
                Pizza Basket Details
              </CardTitle>
            </CardHeader>
            <CardContent className="p-5 space-y-4">
              <div className="space-y-2.5">
                {order.orderItems?.map((item) => (
                  <div key={item.id} className="flex items-center justify-between text-sm py-1">
                    <div className="flex items-center gap-2.5">
                      <span className="font-bold text-xs text-primary bg-primary/10 px-2 py-0.5 rounded">
                        {item.quantity}x
                      </span>
                      <div>
                        <p className="font-medium text-foreground text-xs leading-tight">
                          {item.menuItem?.name || "Pizza Item"}
                        </p>
                        <p className="text-[11px] text-muted-foreground">
                          ₱{item.price.toFixed(2)} each
                        </p>
                      </div>
                    </div>
                    <span className="font-semibold text-xs text-foreground">
                      ₱{(item.price * item.quantity).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>

              <Separator />

              <div className="space-y-2 text-xs">
                <div className="flex justify-between text-muted-foreground">
                  <span>Subtotal:</span>
                  <span>₱{Number(order.totalAmount).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Delivery Fee:</span>
                  <span className="text-emerald-600 font-medium">FREE</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Payment Mode:</span>
                  <span className="font-medium text-foreground">{order.payment?.method || "COD"}</span>
                </div>
                <Separator />
                <div className="flex justify-between items-center text-sm font-bold pt-1">
                  <span>Total Amount:</span>
                  <span className="text-lg text-primary font-black">
                    ₱{Number(order.totalAmount).toFixed(2)}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Switch to Other Orders */}
          {allOrders.length > 1 && (
            <Card className="border-border/60 bg-muted/20">
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Your Other Orders
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-1 space-y-2">
                {allOrders
                  .filter((o) => o.id !== order.id)
                  .slice(0, 3)
                  .map((other) => (
                    <Link
                      key={other.id}
                      prefetch={false}
                      href={`/customer/order-tracking?orderId=${other.id}`}
                      className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/80 text-xs transition-colors border border-transparent hover:border-border"
                    >
                      <div>
                        <span className="font-bold">Order #{other.id}</span>
                        <span className="text-muted-foreground ml-2">
                          {new Date(other.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <OrderStatusBadge status={other.status} />
                    </Link>
                  ))}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}

export default function OrderTrackingPage() {
  return (
    <Suspense
      fallback={
        <div className="container mx-auto p-6 md:p-8 max-w-5xl space-y-6 animate-pulse">
          <div className="h-10 w-64 bg-muted rounded-lg" />
          <div className="h-4 w-96 bg-muted/60 rounded" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-4">
            <div className="lg:col-span-2 h-96 bg-muted/40 rounded-2xl border" />
            <div className="h-96 bg-muted/40 rounded-2xl border" />
          </div>
        </div>
      }
    >
      <TrackerContent />
    </Suspense>
  )
}