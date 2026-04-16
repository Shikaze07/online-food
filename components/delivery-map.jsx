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
  const isCustomer = iconType === 'pin'
  
  const icon = L.divIcon({
    html: `
      <div class="relative flex items-center justify-center">
        ${!isCustomer ? '<div class="absolute inset-0 bg-primary/40 rounded-full animate-ping scale-150"></div>' : ''}
        <div class="bg-white p-1.5 rounded-full border-2 ${isCustomer ? 'border-destructive shadow-destructive/20' : 'border-primary shadow-primary/20'} shadow-xl z-10 transition-transform hover:scale-110">
          ${isCustomer 
            ? `<div class="text-destructive">
                <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                  <polyline points="9 22 9 12 15 12 15 22"></polyline>
                </svg>
              </div>` 
            : `<div class="text-primary">
                <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M7 17m-2 0a2 2 0 1 0 4 0a2 2 0 1 0 -4 0"></path>
                  <path d="M17 17m-2 0a2 2 0 1 0 4 0a2 2 0 1 0 -4 0"></path>
                  <path d="M5 17h5l1.5 -4.5h4.5l1.5 4.5h3"></path>
                  <path d="M9 9l2 4.5"></path>
                  <path d="M15 9l-2 4.5"></path>
                  <path d="M13 5m-2 0a2 2 0 1 0 4 0a2 2 0 1 0 -4 0"></path>
                </svg>
              </div>`
          }
        </div>
        <div class="absolute -bottom-1 w-2 h-2 ${isCustomer ? 'bg-destructive' : 'bg-primary'} rotate-45 transform left-1/2 -translate-x-1/2 -z-0"></div>
      </div>`,
    className: "custom-div-icon",
    iconSize: [32, 32],
    iconAnchor: [16, 32],
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
      <div className="absolute bottom-6 right-6 bg-white/95 backdrop-blur-sm p-4 rounded-2xl border border-border shadow-2xl z-[1000] space-y-3 min-w-[160px]">
        <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest border-b pb-2 mb-2">Map Legend</p>
        <div className="flex items-center gap-3 group translate-x-0 hover:translate-x-1 transition-transform">
          <div className="h-8 w-8 rounded-full bg-destructive/10 flex items-center justify-center text-destructive border border-destructive/20 shadow-sm">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
          </div>
          <span className="text-xs font-bold text-gray-700">Customer Home</span>
        </div>
        <div className="flex items-center gap-3 group translate-x-0 hover:translate-x-1 transition-transform">
          <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary border border-primary/20 shadow-sm relative">
            <div className="absolute inset-0 bg-primary/20 rounded-full animate-ping scale-110"></div>
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M7 17m-2 0a2 2 0 1 0 4 0a2 2 0 1 0 -4 0"></path><path d="M17 17m-2 0a2 2 0 1 0 4 0a2 2 0 1 0 -4 0"></path><path d="M5 17h5l1.5 -4.5h4.5l1.5 4.5h3"></path><path d="M9 9l2 4.5"></path><path d="M15 9l-2 4.5"></path><path d="M13 5m-2 0a2 2 0 1 0 4 0a2 2 0 1 0 -4 0"></path></svg>
          </div>
          <span className="text-xs font-bold text-gray-700">Rider (Live)</span>
        </div>
      </div>
    </div>
  )
}
