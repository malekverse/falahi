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
