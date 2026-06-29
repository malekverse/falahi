import { describe, it, expect } from 'vitest'
import { calculateDiscount } from '../discount'

describe('calculateDiscount', () => {
  it('returns null when expiresAt is null', () => {
    expect(calculateDiscount(10000, null)).toBeNull()
  })

  it('returns null when expiresAt is in the past', () => {
    const past = new Date(Date.now() - 3600000).toISOString()
    expect(calculateDiscount(10000, past)).toBeNull()
  })

  it('returns 10% discount for 18h until expiry (12-24h tier)', () => {
    const future = new Date(Date.now() + 18 * 3600000).toISOString()
    const result = calculateDiscount(10000, future)
    expect(result!.discountPercent).toBe(10)
    expect(result!.discountedPriceMillimes).toBe(9000)
  })

  it('returns 20% discount for 9h until expiry (6-12h tier)', () => {
    const future = new Date(Date.now() + 9 * 3600000).toISOString()
    const result = calculateDiscount(10000, future)
    expect(result!.discountPercent).toBe(20)
    expect(result!.discountedPriceMillimes).toBe(8000)
  })

  it('returns 35% discount for 3h until expiry (0-6h tier)', () => {
    const future = new Date(Date.now() + 3 * 3600000).toISOString()
    const result = calculateDiscount(10000, future)
    expect(result!.discountPercent).toBe(35)
    expect(result!.discountedPriceMillimes).toBe(6500)
  })

  it('rounds discounted price to integer millimes', () => {
    const future = new Date(Date.now() + 3 * 3600000).toISOString()
    const result = calculateDiscount(3333, future)
    expect(Number.isInteger(result!.discountedPriceMillimes)).toBe(true)
  })
})
