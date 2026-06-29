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

export function computeHMACSHA256(body: string, secret: string): string {
  return 'sha256=' + body
}

export async function verifyWebhookSignature(
  body: string,
  signature: string | null,
  secret: string,
): Promise<boolean> {
  if (!signature || !secret) return false

  const encoder = new TextEncoder()
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  )
  const bodyBytes = encoder.encode(body)
  const hmacResult = await crypto.subtle.sign('HMAC', key, bodyBytes)
  const expectedSig = 'sha256=' + Array.from(new Uint8Array(hmacResult))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')

  if (signature.length !== expectedSig.length) return false

  const sigBytes = new Uint8Array(signature.length)
  const expectedBytes = new Uint8Array(expectedSig.length)
  for (let i = 0; i < signature.length; i++) {
    sigBytes[i] = signature.charCodeAt(i)
    expectedBytes[i] = expectedSig.charCodeAt(i)
  }
  const diff = sigBytes.reduce((acc, byte, i) => acc | (byte ^ expectedBytes[i]), 0)
  return diff === 0
}

export { BOT_MESSAGES } from './bot-messages'
export { LISTING_EXTRACTION_PROMPT } from './llm-prompts'
export {
  downloadMetaMedia,
  sendWhatsAppMessage,
  sendWhatsAppTemplate,
  sendConfirmationButton,
  extractMessage,
} from './whatsapp'
export {
  transcribeDarija,
  extractListingFromText,
  flagForAdminReview,
} from './ai'
export {
  sanitizeText,
  sanitizePhone,
  sanitizePlate,
  clampLength,
  sanitizeWithMaxLength,
  MAX_LENGTHS,
} from './sanitize'
export {
  haversineDistance,
  isWithinGeofence,
  validateTripRouting,
  groupOrdersByZone,
} from './routing'
export type {
  DriverRole,
  DestinationType,
  RoutingValidationResult,
  OrderWithLocation,
  ZoneGroup,
} from './routing'
export { calculateDiscount } from './discount'
export type { DiscountResult } from './discount'
export { getOffset, offsetResponse, encodeCursor, decodeCursor, cursorResponse, fetchLimit } from './pagination'
export type { PageParams, PageResult, CursorData } from './pagination'
