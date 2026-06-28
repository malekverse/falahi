import { z } from 'zod'

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

export type OrderCreateInput = z.infer<typeof OrderCreateSchema>
export type WhatsAppSendInput = z.infer<typeof WhatsAppSendSchema>
export type InventoryUpdateInput = z.infer<typeof InventoryUpdateSchema>
