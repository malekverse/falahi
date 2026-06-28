export function generateOTP(length: number = 4): string {
  const digits = new Uint8Array(length)
  crypto.getRandomValues(digits)
  return Array.from(digits, (d) => (d % 10).toString()).join('')
}

export function computeHaversineDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number,
): number {
  const R = 6371
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLng = ((lng2 - lng1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

export function estimateArrivalMinutes(
  driverLat: number,
  driverLng: number,
  destLat: number,
  destLng: number,
  avgSpeedKmh: number = 60,
): number {
  const distKm = computeHaversineDistance(driverLat, driverLng, destLat, destLng)
  return Math.round((distKm / avgSpeedKmh) * 60)
}

export function calculateCommission(
  askingPriceMillimes: number,
  commissionRate: number = 0.12,
): number {
  return Math.round(askingPriceMillimes * commissionRate)
}

export function calculateFinalPrice(
  askingPriceMillimes: number,
  commissionMillimes: number,
): number {
  return askingPriceMillimes + commissionMillimes
}
