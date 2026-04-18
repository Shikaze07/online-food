"use client"

import { useEffect, useState, useCallback, useMemo } from "react"
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from "react-leaflet"
import L from "leaflet"
import "leaflet/dist/leaflet.css"

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
const DraggableMarker = ({ position, setPosition }) => {
  const markerIcon = useMemo(() => L.divIcon({
    html: `
      <div class="relative flex items-center justify-center">
        <div class="absolute inset-0 bg-primary/20 rounded-full animate-pulse scale-150"></div>
        <div class="bg-white p-1.5 rounded-full border-2 border-primary shadow-primary/20 shadow-xl z-10 transition-transform hover:scale-110">
          <div class="text-primary">
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
              <circle cx="12" cy="10" r="3"></circle>
            </svg>
          </div>
        </div>
        <div class="absolute -bottom-1 w-2 h-2 bg-primary rotate-45 transform left-1/2 -translate-x-1/2 -z-0"></div>
      </div>`,
    className: "custom-div-icon",
    iconSize: [32, 32],
    iconAnchor: [16, 32],
  }), []);

  const eventHandlers = useMemo(
    () => ({
      dragend(e) {
        const marker = e.target
        if (marker != null) {
          const { lat, lng } = marker.getLatLng()
          setPosition({ lat, lng })
        }
      },
    }),
    [setPosition],
  )

  return (
    <Marker
      draggable={true}
      eventHandlers={eventHandlers}
      position={position}
      icon={markerIcon}
    />
  )
}

// Map events handler to allow clicking to move pin
function MapEventsHandler({ onLocationSelect }) {
  useMapEvents({
    click(e) {
      onLocationSelect(e.latlng)
    },
  })
  return null
}

// Auto-center map when coordinates change externaly (e.g. auto-detection)
function RecenterMap({ position }) {
  const map = useMap()
  useEffect(() => {
    if (position && position.lat && position.lng) {
      map.setView(position, 16, { animate: true })
    }
  }, [position, map])
  return null
}

export default function LocationPicker({ value, onChange, className }) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    FIX_LEAFLET_ICONS()
  }, [])

  const handleLocationSelect = useCallback((latlng) => {
    onChange({ lat: latlng.lat, lng: latlng.lng })
  }, [onChange])

  if (!mounted) {
    return (
      <div className={`${className} bg-muted/20 flex flex-col items-center justify-center space-y-4 rounded-xl border border-dashed border-border min-h-[300px]`}>
        <div className="h-10 w-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-muted-foreground">Loading interactive map...</p>
      </div>
    )
  }

  // Fallback to Manila center if no location provided
  const center = value?.lat && value?.lng ? value : { lat: 14.5995, lng: 120.9842 }

  return (
    <div className={`${className} relative rounded-xl overflow-hidden border border-border shadow-inner z-0 min-h-[300px]`}>
      <MapContainer
        center={center}
        zoom={16}
        scrollWheelZoom={true}
        className="h-full w-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {value?.lat && value?.lng && (
          <DraggableMarker 
            position={value} 
            setPosition={handleLocationSelect} 
          />
        )}

        <MapEventsHandler onLocationSelect={handleLocationSelect} />
        <RecenterMap position={value} />
      </MapContainer>
      
      <div className="absolute top-4 right-4 z-[1000]">
        <div className="bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-full border border-border shadow-sm text-[10px] font-bold text-primary uppercase tracking-wider">
          Click or drag to adjust pin
        </div>
      </div>
    </div>
  )
}
