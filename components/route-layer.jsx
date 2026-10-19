"use client"

import { MapRoute } from "@/components/ui/map"
import { useRoute } from "@/hooks/use-route"

/**
 * Draws a driving route line between two {lat, lng} points. Render inside <Map>.
 */
export function RouteLayer({ from, to }) {
  const route = useRoute(from, to)
  if (!route?.coordinates?.length) return null
  return (
    <>
      <MapRoute
        id="delivery-route-casing"
        coordinates={route.coordinates}
        color="#ffffff"
        width={9}
        opacity={0.9}
        interactive={false}
      />
      <MapRoute
        id="delivery-route"
        coordinates={route.coordinates}
        color="#2563eb"
        width={5}
        opacity={0.95}
        dashArray={route.fallback ? [2, 2] : undefined}
        interactive={false}
      />
    </>
  )
}
