"use server";

import { prisma } from "@/lib/prisma";

/**
 * Fetch a driving route from OpenRouteService.
 * from/to are { lat, lng }. Returns coordinates as [lng, lat][] plus distance (m) and duration (s).
 */
export async function getRoute(from, to) {
  try {
    const key = process.env.ORS_API_KEY;
    if (!key) return { error: "Routing is not configured" };
    if (![from?.lat, from?.lng, to?.lat, to?.lng].every((n) => Number.isFinite(n))) {
      return { error: "Invalid coordinates" };
    }

    const res = await fetch("https://api.openrouteservice.org/v2/directions/driving-car/geojson", {
      method: "POST",
      headers: {
        Authorization: key,
        "Content-Type": "application/json",
        Accept: "application/geo+json",
      },
      body: JSON.stringify({
        coordinates: [
          [from.lng, from.lat],
          [to.lng, to.lat],
        ],
      }),
      cache: "no-store",
    });

    if (!res.ok) return { error: `Routing failed (${res.status})` };
    const data = await res.json();
    const feature = data?.features?.[0];
    if (!feature) return { error: "No route found" };

    return {
      coordinates: feature.geometry.coordinates,
      distance: feature.properties?.summary?.distance ?? 0,
      duration: feature.properties?.summary?.duration ?? 0,
    };
  } catch (error) {
    console.error("Failed to fetch route:", error);
    return { error: "Failed to fetch route" };
  }
}

/** Save the rider's live position so the customer can see it. */
export async function updateRiderLocation(deliveryId, lat, lng) {
  try {
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) return { error: "Invalid coordinates" };
    await prisma.delivery.update({
      where: { id: parseInt(deliveryId) },
      data: { currentLocation: `${lat},${lng}` },
      select: { id: true },
    });
    return { success: true };
  } catch (error) {
    console.error("Failed to update rider location:", error);
    return { error: "Failed to update location" };
  }
}
