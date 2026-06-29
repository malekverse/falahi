export interface DiscountResult {
  discountPercent: number
  discountedPriceMillimes: number
  label: string
}

const DISCOUNT_TIERS = [
  { hoursUntilExpiry: 6, percent: 35, label: '-35% (très bientôt périmé)' },
  { hoursUntilExpiry: 12, percent: 20, label: '-20% (dernières heures)' },
  { hoursUntilExpiry: 24, percent: 10, label: '-10% (dernier jour)' },
  { hoursUntilExpiry: 0, percent: 0, label: '' },
]

export function calculateDiscount(
  priceMillimes: number,
  expiresAt: string | null,
): DiscountResult | null {
  if (!expiresAt) return null

  const expiresAtDate = new Date(expiresAt)
  const now = new Date()
  const hoursUntilExpiry =
    (expiresAtDate.getTime() - now.getTime()) / (1000 * 60 * 60)

  if (hoursUntilExpiry <= 0) return null

  for (const tier of DISCOUNT_TIERS) {
    if (hoursUntilExpiry <= tier.hoursUntilExpiry) {
      if (tier.percent === 0) return null
      const discountAmount = Math.round(priceMillimes * (tier.percent / 100))
      return {
        discountPercent: tier.percent,
        discountedPriceMillimes: priceMillimes - discountAmount,
        label: tier.label,
      }
    }
  }

  return null
}
