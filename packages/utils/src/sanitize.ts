export function sanitizeText(input: string, maxLength = 500): string {
  return input
    .trim()
    .slice(0, maxLength)
    .replace(/<[^>]*>/g, '')
    .replace(/[<>]/g, '')
}

export function sanitizePhone(input: string): string {
  return input.replace(/[^\d+]/g, '').slice(0, 15)
}

export function sanitizePlate(input: string): string {
  return input
    .toUpperCase()
    .replace(/[^A-Z0-9\s-]/g, '')
    .slice(0, 12)
    .trim()
}

export const MAX_LENGTHS = {
  fullName: 100,
  cinNumber: 8,
  vehiclePlate: 12,
  productName: 200,
  locationName: 200,
  deliveryAddress: 500,
  reviewText: 1000,
  description: 2000,
} as const

export function clampLength(input: string, max: number): string {
  return input.slice(0, max)
}

export function sanitizeWithMaxLength(input: string, maxKey: keyof typeof MAX_LENGTHS): string {
  return sanitizeText(input, MAX_LENGTHS[maxKey])
}
