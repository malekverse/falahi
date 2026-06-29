import { z } from 'zod'

export function zodMaxLength(max: number, fieldName = 'Champ') {
  return z.string().max(max, `${fieldName} ne peut pas dépasser ${max} caractères`)
}

export const OrderCreateSchema = z.object({
  inventoryItemId: z.string().uuid(),
  quantity: z.number().positive(),
  deliveryAddress: z.string().min(5).max(500).optional(),
  deliveryNotes: z.string().max(500).optional(),
  idempotencyKey: z.string().uuid().optional(),
})

export const WhatsAppSendSchema = z.object({
  to: z.string().regex(/^216\d{8}$/, 'Must be 216XXXXXXXX (Tunisian number)'),
  message: z.string().min(1).max(4096),
})

export const InventoryUpdateSchema = z.object({
  status: z.enum(['pending_confirmation', 'available', 'reserved', 'sold', 'expired']).optional(),
  asking_price_millimes: z.number().int().positive().optional(),
  quantity: z.number().positive().optional(),
})

export const CreateGroupBuySchema = z.object({
  inventoryItemId: z.number().positive(),
  targetQuantity: z.number().positive(),
  unit: z.string().min(1).max(20),
  unitPriceMillimes: z.number().int().positive(),
  expiresInHours: z.number().int().min(1).max(168).default(48),
})

export const JoinGroupBuySchema = z.object({
  groupBuyId: z.string().uuid(),
  quantity: z.number().positive(),
})

export const TunisianPhoneSchema = z.string().transform((v) => {
  const normalized = v.startsWith('+') ? v : `+216${v.replace(/^00216/, '')}`
  return { normalized, valid: /^\+216\d{8}$/.test(normalized) }
})

export const SendWhatsAppOTPSchema = z.object({
  phone: z.string(),
})

export const VerifyWhatsAppOTPSchema = z.object({
  phone: z.string(),
  otp: z.string().length(6),
})

export const CreateSubTripSchema = z.object({
  parent_trip_id: z.string().uuid(),
})

export const AcceptSubTripSchema = z.object({
  sub_trip_id: z.string().uuid(),
})

export const ValidateSubTripOTPSchema = z.object({
  sub_trip_id: z.string().uuid(),
  otp: z.string().min(4).max(6),
})

export const CreateRecurringOrderSchema = z.object({
  orderId: z.string().uuid(),
  recurrenceInterval: z.enum(['weekly', 'biweekly', 'monthly']),
  recurrenceDay: z.number().int().min(0).max(6),
})

export const CancelRecurringOrderSchema = z.object({
  orderId: z.string().uuid(),
})

export const ValidateTripOTPSchema = z.object({
  tripId: z.string().uuid(),
  otp: z.string().min(4).max(6),
  type: z.enum(['pickup', 'delivery']),
})

export const MarketplaceQuerySchema = z.object({
  cursor: z.string().optional(),
  category: z.string().max(50).optional(),
  region: z.string().max(100).optional(),
  minPrice: z.coerce.number().nonnegative().optional(),
  maxPrice: z.coerce.number().nonnegative().optional(),
})

export type OrderCreateInput = z.infer<typeof OrderCreateSchema>
export type WhatsAppSendInput = z.infer<typeof WhatsAppSendSchema>
export type InventoryUpdateInput = z.infer<typeof InventoryUpdateSchema>
export type SendWhatsAppOTPInput = z.infer<typeof SendWhatsAppOTPSchema>
export type VerifyWhatsAppOTPInput = z.infer<typeof VerifyWhatsAppOTPSchema>
export type CreateSubTripInput = z.infer<typeof CreateSubTripSchema>
export type AcceptSubTripInput = z.infer<typeof AcceptSubTripSchema>
export type ValidateSubTripOTPInput = z.infer<typeof ValidateSubTripOTPSchema>
export type CreateRecurringOrderInput = z.infer<typeof CreateRecurringOrderSchema>
export type CancelRecurringOrderInput = z.infer<typeof CancelRecurringOrderSchema>
export type ValidateTripOTPInput = z.infer<typeof ValidateTripOTPSchema>
export type MarketplaceQuery = z.infer<typeof MarketplaceQuerySchema>
