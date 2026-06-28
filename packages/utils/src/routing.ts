const EARTH_RADIUS_M = 6_371_000

function toRad(deg: number): number {
  return (deg * Math.PI) / 180
}

export function haversineDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number,
): number {
  const dLat = toRad(lat2 - lat1)
  const dLng = toRad(lng2 - lng1)
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2
  return EARTH_RADIUS_M * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

export function isWithinGeofence(
  lat: number,
  lng: number,
  centerLat: number,
  centerLng: number,
  radiusMeters: number,
): boolean {
  return haversineDistance(lat, lng, centerLat, centerLng) <= radiusMeters
}

export type DriverRole = 'long_haul' | 'courier'
export type DestinationType = 'hub' | 'buyer'

export interface RoutingValidationResult {
  valid: boolean
  reason: string | null
}

export function validateTripRouting(
  driverRole: DriverRole,
  hubId: string | null,
  destinationType: DestinationType,
): RoutingValidationResult {
  if (driverRole === 'long_haul') {
    if (destinationType !== 'hub') {
      return {
        valid: false,
        reason: 'Les trajets longue distance doivent terminer au hub, pas chez l\'acheteur',
      }
    }
    if (!hubId) {
      return {
        valid: false,
        reason: 'Un hub doit être assigné pour les trajets longue distance',
      }
    }
  }

  if (driverRole === 'courier') {
    if (destinationType === 'hub') {
      return {
        valid: false,
        reason: 'Les coursiers ne peuvent pas livrer au hub',
      }
    }
  }

  return { valid: true, reason: null }
}

export interface OrderWithLocation {
  id: string
  delivery_zone_id: string | null
  delivery_address: string | null
  buyer_id: string
}

export interface ZoneGroup {
  zoneId: string
  zoneName: string
  orders: OrderWithLocation[]
}

export function groupOrdersByZone(
  orders: OrderWithLocation[],
  zones: { id: string; name: string }[],
): ZoneGroup[] {
  const zoneMap = new Map<string, ZoneGroup>()
  for (const zone of zones) {
    zoneMap.set(zone.id, { zoneId: zone.id, zoneName: zone.name, orders: [] })
  }

  const unknownZone: ZoneGroup = { zoneId: 'unknown', zoneName: 'Sans zone', orders: [] }

  for (const order of orders) {
    if (order.delivery_zone_id && zoneMap.has(order.delivery_zone_id)) {
      zoneMap.get(order.delivery_zone_id)!.orders.push(order)
    } else {
      unknownZone.orders.push(order)
    }
  }

  const result = [...zoneMap.values()].filter((g) => g.orders.length > 0)
  if (unknownZone.orders.length > 0) {
    result.push(unknownZone)
  }
  return result
}
