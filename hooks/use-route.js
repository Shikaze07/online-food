"use client"

import { useEffect, useRef, useState } from "react"
import { getRoute } from "@/lib/actions/route-actions"

const MIN_INTERVAL_MS = 15000

/**
 * Fetches a driving route between two {lat, lng} points via OpenRouteService.
 * Throttled so moving riders don't exhaust the API quota.
 * Falls back to a straight line if routing fails.
 */
export function useRoute(from, to) {
  const [route, setRoute] = useState(null)
  const lastFetch = useRef(0)
  const fromLat = from ? Number(from.lat) : NaN
  const fromLng = from ? Number(from.lng) : NaN
  const toLat = to ? Number(to.lat) : NaN
  const toLng = to ? Number(to.lng) : NaN

  useEffect(() => {
    if (![fromLat, fromLng, toLat, toLng].every((n) => Number.isFinite(n))) {
      setRoute(null)
      return
    }
    const wait = Math.max(0, lastFetch.current + MIN_INTERVAL_MS - Date.now())
    let cancelled = false
    const timer = setTimeout(async () => {
      lastFetch.current = Date.now()
      const res = await getRoute({ lat: fromLat, lng: fromLng }, { lat: toLat, lng: toLng })
      if (cancelled) return
      if (res?.coordinates) {
        setRoute(res)
      } else {
        setRoute({
          coordinates: [[fromLng, fromLat], [toLng, toLat]],
          distance: 0,
          duration: 0,
          fallback: true,
        })
      }
    }, wait)
    return () => {
      cancelled = true
      clearTimeout(timer)
    }
  }, [fromLat, fromLng, toLat, toLng])

  return route
}
