"use client"

import { useEffect, useState } from "react"
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet"
import L from "leaflet"
import "leaflet/dist/leaflet.css"
import { MapPin, Navigation } from "lucide-react"

// Fix for default marker icons in Leaflet with Next.js
const FIX_LEAFLET_ICONS = () => {
  delete L.Icon.Default.prototype._getIconUrl
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
    iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
    shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  })
}

// Custom Marker component
const CustomMarker = ({ position, label, iconType = "pin" }) => {
  const icon = L.divIcon({
    html: `<div class="bg-white p-1 rounded-full border-2 ${iconType === 'pin' ? 'border-destructive' : 'border-primary'} shadow-lg transform -translate-x-1/2 -translate-y-full">
            ${iconType === 'pin' ? '<div class="text-destructive"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg></div>' : '<div class="text-primary"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="3 11 22 2 13 21 11 13 3 11"/></svg></div>'}
          </div>`,
    className: "custom-div-icon",
    iconSize: [0, 0],
  })

  return (
    <Marker position={position} icon={icon}>
      <Popup className="rounded-lg font-medium shadow-xl">
        {label}
      </Popup>
    </Marker>
  )
}

// Auto-center map when coordinates change
function RecenterMap({ position }) {
  const map = useMap()
  useEffect(() => {
    if (position) {
      map.setView(position, 15)
    }
  }, [position, map])
  return null
}

export function DeliveryMap({ customerLocation, riderLocation, className }) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    FIX_LEAFLET_ICONS()
  }, [])

  if (!mounted) {
    return (
      <div className={`${className} bg-muted/20 flex flex-col items-center justify-center space-y-4 rounded-xl border border-dashed border-border`}>
        <div className="h-10 w-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-muted-foreground animate-pulse">Initializing map engine...</p>
      </div>
    )
  }

  // Fallback to Manila center if no location provided
  const center = customerLocation || [14.5995, 120.9842]

  return (
    <div className={`${className} relative rounded-xl overflow-hidden border border-border shadow-inner z-0`}>
      <MapContainer
        center={center}
        zoom={15}
        scrollWheelZoom={true}
        className="h-full w-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {customerLocation && (
          <CustomMarker position={customerLocation} label="Customer Location" iconType="pin" />
        )}

        {riderLocation && (
          <CustomMarker position={riderLocation} label="Your Current Location" iconType="rider" />
        )}

        <RecenterMap position={center} />
      </MapContainer>

      {/* Map Legend/Overlay */}
      <div className="absolute bottom-4 right-4 bg-white/90 backdrop-blur p-3 rounded-lg border border-border/50 shadow-xl z-[1000] space-y-2 text-xs font-semibold uppercase tracking-wider">
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-destructive" />
          <span>Customer Point</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-primary" />
          <span>Your Progress</span>
        </div>
      </div>
    </div>
  )
}
